<template>
    <div>
      <!-- Match Statistics -->
      <h3>Match Statistics</h3>
      <div class="scrollable-table">
        <!-- <PaperTable :columns="gamesPlayed" :data="userStats" /> -->
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
      <!-- Active Battles Table -->
      <h3>Active Battles</h3>
      <div class="scrollable-table">
        <PaperTable :columns="activeColumns" :data="activeData">
          <template v-slot:row="{ row }">
            <td>{{ row.opponent }}</td>
            <td><a :href="row.battleLink">Go to Battle</a></td>
          </template>
        </PaperTable>
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
  </style>
  