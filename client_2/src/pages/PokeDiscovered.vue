<template>
  <div class="discovered-card-container">
    <div class="card">
      <div class="card-image">
        <img :src="card.image" alt="Card Image">
      </div>
      <div class="card-content">
        <h3>{{ card.title }}</h3>
        <p>{{ card.description }}</p>
      </div>
      <div class="card-action">
        <button @click="addToCollection">Add to Collection</button>
        <button @click="decline">No, Thanks</button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'DiscoveredCardPage',
  data() {
    return {
      card: {
        title: 'Discovered Card',
        description: 'Description of the Discovered Card',
        image: require('@/assets/pokemon_card_2.jpeg'), // Replace with your actual image path
      },
    };
  },
  methods: {
    addToCollection() {
      // Logic to add the card to the collection
      alert('Card added to collection!');
    },
    decline() {
      // Logic for declining the card
      alert('Maybe next time!');
    },
  },
};
</script>


<style scoped>
.single-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height */
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  width: 300px;
  height: auto;
  text-align: center; /* Center text and button */
}

.card-image img {
  width: 100%; /* Sets the image width to fill the container */
  height: 100%; /* Sets the image height to maintain aspect ratio */
  object-fit: contain; /* Ensures the image is scaled to maintain its aspect ratio while fitting within the element's content box */
  border-radius: 5px; /* Optional: for rounded corners */
}

.card-action button {
  margin: 10px;
  padding: 5px 10px;
}
</style>

