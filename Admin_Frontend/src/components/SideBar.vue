<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>Sayotea Admin</h2>
    </div>
    <nav>
      <router-link to="/" class="sidebar-link" active-class="active">Dashboard</router-link>
      <router-link to="/orders" class="sidebar-link" active-class="active">Orders</router-link>
      <router-link to="/products" class="sidebar-link" active-class="active">Products</router-link>
      <router-link to="/inventory" class="sidebar-link" active-class="active">Inventory / Stock</router-link>
      <router-link to="/logout" class="sidebar-link" active-class="active">Logout</router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #1E1E2F;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.sidebar .logo {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.sidebar-link {
  display: block;
  padding: 12px 10px;
  margin-bottom: 5px;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

.sidebar-link:hover {
  background-color: #33334d;
}

.active {
  background-color: #4CAF50;
}
</style>