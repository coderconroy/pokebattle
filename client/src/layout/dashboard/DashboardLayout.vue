<template>
  <div class="wrapper">
    <side-bar>
      <template v-slot:links>
        <sidebar-link to="/home" name="Home" icon="ti-home" />
        <sidebar-link to="/profile" name="User Profile" icon="ti-user" />
        <sidebar-link
          to="/card-collection"
          name="Card Collection"
          icon="ti-view-list-alt"
        />
        <drop-down
          class="nav-item"
          title="BATTLE PAGE"
          title-classes="nav-link"
          icon="ti-game"
        >
        <!-- <a class="dropdown-item" href="/battle-page">Active Battle Page</a> -->
        <a class="dropdown-item" @click.prevent="redirectToBattlePage">Active Battle Page</a>
        </drop-down>
        <!-- <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="ti-game"></i> Battle Page
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="/battle-page">Active Battle Page</a>

          </div>
        </div> -->
        <!-- <sidebar-link to="/battle-page" name="Battle Page" icon="ti-game" /> -->
        <sidebar-link to="/notifications" name="Notifications" icon="ti-bell" />
        <sidebar-link to="/poke-discovered" name="Poke Discovered" icon="ti-gift" />
      </template>
      <mobile-menu>
        <li class="nav-item">
          <a class="nav-link">
            <i class="ti-panel"></i>
            <p>Stats</p>
          </a>
        </li>
        <drop-down
          class="nav-item"
          title="5 Notifications"
          title-classes="nav-link"
          icon="ti-bell"
        >
          <a class="dropdown-item">Notification 1</a>
          <a class="dropdown-item">Notification 2</a>
          <a class="dropdown-item">Notification 3</a>
          <a class="dropdown-item">Notification 4</a>
          <a class="dropdown-item">Another notification</a>
        </drop-down>
        <li class="nav-item">
          <a class="nav-link">
            <i class="ti-settings"></i>
            <p>Settings</p>
          </a>
        </li>
        <!-- <drop-down class="nav-item" title-classes="nav-link" icon="ti-user">
          <a ref="logoutLink" class="dropdown-item" href="/login">Logout</a>
        </drop-down> -->
        <drop-down class="nav-item" title-classes="nav-link" icon="ti-user" @click="onLogoutClick">
          <a class="dropdown-item" href="/login">Logout</a>
        </drop-down>
        <!-- <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="ti-user"></i>
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <a class="dropdown-item" href="/login" v-on:click="onLogoutClick">Logout</a>
          </div>
        </div> -->
        <li class="divider"></li>
      </mobile-menu>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <!-- <router-view></router-view>  -->
      <dashboard-content @click="toggleSidebar"> </dashboard-content>

    </div>
  </div>
</template>


<style lang="scss" scoped>

  .nav-link {
    font-weight: bold; /* Makes the text bold */
  }

.btn-secondary.dropdown-toggle {
  background-color: transparent; /* Removes background color */
  border: none; /* Removes border */
  box-shadow: none; /* Removes box shadow */
  display: inline-block; /* Ensures that the dropdown can be centered as text */
  align-items: center;
}

</style>


<script>
import TopNavbar from "./TopNavbar.vue";
import DashboardContent from "./UserContent.vue";
import MobileMenu from "./MobileMenu";
import { useRouter } from 'vue-router';

import { isAuthenticated } from '@/pages/UserLogin.vue';

export default {
  components: {
    TopNavbar,
    DashboardContent,
    MobileMenu,
  },
  inject: ["$sidebar"], // Match the name used in provide
  methods: {
    toggleSidebar() {
      if (this.$sidebar && typeof this.$sidebar.displaySidebar === 'function') {
        this.$sidebar.displaySidebar(!this.$sidebar.showSidebar);
      } else {
        console.error("Sidebar component is not initialized.");
      }
    },
    redirectToBattlePage() {
      // Handle the routing logic here
      const router = useRouter();
      this.$router.push('/battle-page'); // Replace 'battle-page' with your actual route name
    },
    onLogoutClick() {
      // Clear the token from localStorage
      localStorage.removeItem('authToken');
      // Your logout logic
      isAuthenticated.value = false;
      // Add any additional logic for logout (e.g., redirecting to the login page)
    },
  },
};
</script>

