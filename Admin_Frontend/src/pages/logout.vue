<template>
  <div class="logout">
    <h1>Logging out...</h1>
  </div>
</template>

<script>
export default {
  mounted() {
    localStorage.removeItem("isLoggedIn")
    window.location.href = "/login"
  }
}
</script>