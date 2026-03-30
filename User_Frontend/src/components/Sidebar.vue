<template>
  <div class="sidebar">
    <h2>User Dashboard</h2>
    <ul>
      <li><router-link to="/home">Home</router-link></li>
      <li><router-link to="/store">Store</router-link></li>
      <li><router-link to="/orders">Orders</router-link></li>
      <li><router-link to="/profile">Profile</router-link></li>
      <li @click="logout">Logout</li>
    </ul>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem("user");
      this.$router.push("/home");
    },
  },
};
</script>

<style>
/* Basic styling, customize later */
.sidebar { width: 200px; padding: 20px; background: #f1f1f1; }
.sidebar ul { list-style: none; padding: 0; }
.sidebar li { margin: 15px 0; cursor: pointer; }
</style>