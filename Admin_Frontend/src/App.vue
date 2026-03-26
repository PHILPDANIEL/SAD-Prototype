<template>
  <div class="admin-layout">
    <Sidebar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Sidebar from "./components/SideBar.vue";

export default {
  name: "App",
  components: {
    Sidebar,
  },
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
  overflow-y: auto;
}
</style>