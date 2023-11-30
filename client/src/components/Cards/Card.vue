<template>
  <div class="card">
    <div class="card-image" v-if="$slots.image">
      <slot name="image" />
    </div>
    <div class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <h4 class="card-title">{{ title }}</h4>
        <p class="card-category" v-if="subTitle">{{ subTitle }}</p>
      </slot>
    </div>
    <div class="card-body" v-if="$slots.default">
      <slot />
    </div>
    <slot name="raw-content" />
    <div class="card-footer" v-if="$slots.footer">
      <hr />
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: "Card",
  props: {
    title: {
      type: String,
      default: ''
    },
    subTitle: {
      type: String,
      default: ''
    }
  }
};
</script>

<style scoped>
/* Add your component specific styles here */
.card {
  /* Example style */
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.card-title {
  /* Example style */
  font-size: 1.2rem;
  color: #333;
}

.card-category {
  /* Example style */
  font-size: 0.9rem;
  color: #666;
}

/* Add more styles as needed */
</style>

