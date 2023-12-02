<template>
  <div class="battle-container">
    <!-- Health Points Bar -->
    <div class="health-bar-container">
      <h3>Health Bar - Total Health Points: {{ healthPoints }}</h3>
      <div class="health-bar">
        <div class="health" :style="{ width: healthPoints + '%', backgroundColor: healthBarColor }"></div>
      </div>
    </div>

    <!-- Your Cards Section -->
    <div class="cards-section">
      <h3>Your Cards</h3>
      <div class="cards-row">
        <div class="card" v-for="(card, index) in cards.slice(0, 6)" :key="card.id">
          <div class="card-inner" :class="{ 'is-flipped': selectedCardId === card.id }">
            <!-- Front Side of the Card -->
            <div class="card-front">
              <div class="card-content">
                <img :src="card.image1" alt="Card Image">
                <h5>{{ card.title }}</h5>
              </div>
              <div class="card-selection">
                <input 
                  type="radio" 
                  :id="'radio-' + index"
                  name="card-selection" 
                  :value="card.id" 
                  v-model="selectedCardId" 
                />
                <label :for="'radio-' + index">Select</label>
              </div>
            </div>
            <!-- Back Side of the Card -->
            <div class="card-back">
              <div class="card-content">
                <img :src="card.image2" alt="Card Image">
                <h5>Selected: {{ card.title }}</h5>
                <p>More details about {{ card.title }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Opponent's Cards Section -->
    <div class="cards-section">
      <h3>Opponent's Cards</h3>
      <div class="cards-row">
        <div class="opponent-card" v-for="(card, index) in cards.slice(6, 12)" :key="card.id">
          <!-- Similar card content as the first row -->
          <div class="opponent-card-content">
            <img :src="card.image1" alt="Card Image" class="opponent-card-image">
            <!-- <h3> Other player's card </h3> -->
            <!-- <p>{{ cards[6].description }}</p> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BattlePage',
  data() {
    return {
      cards: this.generateDummyCards(),
      selectedCardId: null,
      healthPoints: 100, // Dummy health points
    };
  },
  computed: {
    healthBarColor() {
      if (this.healthPoints < 10) {
        return '#f00'; // Red
      } else if (this.healthPoints < 30) {
        return '#ffa500'; // Orange
      } else {
        return '#008000'; // Green
      }
    },
  },
  methods: {
    generateDummyCards() {
      return [
        // Your dummy cards data (make sure you have at least 12 cards)
        { id: 1, title: 'Card 1', description: 'Description for Card 1', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 2, title: 'Card 2', description: 'Description for Card 2', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 3, title: 'Card 3', description: 'Description for Card 3', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 4, title: 'Card 4', description: 'Description for Card 4', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 5, title: 'Card 5', description: 'Description for Card 5', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 6, title: 'Card 6', description: 'Description for Card 6', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        
        { id: 7, title: 'Card 7', description: 'Description for Card 7', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 8, title: 'Card 8', description: 'Description for Card 8', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 9, title: 'Card 9', description: 'Description for Card 9', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 10, title: 'Card 10', description: 'Description for Card 10', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 11, title: 'Card 11', description: 'Description for Card 11', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 12, title: 'Card 12', description: 'Description for Card 12', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        // ...
      ];
    },
  },
};
</script>

<style scoped>
.battle-container {
  padding: 20px;
}

.health-bar-container {
  text-align: center;
  margin-bottom: 20px;
}

.health-bar {
  width: 100%;
  background-color: #eee;
  border-radius: 4px;
}

.health {
  height: 20px;
  border-radius: 4px;
  transition: width 0.5s ease, background-color 0.5s ease;
}


.cards-section {
  text-align: center;
}

.cards-row {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 150px;
  height: 400px;
  text-align: center;
  display: flex;
  flex-direction: column;
  perspective: 1000px;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

.is-flipped {
  transform: rotateY(180deg);
}

.card-content img {
  width: 100%;
  max-height: 60%;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 10px;
}

.card-selection {
  margin-top: auto;
}

.opponent-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 150px;
  height: 200px;
  text-align: center;
  display: flex;
  flex-direction: column;
  perspective: 1000px;
}

.opponent-card-content img {
  width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 5px;
  margin-bottom: 10px;
}

.opponent-card-image {
  width: 100%;  /* Full width of the card */
  height: 100%; /* Full height of the card */
}


</style>

