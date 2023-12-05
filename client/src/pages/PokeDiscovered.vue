<template>
  <div class="discovered-card-container">
    <div v-for="(alert, index) in activeAlerts" :key="index" class="card">
      <!-- Card Image -->
      <div class="card-image">
        <img :src="alert.image" alt="Card Image">
      </div>
      <!-- Card Content -->
      <div class="card-content">
        <h3>{{ alert.name }}</h3>
        <p>Attack Damage: {{ alert.attackDamage }}</p>
        <p>HP: {{ alert.hp }}</p>
      </div>
      <!-- Card Actions -->
      <div class="card-action">
        <button @click="addToCollection(index)">Add to Collection</button>
        <button @click="decline(index)">No, Thanks</button>
      </div>
    </div>
  </div>
  <div v-if="activeAlerts.length === 0">
    <p>No current PokeAlerts.</p>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@vue/apollo-composable';

const POKE_ALERT_QUERY = gql`
  query PokeAlert {
    pokeAlert {
      card {
        id
        images { small }
        name
        attack { damage }
        hp
      }
      discoveredAt
      expiresAt
    }
  }
`;

const CLAIM_POKE_ALERT_MUTATION = gql`
  mutation ClaimPokeAlert {
    claimPokeAlert
  }
`;

const DELETE_POKE_ALERT_MUTATION = gql`
  mutation DeletePokeAlert {
    deletePokeAlert
  }
`;

export default {
  name: 'DiscoveredCardPage',
  setup() {
    const activeAlerts = ref([]);
    const { result, refetch } = useQuery(POKE_ALERT_QUERY);
    const { mutate: claimPokeAlert } = useMutation(CLAIM_POKE_ALERT_MUTATION);
    const { mutate: deletePokeAlert } = useMutation(DELETE_POKE_ALERT_MUTATION);

    const fetchAlerts = () => {
      refetch().then(response => {
        const now = new Date();
        if (response && response.data && response.data.pokeAlert) {
          const newAlert = response.data.pokeAlert;
          const expiresAt = new Date(newAlert.expiresAt);
          if (now < expiresAt && !activeAlerts.value.some(alert => alert.id === newAlert.card.id)) {
            activeAlerts.value.push({
              id: newAlert.card.id,
              image: newAlert.card.images.small,
              name: newAlert.card.name,
              attackDamage: newAlert.card.attack.damage,
              hp: newAlert.card.hp,
              expiresAt
            });
          }
        }
      }).catch(err => {
        console.error('Error fetching PokeAlerts:', err);
      });
    };

    const removeExpiredAlerts = () => {
      const now = new Date();
      for (let i = activeAlerts.value.length - 1; i >= 0; i--) {
        const alert = activeAlerts.value[i];
        if (now > new Date(alert.expiresAt)) {
          activeAlerts.value.splice(i, 1);
        }
      }
    };

    onMounted(() => {
      fetchAlerts();
      const intervalId = setInterval(() => {
        fetchAlerts();
        removeExpiredAlerts(); // Also check for expired alerts at each interval
      }, 15000); // Adjust the interval as needed

      onUnmounted(() => {
        clearInterval(intervalId);
      });
    });

    const addToCollection = (index) => {
      const alert = activeAlerts.value[index];
      if (alert && alert.id) {
        claimPokeAlert().then(() => {
          console.log('Card claimed and added to collection');
          activeAlerts.value.splice(index, 1);
        }).catch(err => {
          console.error('Error claiming PokeAlert:', err);
        });
      }
    };

    const decline = (index) => {
      deletePokeAlert().then(() => {
        console.log('PokeAlert declined');
        activeAlerts.value.splice(index, 1);
      }).catch(err => {
        console.error('Error deleting PokeAlert:', err);
      });
    };

    return { activeAlerts, addToCollection, decline };
  }
};
</script>







<style scoped>
.single-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 300px;
  height: auto;
  text-align: center; /* Center text and button */
}

.card-image img {
  width: 100%; /* Sets the image width to fill the container */
  height: 100%; /* Sets the image height to maintain aspect ratio */
  object-fit: contain; /* Ensures the image is scaled to maintain its aspect ratio while fitting within the element's content box */
  border-radius: 5px; /* Optional: for rounded corners */
}

.card-action button {
  margin: 10px;
  padding: 5px 10px;
}
</style>

