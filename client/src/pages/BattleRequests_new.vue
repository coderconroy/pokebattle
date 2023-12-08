<template>
  <div>
    <div>
      <h3>Request User</h3>
      <form @submit.prevent="submitRequest">
        <select v-model="selectedUserId" class="input-long">
          <option disabled value="">Select a User</option>
          <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
        </select>
        <button type="submit">Submit Request</button>
      </form>
    </div>
    <!-- Error Message Display -->
    <div v-if="fetchError" class="error-message">
      Error fetching users: {{ fetchError }}
    </div>

    <!-- Sent Requests Table -->
    <h3>Sent Requests</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Request Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(request, index) in sentUsernames" :key="index">
            <td>{{ request.username }}</td>
            <td>{{ request.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Received Requests Table -->
    <h3>Received Requests</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(request, index) in receivedUsernames" :key="index">
            <td>{{ request.username }}</td>
            <td>
              <button @click="handleAccept(request)">Accept</button>
              <button @click="() => handleReject(request, index)">Reject</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useRouter } from 'vue-router';

export default {
  setup() {
    // GraphQL queries and mutations
    const USERS_QUERY = gql`
      query Query {
        users {
          username
          id
        }
      }
    `;

    const CURRENT_USER_QUERY = gql`
      query CurrentUser {
        currentUser {
          id
          username
          lastName
        }
      }
    `;

    const REQUEST_BATTLE_MUTATION = gql`
      mutation RequestBattle($userId: ID!) {
        requestBattle(userId: $userId) {
          id
          playerOne {
            id
            username
            battles {
              state
            }
          }
        }
      }
    `;

    const USER_BATTLES_QUERY = gql`
      query Query {
        userBattles {
          playerTwo {
            username
            battles {
              state
            }
          }
          playerOne {
            username
            battles {
              state
            }
          }
          id
        }
      }
    `;

    const ACCEPT_BATTLE_MUTATION = gql`
      mutation AcceptBattle($battleId: ID!) {
        acceptBattle(battleId: $battleId) {
          playerOne {
            username
          }
        }
      }
    `;

    const REJECT_BATTLE_MUTATION = gql`
      mutation RejectBattle($battleId: ID!) {
        rejectBattle(battleId: $battleId) {
          playerTwo {
            username
          }
        }
      }
    `;

    const currentUser = ref(null);
    const users = ref([]);
    const selectedUserId = ref('');
    const fetchError = ref(null);
    const sentUsernames = ref([]);
    const receivedUsernames = ref([]);
    const router = useRouter();

    const { result: usersResult, refetch: fetchUsers } = useQuery(USERS_QUERY);
    const { result: currentUserResult, refetch: fetchCurrentUser } = useQuery(CURRENT_USER_QUERY);
    const { result: userBattlesResult, refetch: fetchUserBattles } = useQuery(USER_BATTLES_QUERY);
    const { mutate: requestBattle } = useMutation(REQUEST_BATTLE_MUTATION);
    const { mutate: acceptBattle } = useMutation(ACCEPT_BATTLE_MUTATION);
    const { mutate: rejectBattle } = useMutation(REJECT_BATTLE_MUTATION);

    // Watch for changes in query results and update data
    watch(usersResult, (newResult) => {
      if (newResult.value) {
        const currentUserData = currentUserResult?.value?.currentUser;
        users.value = newResult.value?.users?.filter(user => user.id !== currentUserData.id);
        console.log(`users:${currentUserData}`);
      }
    });

    watch(currentUserResult, (newResult) => {
      if (newResult.value) {
        currentUser.value = newResult.value?.currentUser;
      }
    });

    watch(userBattlesResult, (newResult) => {
      if (newResult.value) {
        updateSentAndReceivedUsernames(newResult.value?.userBattles);
      }
    });

    function updateSentAndReceivedUsernames(battles) {
      const currentUserData = currentUserResult?.value?.currentUser;
      if (currentUserData) {
        // Update sentUsernames
        sentUsernames.value = battles
          .filter(battle => battle.playerOne?.username === currentUserData?.username && battle.playerOne?.battles?.some(b => b.state === 'REQUESTED'))
          .map(battle => ({ username: battle.playerTwo?.username, status: 'REQUESTED' }));

        // Update receivedUsernames
        receivedUsernames.value = battles
          .filter(battle => battle.playerTwo?.username === currentUserData?.username && battle.playerTwo?.battles?.some(b => b.state === 'REQUESTED'))
          .map(battle => ({
            username: battle.playerOne?.username,
            status: 'REQUESTED',
            battleId: battle.id
          }));
      }
    }

    onMounted(async () => {
      await Promise.all([fetchUsers(), fetchCurrentUser(), fetchUserBattles()]);
    });

    const handleAccept = async (request) => {
      try {
        await acceptBattle({ battleId: request.battleId });
        router.push({ name: 'battle-hist' });
        await fetchUserBattles();
      } catch (err) {
        console.error('Error accepting battle request:', err.message);
      }
    };

    const handleReject = async (request, index) => {
      try {
        await rejectBattle({ battleId: request.battleId });
        receivedUsernames.value.splice(index, 1);
      } catch (err) {
        console.error('Error rejecting battle request:', err.message);
      }
    };

    const submitRequest = async () => {
      if (selectedUserId.value !== '') {
        const user = users?.value?.find(u => u.id === selectedUserId.value);
        const isRequestSent = sentUsernames?.value?.some(u => u.username === user.username);
        const isRequestReceived = receivedUsernames?.value?.some(u => u.username === user.username);

        if (!isRequestSent && !isRequestReceived) {
          try {
            await requestBattle({ userId: user.id });
            await fetchUserBattles();
          } catch (err) {
            console.error('Error sending battle request:', err.message);
          }
        } else {
          alert('A request already exists with this user.');
        }
        selectedUserId.value = '';
      } else {
        console.error('No user selected');
      }
    };

    return {
      users,
      selectedUserId,
      submitRequest,
      handleAccept,
      handleReject,
      sentUsernames,
      receivedUsernames,
      fetchError
    };
  }
};
</script>

<style scoped>
/* Your styles here */
.input-long {
  width: 300px; /* Adjust as needed */
  margin-right: 20px; 
}

.scrollable-table {
  max-height: 300px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #ddd;
}

.action-button {
  margin-right: 10px;
}
</style>
