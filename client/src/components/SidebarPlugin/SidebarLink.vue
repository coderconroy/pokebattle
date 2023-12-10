<template>
  <component :is="tag" @click="hideSidebar" class="nav-item" v-bind="$attrs" tag="li">
    <a class="nav-link">
      <slot>
        <i v-if="icon" :class="icon"></i>
        <p>{{ name }}</p>
      </slot>
    </a>
  </component>
</template>

<script>
export default {
  name: "sidebar-link",
  inheritAttrs: false,
  inject: {
    autoClose: {
      default: true,
    },
    addLink: {
      default: () => { },
    },
    removeLink: {
      default: () => { },
    },
    sidebar: { // Injecting the sidebar object
      default: () => ({})
    }
  },
  props: {
    name: String,
    icon: String,
    tag: {
      type: String,
      default: "router-link",
    },
  },
  methods: {
    hideSidebar() {
      if (this.autoClose && this.sidebar.displaySidebar) {
        this.sidebar.displaySidebar(false);
      }
    },
    isActive() {
      return this.$el.classList.contains("active");
    },
  },
  mounted() {
    if (this.addLink) {
      this.addLink(this);
    }
  },
  beforeDestroy() {
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
    if (this.removeLink) {
      this.removeLink(this);
    }
  },
};
</script>

<style>
/* Add your styles here */
.nav-item {
  /* Example style */
  padding: 0.5rem 1rem;
}

.nav-link {
  /* Example style */
  color: #333;
  text-decoration: none;
}
</style>
