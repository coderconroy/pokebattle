<template>
  <table class="table" :class="tableClass">
    <thead>
      <slot name="columns">
        <th v-for="column in columns" :key="column">{{ column }}</th>
      </slot>
    </thead>
    <tbody>
      <tr v-for="(item, index) in data" :key="item.id || index">
        <slot :row="item" name="row">
          <td
            v-for="column in columns"
            :key="column"
            v-if="hasValue(item, column)"
          >
            {{ itemValue(item, column) }}
          </td>
        </slot>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "PaperTable",
  props: {
    columns: Array,
    data: Array,
    type: {
      type: String, // striped | hover
      default: "striped",
    },
  },
  computed: {
    tableClass() {
      return `table-${this.type}`;
    },
  },
  methods: {
    hasValue(item, column) {
      // Check if item and column are defined
      if (!item || !column) {
        return false;
      }

      // Check if the item has the specified property
      return typeof item[column.toLowerCase()] !== 'undefined';
    },
    itemValue(item, column) {
      // Check if item and column are defined
      if (!item || !column) {
        return '';
      }

      // Return the item's property value or an empty string if not found
      return item[column.toLowerCase()] || '';
    },
  },
};
</script>

<style>
/* Your table styles here */
</style>
