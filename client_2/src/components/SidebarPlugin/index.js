import Sidebar from "./SideBar.vue";
import SidebarLink from "./SidebarLink";

const SidebarStore = {
  showSidebar: false,
  sidebarLinks: [],
  displaySidebar(value) {
    this.showSidebar = value;
  },
};

const SidebarPlugin = {
  install(app) { // Use 'app' instead of 'Vue'

    // Provide the reactive object using provide/inject
    app.provide("$sidebar", SidebarStore);

    // Register components globally
    app.component("side-bar", Sidebar);
    app.component("sidebar-link", SidebarLink);
  },
};

export default SidebarPlugin;
