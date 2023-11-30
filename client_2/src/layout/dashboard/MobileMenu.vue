<template>
  <ul class="nav navbar-nav nav-mobile-menu" :class="customClass">
    <slot></slot>
  </ul>
</template>

<script>
export default {
  props: {
    customClass: {
      type: [String, Array, Object],
      default: '',
    },
  },
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>
