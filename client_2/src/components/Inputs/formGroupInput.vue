<template>
  <div class="form-group" :class="{ 'input-group': hasIcon }">
    <label v-if="label" class="control-label">
      {{ label }}
    </label>
    <div v-if="hasIcon" class="input-wrapper">
      <span v-if="addonLeftIcon" class="input-group-prepend">
        <i :class="addonLeftIcon" class="input-group-text"></i>
      </span>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
        class="form-control"
        :aria-describedby="computedAriaDescribedby"
      />
      <span v-if="addonRightIcon" class="input-group-append">
        <i :class="addonRightIcon" class="input-group-text"></i>
      </span>
    </div>
    <input v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      v-bind="$attrs"
      class="form-control"
    />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  name: "FormGroupInput",
  emits: ['update:modelValue'],
  props: {
    label: String,
    modelValue: [String, Number],
    addonRightIcon: String,
    addonLeftIcon: String,
  },
  computed: {
    hasIcon() {
      return this.addonRightIcon || this.addonLeftIcon;
    },
    computedAriaDescribedby() {
      let describedby = [];
      if (this.addonLeftIcon) describedby.push('addon-left');
      if (this.addonRightIcon) describedby.push('addon-right');
      return describedby.join(' ');
    }
  },
};
</script>

<style>
.form-group {
  /* Styles for the form group */
}

.input-group-prepend, .input-group-append {
  /* Styles for input group addons */
}

.form-control {
  /* Styles for the input */
}
</style>
