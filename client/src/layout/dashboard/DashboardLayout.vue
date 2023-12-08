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
        <a class="dropdown-item" @click.prevent="redirectToBattleReqPage">Battle Requests</a>
        <a class="dropdown-item" @click.prevent="redirectToBattleHistPage">Battles History</a>
        <!-- <a class="dropdown-item" @click.prevent="redirectToBattlePage">Active Battle Page</a> -->
        </drop-down>
        <!-- <sidebar-link to="/notifications" name="Notifications" icon="ti-bell" /> -->
        <sidebar-link to="/poke-discovered" name="Poke Discovered" icon="ti-gift" />
      </template>
      <mobile-menu>
        <drop-down class="nav-item" title-classes="nav-link" icon="ti-user" @click="onLogoutClick">
          <a class="dropdown-item" href="/login">Logout</a>
        </drop-down>
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
    redirectToBattleReqPage() {
      // Handle the routing logic here
      const router = useRouter();
      this.$router.push('/battle-req'); // Replace 'battle-page' with your actual route name
    },
    redirectToBattleHistPage() {
      // Handle the routing logic here
      const router = useRouter();
      this.$router.push('/battle-hist'); // Replace 'battle-page' with your actual route name
    },
    // redirectToBattlePage() {
    //   // Handle the routing logic here
    //   const router = useRouter();
    //   this.$router.push('/battle-page'); // Replace 'battle-page' with your actual route name
    // },
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

