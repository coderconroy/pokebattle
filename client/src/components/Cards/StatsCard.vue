<template>
  <Card>
    <div>
      <div class="row">
        <div class="col-5" v-if="$slots.header">
          <slot name="header"></slot>
        </div>
        <div class="col-7" v-if="$slots.content">
          <slot name="content"></slot>
        </div>
      </div>
      <div v-if="$slots.footer">
        <hr />
        <slot name="footer"></slot>
      </div>
    </div>
  </Card>
</template>

<script>
import Card from "./Card.vue";

export default {
  name: "StatsCard",
  components: {
    Card,
  },
  // Define any props if needed
};
</script>

<style scoped>
/* Add component-specific styles here */
</style>

