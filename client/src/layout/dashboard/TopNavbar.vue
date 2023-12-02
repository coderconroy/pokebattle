<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">{{ routeName }}</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ml-auto">
          <drop-down class="nav-item" title-classes="nav-link" icon="ti-user" @click="onLogoutClick">
            <a class="dropdown-item" href="/login">Logout</a>
          </drop-down>
        </ul>
      </div>
    </div>
  </nav>
</template>


<script>
// import { isAuthenticated } from '@/pages/UserLogin.vue';
export default {
  computed: {
    routeName() {
      const { name } = this.$route;
      return this.capitalizeFirstLetter(name);
    },
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    // onLogoutClick() {
    //   // Your logout logic
    //   isAuthenticated.value = false;
    //   console.log(`Authenticated (Top): ${isAuthenticated.value}`);
    //   // Add any additional logic for logout (e.g., redirecting to the login page)
    // },
  },
};
</script>

<style></style>
