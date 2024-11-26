<template>
  <Mainlayout>
    <div class="chart-container">
      <div class="chart-header">
        <h2>熱門商品分析</h2>
        <div class="filter-controls">
          <select v-model="selectedBrand" @change="updateChart">
            <option value="">所有品牌</option>
            <option value="Apple">Apple</option>
            <option value="Samsung">Samsung</option>
          </select>
          <select v-model="chartType" @change="changeChartType">
            <option value="bar">長條圖</option>
            <option value="pie">圓餅圖</option>
            <option value="line">折線圖</option>
          </select>
        </div>
      </div>
      <div class="chart-wrapper">
        <canvas ref="myChart"></canvas>
      </div>
    </div>
  </Mainlayout>
</template>

<script>
import Mainlayout from "@/components/index/mainlayout.vue";
import Chart from "chart.js";
import api from "@/api/axios";

export default {
  name: "ProductChart",
  components: {
    Mainlayout,
  },
  data() {
    return {
      chart: null,
      selectedBrand: "",
      chartType: "bar",
      productData: [],
    };
  },
  async mounted() {
    await this.fetchRealData();
    this.initChart();
  },
  methods: {
    initChart() {
      const ctx = this.$refs.myChart.getContext("2d");

      if (this.chart) {
        this.chart.destroy();
      }

      const filteredData = this.selectedBrand
        ? this.productData.filter(
            (item) => item.brand_name === this.selectedBrand
          )
        : this.productData;

      const data = {
        labels: filteredData.map((item) => item.product_name),
        datasets: [
          {
            label: "銷售數量",
            data: filteredData.map((item) => item.total_sales),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(75, 192, 192, 1)",
              "rgba(153, 102, 255, 1)",
            ],
            borderWidth: 1,
          },
        ],
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                callback: function (value) {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                },
              },
            },
          ],
        },
      };

      // 如果是圓餅圖，移除 scales 選項
      if (this.chartType === "pie") {
        delete options.scales;
      }

      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: data,
        options: options,
      });
    },
    updateChart() {
      this.initChart();
    },
    changeChartType() {
      this.initChart();
    },
    async fetchRealData() {
      try {
        const response = await api.get("/charts/product-sales");
        this.productData = response.data;
        this.initChart();
        console.log("Product data:", this.productData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.chart-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.filter-controls {
  display: flex;
  gap: 10px;
}

.filter-controls select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
}

.chart-wrapper {
  position: relative;
  height: 50vh; /* 使用視窗高度的 50% */
  width: 100%;
}

@media screen and (max-width: 768px) {
  .chart-container {
    padding: 15px;
  }

  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-controls {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-controls select {
    flex: 1;
    min-width: 150px;
  }

  .chart-wrapper {
    height: 40vh; /* 使用視窗高度的 40% */
  }
}

@media screen and (max-width: 480px) {
  .chart-header h2 {
    font-size: 1.2rem;
  }

  .chart-wrapper {
    height: 30vh; /* 使用視窗高度的 30% */
  }
}
</style>
