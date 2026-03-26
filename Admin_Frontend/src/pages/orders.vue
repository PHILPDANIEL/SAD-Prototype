<template>
  <div class="page">
    <h1>Orders</h1>

    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="order in orders" :key="order._id">
          <td>{{ order.orderId }}</td>
          <td>{{ order.customerName }}</td>
          <td>{{ order.totalAmount }}</td>
          <td>{{ order.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      orders: []
    }
  },

  async mounted() {
    try {
      const res = await axios.get("/api/orders")
      this.orders = res.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>