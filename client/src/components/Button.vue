<template>
  <component :is="tag" :type="nativeType" :disabled="disabled || loading" class="btn" :class="buttonClasses">
    <slot name="loading">
      <i v-if="loading" class="fa fa-spinner fa-spin"></i>
    </slot>
    <slot></slot>
  </component>
</template>

<script>
export default {
  name: "PButton",
  props: {
    tag: {
      type: String,
      default: "button",
    },
    round: Boolean,
    icon: Boolean,
    outline: Boolean,
    block: Boolean,
    loading: Boolean,
    disabled: Boolean,
    type: {
      type: String,
      default: "default",
    },
    nativeType: {
      type: String,
      default: "button",
    },
    size: {
      type: String,
      default: "",
    },
    simple: Boolean,
  },
  computed: {
    buttonClasses() {
      return {
        'btn-round': this.round,
        'btn-block': this.block,
        'btn-just-icon': this.icon,
        [`btn-${this.type}`]: this.type && !this.outline,
        [`btn-outline-${this.type}`]: this.type && this.outline,
        [`btn-${this.size}`]: this.size,
        'btn-link': this.simple,
      };
    },
  },
};
</script>

<style>
/* Add your button styles here */
</style>
