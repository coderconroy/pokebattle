<template>
  <div>
    <!-- Match Statistics -->
    <h3>Match Statistics</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th v-for="header in gamesPlayed" :key="header" :style="{ width: matchStatisticsColumnWidth }">{{ header }}
            </th>
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

    <!-- Active Battles Table -->
    <h3>Active Battles</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th v-for="header in activeColumns" :key="header" :style="{ width: activeBattleColumnWidth }">{{ header }}
            </th>
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

    <h3>History of Battles</h3>
    <div class="scrollable-table">
      <table>
        <thead>
          <tr>
            <th v-for="header in historyColumns" :key="header" :style="{ width: historyBattleColumnWidth }">{{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(battle, index) in historyData" :key="index">
            <td>{{ battle.opponent }}</td>
            <td>{{ battle.result }}</td>
          </tr>
        </tbody>
      </table>
    </div>




  </div>
</template>
  
<script>
import { computed, ref, onMounted } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import PaperTable from '@/components/PaperTable.vue';
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
    const route = useRouter();
    const currentUser = ref(null);
    const userStats = ref([]); // Placeholder for user stats
    const activeData = ref([]);
    const historyData = ref([]);
    const fetchError = ref(null);

    const gamesPlayed = ref(['Games Played', 'Active Matches', 'Won', 'Lost', 'Tied']);
    const activeColumns = ref(['Opponent', 'Battle Link']);
    const historyColumns = ref(['Opponent', 'Result']);

    const matchStatisticsColumnWidth = computed(() => 100 / gamesPlayed.value.length + '%');
    const activeBattleColumnWidth = computed(() => 100 / activeColumns.value.length + '%');
    const historyBattleColumnWidth = computed(() => 100 / historyColumns.value.length + '%');

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
              battleLink: '/battle/' + battle.id
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
      userStats,
      matchStatisticsColumnWidth,
      activeBattleColumnWidth,
      historyBattleColumnWidth
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

.scrollable-table th {
  font-weight: bold !important;
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  /* Optional */
}

td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  /* Optional */
}</style>
  
  