<template>
  <div class="card-container">
    <div v-for="(card, index) in cards" :key="index" class="card">
      <div class="card-image">
        <img :src="card.image" alt="Card Image">
      </div>
      <div class="card-content">
        <h3>{{ card.title }}</h3>
        <p>{{ card.description }}</p>
      </div>
      <div class="card-selection">
        <input type="checkbox" :id="'checkbox-' + index" v-model="card.selected" />
        <label :for="'checkbox-' + index">Select</label>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'CardCollection',
  data() {
    return {
      cards: this.generateDummyCards(6), // Generates 6 dummy cards
    };
  },
  methods: {
    generateDummyCards(numberOfCards) {
      return Array.from({ length: numberOfCards }, (_, index) => ({
        title: `Card ${index + 1}`,
        description: `Description for Card ${index + 1}`,
        selected: false,
        image: require('@/assets/pokemon_card.jpeg'), // require('path-to-image.jpg'), // Replace with your image path
      }));
    },
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

