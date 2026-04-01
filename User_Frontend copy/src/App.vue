<template>
  <div class="app-layout">
    <Sidebar />
    <div class="page-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue"

export default {
  components: { Sidebar }
}
</script>

<style>
.app-layout {
  display: flex;
}

.page-content {
  flex: 1;
  padding: 20px;
}
</style>