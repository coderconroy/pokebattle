<template>
  <div :class="{ 'nav-open': $sidebar && $sidebar.showSidebar }">
    <notifications></notifications>
    <div class="row">
      <div class="col-md-12">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  // Include any additional components or logic required here
  components: {
    
  },
};
</script>

<style lang="scss">
/* Notifications styles from the reference project */
.vue-notifyjs.notifications {
  .alert {
    z-index: 10000;
  }
  .list-move {
    transition: transform 0.3s, opacity 0.4s;
  }
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  .list-enter-active {
    transition: transform 0.2s ease-in, opacity 0.4s ease-in;
  }
  .list-leave-active {
    transition: transform 1s ease-out, opacity 0.4s ease-out;
  }

  .list-enter {
    opacity: 0;
    transform: scale(1.1);
  }
  .list-leave-to {
    opacity: 0;
    transform: scale(1.2, 0.7);
  }
}

/* Additional styles for your layout */
.container {
  /* Your custom container styles here */
}
</style>
