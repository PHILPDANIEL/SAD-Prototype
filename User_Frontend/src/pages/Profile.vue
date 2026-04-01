<template>
  <div class="profile-page">

    <h1 class="title">My Profile</h1>

    <div v-if="loading">Loading profile...</div>

    <div v-else class="profile-card">

      <!-- Profile Picture -->
      <div class="avatar-section">
        <img
          v-if="user.profilePicture"
          :src="user.profilePicture"
          class="avatar"
        />

        <div v-else class="avatar-fallback">
          {{ userInitials }}
        </div>

        <input type="file" @change="uploadImage" />
      </div>

      <!-- Profile Info -->
      <div class="form">

        <label>Username</label>
        <input v-model="user.username" type="text" />

        <label>Email</label>
        <input v-model="user.email" type="email" />

        <button @click="updateProfile">
          Save Changes
        </button>

      </div>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilePage",

  data() {
    return {
      user: {},
      loading: true
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
      const res = await axios.get(
        "http://localhost:5001/api/user/me",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.user = res.data;
      this.loading = false;

    } catch (err) {
      console.error("Profile load error:", err);
    }
  },

  methods: {
    async updateProfile() {
      const token = localStorage.getItem("token");

      try {
        await axios.put(
          "http://localhost:5000/api/user/update",
          {
            username: this.user.username,
            email: this.user.email,
            profilePicture: this.user.profilePicture
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        alert("Profile updated successfully!");
      } catch (err) {
        console.error("Update failed:", err);
      }
    },

    uploadImage(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.user.profilePicture = reader.result;
      };

      if (file) reader.readAsDataURL(file);
    }
  }
};
</script>

<style scoped>
.profile-page {
  padding: 25px;
}

.title {
  font-size: 28px;
  margin-bottom: 20px;
}

.profile-card {
  display: flex;
  gap: 30px;
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

.avatar-fallback {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #6c5ce7;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
}

.form {
  flex: 1;
  display: flex;
  flex-direction: column;
}

label {
  margin-top: 10px;
}

input {
  padding: 8px;
  margin-top: 5px;
}

button {
  margin-top: 20px;
  padding: 10px;
  background: #6c5ce7;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}
</style>