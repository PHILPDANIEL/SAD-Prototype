<template>
  <div id="app" class="app-container">
    <Sidebar />
    <router-view />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue';
export default { components: { Sidebar } };
</script>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
}
</style>