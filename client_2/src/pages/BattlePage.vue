
<template>
    <div class="cards-container">
      <div class="cards-row">
        <div class="card" v-for="(card, index) in cards.slice(0, 6)" :key="card.id">
          <div class="card-inner" :class="{ 'is-flipped': selectedCardId === card.id }">
            <!-- Front Side of the Card -->
            <div class="card-front">
              <div class="card-content">
                <img :src="card.image1" alt="Card Image">
                <h5>{{ card.title }}</h5>
                <!-- <p>{{ card.description }}</p> -->
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
  
      <div class="cards-row">
        <div class="card" v-if="cards.length > 6">
          <div class="card-content">
            <img :src="cards[6].image1" alt="Card Image">
            <h3> Other player's card </h3>
            <!-- <p>{{ cards[6].description }}</p> -->
          </div>
        </div>
      </div>
    </div>
</template>
  
  
<script>
export default {
  name: 'CardSelectionPage',
  data() {
    return {
      cards: this.generateDummyCards(), // Generates dummy cards
      selectedCardId: null,
    };
  },
  methods: {
    generateDummyCards() {
      return [
        { id: 1, title: 'Card 1', description: 'Description for Card 1', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 2, title: 'Card 2', description: 'Description for Card 2', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 3, title: 'Card 3', description: 'Description for Card 3', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 4, title: 'Card 4', description: 'Description for Card 4', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 5, title: 'Card 5', description: 'Description for Card 5', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        { id: 6, title: 'Card 6', description: 'Description for Card 6', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
        
        { id: 7, title: 'Card 7', description: 'Description for Card 7', image1: require('@/assets/dummy_card.jpeg'), image2: require('@/assets/pokemon_card.jpeg') },
      ];
    },
  },
};
</script>


<style scoped>
.cards-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.cards-row {
  display: flex;
  gap: 10px;
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
</style>
