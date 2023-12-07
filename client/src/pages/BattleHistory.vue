<!-- <template>
    <div>
    
      <h3>Match Statistics</h3>
      <div class="scrollable-table">
        <PaperTable :columns="gamesPlayed" :data="userStats" /> 
        <PaperTable :columns="gamesPlayed" :data="userStats">
          <template v-slot:row="{ row }">
            <td>{{ row.gamesPlayed }}</td>
            <td>{{ row.activeMatches }}</td>
            <td>{{ row.won }}</td>
            <td>{{ row.lost }}</td>
            <td>{{ row.tied }}</td>
          </template>
        </PaperTable>
      </div>  
     
      <h3>Active Battles</h3>
      <div class="scrollable-table">
        <PaperTable :columns="activeColumns" :data="activeData">
          <template v-slot:row="{ row }">
            <td>{{ row.opponent }}</td>
            <td><a :href="row.battleLink">Go to Battle</a></td>
          </template>
        </PaperTable>
      </div>
  
     
      <h3>History of Battles</h3>
      <div class="scrollable-table">
        <PaperTable :columns="historyColumns" :data="historyData">
          <template v-slot:row="{ row }">
            <td>{{ row.opponent }}</td>
            <td>{{ row.result }}</td>
          </template>
        </PaperTable>
      </div>
    </div>
  </template>
   -->
  <!-- <script>
  import PaperTable from '@/components/PaperTable.vue'; // Adjust path as needed
  
  export default {
    components: {
      PaperTable
    },
    data() {
      return {

        // Columns for user statistics
        gamesPlayed: ['Games Played', 'Active Matches', 'Won', 'Lost', 'Tied'],
        userStats: [
          // Replace with your actual data
          { gamesPlayed: 10, activeMatches: 2, won: 3, lost: 3, tied: 2 },
          // ... more data
        ],

        // Columns for the active battles table
        activeColumns: ['Opponent', 'Battle Link'],
        activeData: [
          // Replace with your actual data
          { opponent: 'Player1', battleLink: '/battle/123' },
          { opponent: 'Player2', battleLink: '/battle/456' },
          { opponent: 'Player1', battleLink: '/battle/123' },
          { opponent: 'Player2', battleLink: '/battle/456' },
          { opponent: 'Player1', battleLink: '/battle/123' },
          { opponent: 'Player2', battleLink: '/battle/456' },
          { opponent: 'Player1', battleLink: '/battle/123' },
          { opponent: 'Player2', battleLink: '/battle/456' },
          { opponent: 'Player1', battleLink: '/battle/123' },
          { opponent: 'Player2', battleLink: '/battle/456' },
          // ... more data
        ],
  
        // Columns for the history table
        historyColumns: ['Opponent', 'Result'],
        historyData: [
          // Replace with your actual data
          { opponent: 'Player1', result: 'Won' },
          { opponent: 'Player2', result: 'Lost' },
          { opponent: 'Player1', result: 'Won' },
          { opponent: 'Player2', result: 'Lost' },
          { opponent: 'Player1', result: 'Won' },
          { opponent: 'Player2', result: 'Lost' },
          { opponent: 'Player1', result: 'Won' },
          { opponent: 'Player2', result: 'Lost' },
          { opponent: 'Player1', result: 'Won' },
          { opponent: 'Player2', result: 'Lost' },
          // ... more data
        ]
      };
    }
  };
  </script>
  
  <style scoped>
  .scrollable-table {
    max-height: 250px; /* Adjust this value based on your row height */
    overflow-y: auto;
  }
  </style> -->


  <template>
    <div>
      <!-- Match Statistics -->
      <!-- Match Statistics -->
    <h3>Match Statistics</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th v-for="header in gamesPlayed" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="userStats.length">
            <td>{{ userStats[0].gamesPlayed }}</td>
            <td>{{ userStats[0].activeMatches }}</td>
            <td>{{ userStats[0].won }}</td>
            <td>{{ userStats[0].lost }}</td>
            <td>{{ userStats[0].tied }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  
      <!-- Active Battles Table
      <h3>Active Battles</h3>
      <div class="scrollable-table">
        <PaperTable :columns="activeColumns" :data="activeData">
          <template v-slot:row="{ row }">
            <td>{{ row.opponent }}</td>
            <td><a :href="row.battleLink">Go to Battle</a></td>
          </template>
        </PaperTable>
      </div> -->

     <!-- Active Battles Table -->
    <h3>Active Battles</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th v-for="header in activeColumns" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(battle, index) in activeData" :key="index">
            <td>{{ battle.opponent }}</td>
            <td><router-link :to="battle.battleLink">Go to Battle</router-link></td>
          </tr>
        </tbody>
      </table>
    </div>


  
      <!-- History of Battles Table -->
      <h3>History of Battles</h3>
      <div class="scrollable-table">
        <PaperTable :columns="historyColumns" :data="historyData">
          <template v-slot:row="{ row }">
            <td>{{ row.opponent }}</td>
            <td>{{ row.result }}</td>
          </template>
        </PaperTable>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import gql from 'graphql-tag';
  import PaperTable from '@/components/PaperTable.vue'; // Adjust path as needed
  import { useRouter, RouterLink } from 'vue-router';
  
  const CURRENT_USER_BATTLES_QUERY = gql`
    query Query {
      currentUser {
        username
        battles {
          id
          state
          winner {
            username
          }
          playerOne {
            username
          }
          playerTwo {
            username
          }
        }
      }
    }
  `;
  
  export default {
    components: {
      PaperTable,
      RouterLink
    },
    setup() {
      const router = useRouter();
      const currentUser = ref(null);
      const userStats = ref([]); // Placeholder for user stats
      const activeData = ref([]);
      const historyData = ref([]);
      const fetchError = ref(null);
  
      const gamesPlayed = ['Games Played', 'Active Matches', 'Won', 'Lost', 'Tied']; // Adjust as needed
      const activeColumns = ['Opponent', 'Battle Link'];
      const historyColumns = ['Opponent', 'Result'];
  
      const { result: currentUserBattlesResult, refetch: fetchCurrentUserBattles } = useQuery(CURRENT_USER_BATTLES_QUERY);
     
  
      onMounted(async () => {
        try {
          await fetchCurrentUserBattles();
          
  
          const currentUserData = currentUserBattlesResult.value?.currentUser;
          if (currentUserData) {
            currentUser.value = currentUserData;
            const battles = currentUserData.battles || [];

            const totalGamesPlayed = battles.length;
            const activeMatches = battles.filter(battle => battle.state === 'ACTIVE').length;
            const won = battles.filter(battle => battle.winner?.username === currentUserData.username).length;
            const lost = battles.filter(battle => battle.state === 'COMPLETED' && battle.winner?.username !== currentUserData.username).length;
            const tied = battles.filter(battle => battle.state === 'TIED').length;

            userStats.value = [{
              gamesPlayed: totalGamesPlayed,
              activeMatches: activeMatches,
              won: won,
              lost: lost,
              tied: tied
            }];

           
  
            // Process active battles
            activeData.value = currentUserData.battles
              .filter(battle => battle.state === 'ACTIVE')
              .map(battle => ({
                opponent: currentUserData.username === battle.playerOne.username ? battle.playerTwo.username : battle.playerOne.username,
                battleLink: '/battle/' + battle.id // Modify according to how you generate battle links
              }));
  
            // Process history of battles
            historyData.value = currentUserData.battles
              .filter(battle => battle.state === 'COMPLETED')
              .map(battle => ({
                opponent: currentUserData.username === battle.playerOne.username ? battle.playerTwo.username : battle.playerOne.username,
                result: battle.winner?.username === currentUserData.username ? 'Won' : 'Lost'
              }));
          }
        } catch (err) {
          fetchError.value = err.message;
        }
      });
  
      return {
        gamesPlayed,
        userStats,
        activeColumns,
        activeData,
        historyColumns,
        historyData,
        fetchError,
        userStats
      };
    }
  };
  </script>
  
  <style scoped>
  .scrollable-table {
    max-height: 300px;
    overflow-y: auto;
  }

  table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd; /* Optional */
}
  /* Add additional styles as needed */
  </style>
  
  