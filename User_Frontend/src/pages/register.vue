<template>
  <div class="auth-page">
    <h1>Register</h1>

    <input v-model="username" placeholder="Username" />
    <input v-model="email" type="email" placeholder="Email" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="register">Register</button>

    <p>
      Already have an account?
      <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      username: "",
      email: "",
      password: ""
    };
  },
  methods: {
    async register() {
      try {
        await axios.post("http://localhost:5001/api/auth/register", {
          username: this.username,
          email: this.email,
          password: this.password
        });

        alert("Registered successfully!");
        this.$router.push("/login");

      } catch (error) {
        alert("Registration failed");
      }
    }
  }
};
</script>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: column;
  width: 250px;
  margin: 100px auto;
}
input {
  margin: 10px 0;
  padding: 8px;
}
button {
  padding: 10px;
  background: #00b894;
  color: white;
  border: none;
}
</style>