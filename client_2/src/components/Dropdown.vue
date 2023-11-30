<template>
  <component
    :is="tag"
    class="dropdown"
    :class="{ show: isOpen }"
    @click="toggleDropDown"
    @click-outside="closeDropDown"
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
      this.$emit("change-open-state", this.isOpen);
    },
    closeDropDown() {
      this.isOpen = false;
      this.$emit("change-open-state", false);
    },
  },
  directives: {
    clickOutside: {
      beforeMount(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener('click', el.clickOutsideEvent)
      },
      unmounted(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent)
      },
    },
  },
};
</script>

<style>
/* Add your dropdown styles here */
</style>
