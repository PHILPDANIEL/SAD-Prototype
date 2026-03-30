<script>
export default {
  methods: {
    logout() {
      localStorage.removeItem("user");
      this.$router.push("/login"); // redirect to login page
    }
  }
};
</script>