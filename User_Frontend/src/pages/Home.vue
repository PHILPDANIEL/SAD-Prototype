<template>
  <div class="dashboard">

    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-left">
        <div class="avatar-wrapper">
          <img
            v-if="user.profilePicture"
            :src="user.profilePicture"
            class="avatar"
          />
          <div v-else class="avatar-fallback">
            {{ userInitials }}
          </div>
        </div>

        <div>
          <h1>Welcome back, {{ user.username }}</h1>
          <p>Here is your activity overview.</p>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats">
      <div class="card">
        <h3>Total Orders</h3>
        <p>{{ stats.total }}</p>
      </div>

      <div class="card">
        <h3>Pending Orders</h3>
        <p>{{ stats.pending }}</p>
      </div>

      <div class="card">
        <h3>Completed Orders</h3>
        <p>{{ stats.completed }}</p>
      </div>
    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomePage",
  data() {
    return {
      user: {},
      stats: {
        total: 0,
        pending: 0,
        completed: 0
      }
    };
  },

  computed: {
    userInitials() {
      if (!this.user.username) return "U";
      return this.user.username.charAt(0).toUpperCase();
    }
  },

  async mounted() {
    const token = localStorage.getItem("token");

    try {
      // Get logged in user info
      const userRes = await axios.get("http://localhost:5001/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.user = userRes.data;

      // Get dashboard stats
      const statsRes = await axios.get(
        "http://localhost:5001/api/order/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.stats = statsRes.data;

    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  }
};
</script>

<style scoped>
.dashboard {
  padding: 25px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar-wrapper {
  width: 55px;
  height: 55px;
}

.avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
}

.avatar-fallback {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #6c5ce7;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.card h3 {
  margin-bottom: 10px;
  color: #555;
}

.card p {
  font-size: 24px;
  font-weight: bold;
}
</style>