<template>
  <div>
    <!-- Request User Block -->
    <div>
      <h3>Request User</h3>
      <form @submit.prevent="submitRequest">
        <input type="text" v-model="requestInput" placeholder="Username or Email" class="input-long" />
        <button type="submit">Submit Request</button>
      </form>
    </div>

    <!-- Sent Requests Table -->
    <h3>Sent Requests</h3>
    <div class="scrollable-table">
      <PaperTable :columns="sentReqColumns" :data="sentReqData">
        <template v-slot:row="{ row }">
          <td>{{ row.opponent }}</td>
        </template>
      </PaperTable>
    </div>

    <!-- Received Requests Table -->
    <h3>Received Requests</h3>
    <div class="scrollable-table">
      <PaperTable :columns="recReqColumns" :data="recReqData">
        <template v-slot:row="{ row }">
          <td>{{ row.opponent }}</td>
          <td>
            <button @click="acceptRequest(row)" class="action-button">Accept</button>
            <button @click="rejectRequest(row)" class="action-button">Reject</button>
          </td>
        </template>
      </PaperTable>
    </div>
  </div>
</template>

<script>
import PaperTable from '@/components/PaperTable.vue';

export default {
  components: {
    PaperTable
  },
  data() {
    return {
      requestInput: '',
      // Columns for the active battles table
      sentReqColumns: ['Opponent'],
      sentReqData: [
        // Replace with your actual data
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        // ... more data
      ],
      recReqColumns: ['Opponent', 'Action'],
      recReqData: [
        // Replace with your actual data
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        { opponent: 'Player1'},
        { opponent: 'Player2'},
        // ... more data
      ],
    };
  },
  computed: {
    formattedReceivedRequests() {
      return this.receivedRequests.map(request => ({
        ...request,
        action: 'Accept/Reject' // This is a placeholder, replace with buttons or interactive elements
      }));
    }
  },
  methods: {
    submitRequest() {
      // Check if the input is not empty
      if (this.requestInput.trim() !== '') {
        // Add the request to the sent requests data
        this.sentReqData.push({ opponent: this.requestInput });

        // Clear the input field after submission
        this.requestInput = '';
      } else {
        // Handle the case where the input is empty (optional)
        // For example, show an error message
      }
    },
    // Additional methods for handling requests
    acceptRequest(row) {
      // Implement the logic for accepting a request
      // 'row' contains the data of the row where the button was clicked

      // Add the accepted battle to the active battles list
      // This is a placeholder. You need to replace it with actual logic.
      // For example,
      // addActiveBattle({ opponent: row.opponent, battleLink: '/battle/new' });

      // Remove the accepted request from the received requests list
      this.recReqData = this.recReqData.filter(r => r !== row);
    },
    rejectRequest(row) {
      // Implement the logic for rejecting a request
      // 'row' contains the data of the row where the button was clicked
      // Remove the rejected request from the received requests list
      this.recReqData = this.recReqData.filter(r => r !== row);
    },
  }
};
</script>

<style scoped>
.input-long {
  width: 300px; /* Adjust as needed */
  margin-right: 20px; 
}
.scrollable-table {
  max-height: 250px; /* Adjust this value based on your row height */
  overflow-y: auto;
}
.action-button {
  /* margin-left: 10px; */
  margin-right: 10px;
}
</style>
