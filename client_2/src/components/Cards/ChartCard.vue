<template>
  <Card>
    <template v-slot:header>
      <h4 v-if="title" class="card-title">{{ title }}</h4>
      <p v-if="subTitle" class="card-category">{{ subTitle }}</p>
    </template>

    <div class="chart-container">
      <div :id="chartId" class="ct-chart"></div>
    </div>

    <template v-slot:footer>
      <div class="footer">
        <div class="chart-legend">
          <slot name="legend"></slot>
        </div>
        <hr />
        <div class="stats">
          {{ footerText }}
        </div>
      </div>
    </template>
  </Card>
</template>

<script>
import Card from "./Card.vue";

export default {
  name: "ChartCard",
  components: {
    Card,
  },
  props: {
    title: String,
    subTitle: String,
    footerText: String,
    chartType: {
      type: String,
      default: "Line", // Line | Pie | Bar
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
    chartData: {
      type: Object,
      default: () => ({
        labels: [],
        series: [],
      }),
    },
  },
  data() {
    return {
      chartId: `chart-${Math.random().toString(36).substr(2, 9)}`,
    };
  },
  mounted() {
    import("chartist").then((Chartist) => {
      const ChartistLib = Chartist.default || Chartist;
      this.$nextTick(() => {
        this.initChart(ChartistLib);
      });
    });
  },
  methods: {
    initChart(Chartist) {
      const chartIdQuery = `#${this.chartId}`;
      Chartist[this.chartType](chartIdQuery, this.chartData, this.chartOptions);
    },
  },
};
</script>

<style scoped>
/* Add styles specific to ChartCard here */
.chart-container {
  /* Example style for the chart container */
  padding: 15px;
}

.ct-chart {
  /* Styles for the chart itself */
}

.footer {
  /* Styles for the footer section */
}

.chart-legend {
  /* Styles for the chart legend */
}

.stats {
  /* Styles for the stats section */
}
</style>

