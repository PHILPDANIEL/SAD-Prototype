<template>
  <div class="orders-page p-4">
    <h1 class="text-2xl font-bold mb-4">Orders</h1>

    <!-- Filters -->
    <div class="flex gap-4 mb-4">
      <button @click="fetchOrders()" class="btn">All</button>
      <button @click="fetchOrders('today')" class="btn">Today</button>
      <button @click="fetchOrders('pending')" class="btn">Pending</button>
      <button @click="fetchOrders('completed')" class="btn">Completed</button>
      <button @click="fetchOrders('canceled')" class="btn">Canceled</button>
    </div>

    <!-- Orders Table -->
    <table class="w-full border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-2 py-1">Order ID</th>
          <th class="border px-2 py-1">Customer</th>
          <th class="border px-2 py-1">Total</th>
          <th class="border px-2 py-1">Status</th>
          <th class="border px-2 py-1">Date</th>
          <th class="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50">
          <td class="border px-2 py-1">{{ order._id }}</td>
          <td class="border px-2 py-1">{{ order.customerName }}</td>
          <td class="border px-2 py-1">₱{{ order.totalAmount }}</td>
          <td class="border px-2 py-1 capitalize">{{ order.status }}</td>
          <td class="border px-2 py-1">{{ formatDate(order.date) }}</td>
          <td class="border px-2 py-1 flex gap-1">
            <button @click="viewOrder(order)" class="btn btn-sm">View</button>
            <button v-if="order.status !== 'completed'" @click="updateStatus(order, 'completed')" class="btn btn-sm btn-green">Complete</button>
            <button v-if="order.status !== 'canceled'" @click="updateStatus(order, 'canceled')" class="btn btn-sm btn-red">Cancel</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-4 w-1/2 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Order Details</h2>
        <p><strong>Customer:</strong> {{ selectedOrder.customerName }}</p>
        <p><strong>Address:</strong> {{ selectedOrder.customerAddress || 'N/A' }}</p>
        <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
        <p><strong>Date:</strong> {{ formatDate(selectedOrder.date) }}</p>
        <p><strong>Products:</strong></p>
        <ul class="list-disc ml-6 mb-2">
          <li v-for="item in selectedOrder.products" :key="item.productId">
            {{ item.name }} - {{ item.quantity }} x ₱{{ item.price }}
          </li>
        </ul>
        <p><strong>Total:</strong> ₱{{ selectedOrder.totalAmount }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="selectedOrder = null" class="btn">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: "OrdersPage",
  data() {
    return {
      orders: [],
      selectedOrder: null
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders(filter = null) {
      try {
        let url = "/api/orders"
        if (filter === "today") url = "/api/orders/today"
        else if (["pending", "completed", "canceled"].includes(filter)) url = `/api/orders?status=${filter}`

        const res = await axios.get(url)
        this.orders = res.data
      } catch (err) {
        console.error(err)
        alert("Failed to fetch orders")
      }
    },
    formatDate(dateStr) {
      const d = new Date(dateStr)
      return d.toLocaleString()
    },
    viewOrder(order) {
      this.selectedOrder = order
    },
    async updateStatus(order, status) {
      try {
        const res = await axios.put(`/api/orders/${order._id}`, { status })
        alert(`Order status updated to ${res.data.status}`)
        this.fetchOrders()
      } catch (err) {
        console.error(err)
        alert("Failed to update status")
      }
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  cursor: pointer;
}
.btn:hover { background-color: #e0e0e0; }
.btn-green { background-color: #4caf50; color: white; }
.btn-green:hover { background-color: #45a049; }
.btn-red { background-color: #f44336; color: white; }
.btn-red:hover { background-color: #e53935; }
.btn-sm { font-size: 0.8rem; padding: 2px 6px; }
</style>