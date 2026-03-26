<template>
  <div class="page">
    <h1>Dashboard</h1>

    <div class="cards">
      <div class="card">
        <h3>Orders Today</h3>
        <p>{{ ordersToday }}</p>
      </div>

      <div class="card">
        <h3>Best Seller</h3>
        <p>{{ bestSeller }}</p>
      </div>
    </div>

    <div class="chart">
      <h3>Weekly Sales</h3>
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script>
import axios from "axios"
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from "chart.js"

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
)

export default {
  components: { Bar },

  data() {
    return {
      ordersToday: 0,
      bestSeller: "Loading...",
      chartData: null,
      chartOptions: {
        responsive: true
      }
    }
  },

  async mounted() {
    this.fetchDashboard()
  },

  methods: {
    async fetchDashboard() {
      try {
        const sales = await axios.get("/api/sales")

        const labels = sales.data.map(s => s.day)
        const totals = sales.data.map(s => s.totalSales)

        this.chartData = {
          labels,
          datasets: [
            {
              label: "Sales",
              data: totals
            }
          ]
        }

        const orders = await axios.get("/api/orders")
        this.ordersToday = orders.data.length

        this.bestSeller = "Milk Tea" // temporary
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>