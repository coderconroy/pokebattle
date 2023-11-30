<template>
	<div class="app">
	  <!-- Removed Sidebar Component -->
	  <div class="image-container"></div>
	  <!-- Content -->
	  <router-view />
	</div>
  </template>  


<script setup>
</script>


<style lang="scss">
  .image-container {
		flex-grow: 1;
		width: 100%;  // Add width
		height: 850px;  // Add height
		background-image: url('../assets/welcomepage.png');
		background-size: cover;
		background-position: center;
	}

		/* Larger screens */
	@media (min-width: 1024px) {
	.image-container {
		min-height: 850px;  // Increase height for larger screens
	}
	}

	/* Medium screens */
	@media (min-width: 768px) and (max-width: 1023px) {
	.image-container {
		min-height: 750px;  // Adjust height for medium screens
	}
	}

	/* Smaller screens */
	@media (max-width: 767px) {
	.image-container {
		min-height: 650px;  // Adjust height for smaller screens
	}
	}

</style>
