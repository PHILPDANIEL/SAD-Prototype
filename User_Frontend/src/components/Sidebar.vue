<template>
  <div class="sidebar">
    <h2 class="logo">Sayotea</h2>

    <router-link to="/">Dashboard</router-link>
    <router-link to="/store">Store</router-link>
    <router-link to="/orders">Orders</router-link>
    <router-link to="/profile">Profile</router-link>
    <router-link to="/logout">Logout</router-link>
  </div>
</template>

<style scoped>
.sidebar {
  width: 220px;
  height: 100vh;
  background: #6c5ce7;
  padding: 20px;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  margin-bottom: 30px;
}

a {
  color: white;
  text-decoration: none;
  margin: 10px 0;
}

a.router-link-active {
  font-weight: bold;
}
</style>