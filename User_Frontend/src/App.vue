<template>
  <div class="layout">
    <Sidebar />
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";

export default {
  components: {
    Sidebar
  }
};
</script>

<style>
.layout {
  display: flex;
}

.content {
  flex: 1;
  background: #f5f6fa;
  min-height: 100vh;
}
</style>