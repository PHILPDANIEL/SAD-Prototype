<template>
  <div class="home">
    <h1>Welcome, {{ user.username }}</h1>
    <p>Your latest orders summary:</p>

    <div class="summary-cards">
      <div class="card">
        <h3>Total Orders</h3>
        <p>{{ totalOrders }}</p>
      </div>
      <div class="card">
        <h3>Pending Orders</h3>
        <p>{{ pendingOrders }}</p>
      </div>
      <div class="card">
        <h3>Completed Orders</h3>
        <p>{{ completedOrders }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || {},
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0
    };
  },
  async mounted() {
    try {
      const res = await fetch("http://localhost:5001/api/orders");
      const orders = await res.json();
      const userOrders = orders.filter(o => o.userId === this.user._id);
      this.totalOrders = userOrders.length;
      this.pendingOrders = userOrders.filter(o => o.status === "pending").length;
      this.completedOrders = userOrders.filter(o => o.status === "completed").length;
    } catch (err) {
      console.error(err);
    }
  }
};
</script>

<style scoped>
.home {
  padding: 2rem;
}
.summary-cards {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.card {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  flex: 1;
  text-align: center;
  box-shadow: 0 0 8px rgba(0,0,0,0.1);
}
.card h3 {
  margin-bottom: 0.5rem;
}
</style>