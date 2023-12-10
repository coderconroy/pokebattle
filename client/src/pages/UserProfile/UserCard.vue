<template>
  <div v-if="loading">
    Loading user data...
  </div>
  <div v-else-if="error">
    Error fetching user data: {{ error.message }}
  </div>
  <div v-else>
    <card class="card-user">
      <template v-slot:image>
        <img src="@/assets/pokemon_background.jpeg" alt="Background image" />
      </template>
      <div>
        <div class="author">
          <!-- Dynamic src for the avatar if needed -->
          <img class="avatar border-white" src="@/assets/pokemon_trainer_avatar.png" alt="Trainer avatar" />
          <h4 class="title">
            <!-- Display the full name -->
            {{ fullName }}
            <br />
            <!-- Dynamic username -->
            <a href="#">
              <small>@{{ currentUser ? currentUser.username : '' }}</small>
            </a>
          </h4>
        </div>
      </div>
    </card>
  </div>
</template>


<script>
import { ref, computed, watch } from 'vue';
import gql from 'graphql-tag';
import { useQuery } from '@vue/apollo-composable';

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      email
      firstName
      lastName
      username
    }
  }
`;

export default {
  setup() {
    const currentUser = ref(null);
    const POLL_INTERVAL = 1000; // Poll every 1000 milliseconds (1 seconds)

    const { result, loading, error } = useQuery(CURRENT_USER_QUERY, {}, {
      pollInterval: POLL_INTERVAL
    });

    watch(result, (newResult) => {
      if (newResult && newResult.currentUser) {
        currentUser.value = newResult.currentUser;
      }
    }, { immediate: true });

    const fullName = computed(() => {
      return currentUser.value ? `${currentUser.value.firstName} ${currentUser.value.lastName}` : '';
    });

    const getClasses = (index) => {
      switch (index % 3) {
        case 0:
          return "col-lg-3 offset-lg-1";
        case 1:
          return "col-lg-3";
        case 2:
          return "col-lg-4";
      }
    };

    return { fullName, getClasses, currentUser, loading, error };
  },
  data() {
    return {
      details: [
        { title: "10", subTitle: "Pokemons Owned" },
        { title: "5", subTitle: "Battles Won" },
        { title: "2", subTitle: "Battles in Progress" },
      ],
    };
  },
};
</script>



<style>
/* Your styles here */
</style>
