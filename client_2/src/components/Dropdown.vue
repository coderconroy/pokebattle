<template>
  <component
    :is="tag"
    class="dropdown"
    :class="{ show: isOpen }"
    @click="toggleDropDown"
    v-click-outside="closeDropDown"
  >
    <a
      class="dropdown-toggle btn-rotate"
      :class="titleClasses"
      href="#"
      @click.prevent
    >
      <slot name="title">
        <i :class="icon"></i>
        <span class="notification">{{ title }}<b class="caret"></b></span>
      </slot>
    </a>
    <ul class="dropdown-menu" :class="{ show: isOpen }">
      <slot></slot>
    </ul>
  </component>
</template>


<script>
export default {
  props: {
    tag: {
      type: String,
      default: "li",
    },
    title: String,
    icon: String,
    titleClasses: [String, Object, Array],
  },
  data() {
    return {
      isOpen: false,
    };
  },
  methods: {
    toggleDropDown() {
      this.isOpen = !this.isOpen;
    },
    closeDropDown() {
      this.isOpen = false;
    },
  },
  directives: {
    clickOutside: {
      beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
          // Check if click was outside the el and its children
          if (!(el === event.target || el.contains(event.target))) {
            // Invoke the method directly
            binding.value(event);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
      },
    },
  },
};
</script>


<style>
.dropdown {
  position: relative; /* Ensures the dropdown menu is positioned relative to this container */
}

.dropdown-menu {
  position: absolute; /* Absolutely position the dropdown menu */
  left: 50%; /* Move to 50% of the parent's width */
  transform: translateX(-50%); /* Pull back to the left by half of its own width */
  /* Add other styles like width, background, etc., as necessary */
}
</style>
