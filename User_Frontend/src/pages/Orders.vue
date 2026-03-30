<template>
  <div class="orders">
    <h1>Orders</h1>

    <div class="filters">
      <button @click="filterStatus('all')">All</button>
      <button @click="filterStatus('pending')">Pending</button>
      <button @click="filterStatus('completed')">Completed</button>
      <button @click="filterStatus('canceled')">Canceled</button>
    </div>

    <div class="orders-list">
      <div v-for="order in filteredOrders" :key="order._id" class="order-card">
        <h3>Order #{{ order._id }}</h3>
        <p>Status: {{ order.status }}</p>
        <p>Total: {{ order.totalAmount }} PHP</p>
        <p>Address: {{ order.deliveryInfo?.address }}</p>
        <p>Contact: {{ order.deliveryInfo?.contact }}</p>
        <div>
          <strong>Products:</strong>
          <ul>
            <li v-for="p in order.products" :key="p.productId">{{ p.name }} x {{ p.quantity }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Orders",
  data() {
    return {
      orders: [],
      filteredOrders: [],
      user: JSON.parse(localStorage.getItem("user")) || {}
    };
  },
  async mounted() {
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      const res = await axios.get("http://localhost:5001/api/orders");
      this.orders = res.data.filter(o => o.userId === this.user._id);
      this.filteredOrders = this.orders;
    },
    filterStatus(status) {
      if (status === "all") this.filteredOrders = this.orders;
      else this.filteredOrders = this.orders.filter(o => o.status === status);
    }
  }
};
</script>

<style scoped>
.orders {
  padding: 2rem;
}
.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}
.filters button {
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #f4f4f4;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.order-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
}
</style>