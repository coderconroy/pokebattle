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
        <sidebar-link to="/battle-page" name="Battle Page" icon="ti-game" />
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


<style lang="scss"></style>


<script>
import TopNavbar from "./TopNavbar.vue";
import DashboardContent from "./UserContent.vue";
import MobileMenu from "./MobileMenu";

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
  },
};
</script>

