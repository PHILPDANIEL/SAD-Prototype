<template>
  <div class="auth-page">

    <h1>Login</h1>

    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Login</button>

    <p>
      No account?
      <router-link to="/register">Register</router-link>
    </p>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: ""
    };
  },

  mounted() {
    // auto redirect if already logged in
    const token = localStorage.getItem("token");
    if (token) {
      this.$router.push("/");
    }
  },

  methods: {
    async login() {
      try {
        const res = await axios.post(
          "http://localhost:5001/api/auth/login",
          {
            email: this.email,
            password: this.password
          }
        );

        localStorage.setItem("token", res.data.token);

        alert("Login successful!");
        this.$router.push("/");

      } catch (error) {
        alert("Invalid login");
      }
    }
  }
};
</script>