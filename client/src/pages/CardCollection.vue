<!-- 
<template>
  <div class="card-container" v-if="!loading">
    <div v-for="(card, index) in cards" :key="index" class="card">
      <div class="card-image">
        <img :src="card.image" alt="Card image">
      </div>
      <div class="card-content">
        <h3>{{ card.name }}</h3> 
        <p>{{ card.description }}</p>
        <p> {{ card.hp }}</p>
      </div>
      <div class="card-selection">
        <input type="checkbox" :id="'checkbox-' + index" v-model="card.inDeck" />
        <label :for="'checkbox-' + index">In Deck</label>
      </div>
    </div>
  </div>
  <div v-if="loading">Loading...</div>
  <div v-if="error">Error loading cards.</div>
</template>

<script>
import { ref, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery } from '@vue/apollo-composable';

const CARD_COLLECTION_QUERY = gql`
query {
  currentUser {
    username
    collection {
      card {
        name
        hp
        attack {
          damage
        }
        images {
          small
        }
      }
      inDeck
    }
  }
}`;

export default {
  setup() {
    const cards = ref([]);

    const { result, loading, error, refetch } = useQuery(CARD_COLLECTION_QUERY);

    onMounted(() => {
      refetch().then(response => {
        if (response.data && response.data.currentUser && response.data.currentUser.collection) {
          cards.value = response.data.currentUser.collection.map((item, index) => ({
            name: item.card.name, // Extract card name
            hp: `Health: ${item.card.hp}`,
            description: `Attack: ${item.card.attack.damage}`,
            image: item.card.images.small,
            inDeck: item.inDeck
          }));
        }
      }).catch(err => {
        console.error('Error fetching card details:', err);
      });
    });

    return { cards, loading, error };
  },
};
</script> -->

<template>
  <div class="card-container" v-if="!loading">
    <!-- Card Display Loop -->
    <div v-for="(card, index) in cards" :key="index" class="card">
      <div class="card-image">
        <img :src="card.image" alt="Card image">
      </div>
      <div class="card-content">
        <h3>{{ card.name }}</h3>
        <p>{{ card.description }}</p>
        <p>{{ card.hp }}</p>
      </div>
      <div class="card-selection">
        <input type="checkbox" :id="'checkbox-' + index" v-model="card.inDeck" :disabled="selectedCount >= 6 && !card.inDeck" />
        <label :for="'checkbox-' + index">In Deck</label>
      </div>
    </div>
  </div>
  <div v-if="loading">Loading...</div>
  <div v-if="error">Error loading cards.</div>

  <!-- Confirm Button -->
  <button @click="confirmSelection" :disabled="selectedCount !== 6">Confirm Selection</button>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@vue/apollo-composable';

// Query
const CARD_COLLECTION_QUERY = gql`
query {
  currentUser {
    username
    collection {
      card {
        id
        name
        hp
        attack {
          damage
        }
        images {
          small
        }
      }
      inDeck
    }
  }
}`;

// Mutation
const UPDATE_USER_DECK_MUTATION = gql`
mutation UpdateUserDeck($cardIds: [ID!]!) {
  updateUserDeck(cardIds: $cardIds) {
    collection {
      inDeck
      card {
        id
      }
    }
  }
}`;

export default {
  setup() {
    const cards = ref([]);
    const { result, loading, error, refetch } = useQuery(CARD_COLLECTION_QUERY);
    const { mutate: updateUserDeck } = useMutation(UPDATE_USER_DECK_MUTATION);

    onMounted(() => {
      refetch().then(response => {
        if (response.data && response.data.currentUser && response.data.currentUser.collection) {
          cards.value = response.data.currentUser.collection.map((item, index) => ({
            name: item.card.name, // Extract card name
            id: item.card.id,
            hp: `Health: ${item.card.hp}`,
            description: `Attack: ${item.card.attack.damage}`,
            image: item.card.images.small,
            inDeck: item.inDeck
          }));
        }
      }).catch(err => {
        console.error('Error fetching card details:', err);
      });
    });

    // Computed property to count selected cards
    const selectedCount = computed(() => {
      return cards.value.filter(card => card.inDeck).length;
    });

    // Confirm selection method
    const confirmSelection = () => {
      const selectedCardIds = cards.value
        .filter(card => card.inDeck)
        .map(card => card.id);
      
      

      updateUserDeck({ cardIds: selectedCardIds })
        .then(response => {
          console.log('Deck updated:', response);
        })
        .catch(err => {
          console.error('Error updating deck:', err);
        });
    };

    return { cards, selectedCount, confirmSelection, loading, error };
  },
};
</script>




<style scoped>
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 300px; /* Updated width */
  height: 400px; /* Updated height */
  align-items: center;
}

.card-image img {
  width: 100%; /* Sets the image width to fill the container */
  height: 100%; /* Sets the image height to maintain aspect ratio */
  object-fit: contain; /* Ensures the image is scaled to maintain its aspect ratio while fitting within the element's content box */
  border-radius: 5px; /* Optional: for rounded corners */
}


.card-content {
  margin-top: 10px;
}

.card-selection {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>

