<template>
  <div class="round-status-bar">
    <h4>Round Status</h4>
    <div class="rounds">
      <div v-for="(round, index) in rounds" :key="index">
        <div class="round" v-if="index === rounds.length - 2">
          <span class="round-number">Round {{ index + 1 }}</span>
          <div class="pokemon-details">
            <span>Player One: {{ round?.playerOneCard?.battleCard?.card?.name }}</span>
            <span>Player Two: {{ round?.playerTwoCard?.battleCard?.card?.name }}</span>
          </div>
          <div class="hp-details">
            <span>Player 1 Start HP: {{ round?.playerOneCard?.roundStartHp }}</span>
            <span>Player 1 End HP: {{ round?.playerOneCard?.roundEndHp }}</span>
            <span>Player 2 Start HP: {{ round?.playerTwoCard?.roundStartHp }}</span>
            <span>Player 2 End HP: {{ round?.playerTwoCard?.roundEndHp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    rounds: {
      type: Array,
      required: true
    }
  }
};
</script>


<style scoped>
.round-status-bar {
  width: 250px;
  /* Adjust width as needed */
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  /* To make it stick on the side */
  right: 20px;
  /* Distance from right */
  top: 20px;
  /* Distance from top */
}

.round-status-bar h4 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
}

.rounds {
  overflow-y: auto;
  /* In case of many rounds */
  max-height: 500px;
  /* Adjust as needed */
}

.round {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.round-number {
  font-weight: bold;
  display: block;
}

.pokemon-details span,
.hp-details span {
  display: block;
  font-size: 0.9em;
  color: #555;
}

/* Additional styling can be added as per design requirements */</style>
