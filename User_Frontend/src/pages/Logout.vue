<template>
  <div class="logout-page">
    <h2>Logging out...</h2>
  </div>
</template>

<script>
export default {
  name: "LogoutPage",

  mounted() {
    // Remove authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("cart");

    // Redirect to login page
    this.$router.push("/login");
  }
};
</script>

<style scoped>
.logout-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 20px;
}
</style>