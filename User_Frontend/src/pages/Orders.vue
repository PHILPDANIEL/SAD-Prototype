<template>
  <div class="orders-page">

    <h1 class="title">My Orders</h1>
    <p class="subtitle">Track your orders</p>

    <div v-if="loading" class="loading">
      Loading orders...
    </div>

    <div v-else>

      <div v-if="orders.length === 0" class="empty">
        No orders yet.
      </div>

      <div v-for="order in orders" :key="order._id" class="order-card">

        <div class="order-header">
          <div>
            <strong>Order ID:</strong> {{ order._id }}
          </div>

          <div
            class="status"
            :class="order.status"
          >
            {{ order.status }}
          </div>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.productId"
            class="item"
          >
            {{ item.name }} × {{ item.qty }}
          </div>
        </div>

        <div class="order-footer">
          <div class="total">
            Total: ₱ {{ order.total }}
          </div>

          <div class="date">
            {{ formatDate(order.createdAt) }}
          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "OrdersPage",
  data() {
    return {
      orders: [],
      loading: true
    };
  },

  async mounted() {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.get(
        "http://localhost:5001/api/order/my-orders",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.orders = res.data;
      this.loading = false;

    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    }
  }
};
</script>

<style scoped>
.orders-page {
  padding: 25px;
}

.title {
  font-size: 28px;
}

.subtitle {
  color: gray;
  margin-bottom: 20px;
}

.loading {
  font-size: 18px;
}

.empty {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.order-card {
  background: white;
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.status {
  padding: 4px 10px;
  border-radius: 6px;
  text-transform: capitalize;
}

.status.pending {
  background: #ffeaa7;
}

.status.completed {
  background: #55efc4;
}

.order-items {
  margin-bottom: 10px;
}

.item {
  font-size: 14px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
}

.total {
  font-weight: bold;
}

.date {
  color: gray;
}
</style>