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
          <th class="border px-2 py-1">User</th>
          <th class="border px-2 py-1">Total</th>
          <th class="border px-2 py-1">Status</th>
          <th class="border px-2 py-1">Date</th>
          <th class="border px-2 py-1">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order._id" class="hover:bg-gray-50">
          <td class="border px-2 py-1">{{ order._id }}</td>
          <td class="border px-2 py-1">{{ order.userId }}</td>
          <td class="border px-2 py-1">₱{{ order.total }}</td>
          <td class="border px-2 py-1 capitalize">{{ order.status }}</td>
          <td class="border px-2 py-1">{{ formatDate(order.createdAt) }}</td>
          <td class="border px-2 py-1 flex gap-1">
            <button @click="viewOrder(order)" class="btn btn-sm">View</button>

            <button 
              v-if="order.status !== 'completed'" 
              @click="updateStatus(order, 'completed')" 
              class="btn btn-sm btn-green"
            >
              Complete
            </button>

            <button 
              v-if="order.status !== 'canceled'" 
              @click="updateStatus(order, 'canceled')" 
              class="btn btn-sm btn-red"
            >
              Cancel
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Order Details Modal -->
    <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-4 w-1/2 rounded shadow">
        <h2 class="text-xl font-bold mb-2">Order Details</h2>

        <p><strong>User ID:</strong> {{ selectedOrder.userId }}</p>
        <p><strong>Status:</strong> {{ selectedOrder.status }}</p>
        <p><strong>Date:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>

        <p><strong>Items:</strong></p>
        <ul class="list-disc ml-6 mb-2">
          <li v-for="item in selectedOrder.items" :key="item._id">
            {{ item.name }} - {{ item.qty }} x ₱{{ item.price }}
          </li>
        </ul>

        <p><strong>Total:</strong> ₱{{ selectedOrder.total }}</p>

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
        const base = "http://localhost:5000/api/orders"
        let url = base

        if (filter === "today") {
          url = `${base}/today`
        } else if (["pending", "completed", "canceled"].includes(filter)) {
          url = `${base}?status=${filter}`
        }

        const res = await axios.get(url)

        console.log("FETCHED:", res.data)

        this.orders = Array.isArray(res.data)
          ? res.data
          : res.data.orders || []

      } catch (err) {
        console.error("FETCH ERROR:", err)
        alert("Failed to fetch orders")
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return "N/A"
      return new Date(dateStr).toLocaleString()
    },

    viewOrder(order) {
      this.selectedOrder = order
    },

    async updateStatus(order, status) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/orders/${order._id}`,
          { status }
        )

        console.log("UPDATED:", res.data)

        // ✅ Update UI instantly
        const index = this.orders.findIndex(o => o._id === order._id)
        if (index !== -1) {
          this.orders[index].status = res.data.status
        }

        // ✅ Sync modal
        if (this.selectedOrder && this.selectedOrder._id === order._id) {
          this.selectedOrder.status = res.data.status
        }

        alert(`Order marked as ${res.data.status}`)

      } catch (err) {
        console.error("UPDATE ERROR:", err)
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