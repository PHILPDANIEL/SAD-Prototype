<template>
  <div class="profile">
    <h1>Profile</h1>
    <div class="profile-pic">
      <img :src="user.profilePic || 'https://via.placeholder.com/100'" alt="Profile" />
    </div>
    <div class="profile-form">
      <label>Username: <input v-model="user.username" /></label>
      <label>Email: <input v-model="user.email" disabled /></label>
      <div class="addresses">
        <h3>Addresses</h3>
        <div v-for="(addr, index) in user.addresses || []" :key="index">
          <input v-model="addr.address" placeholder="Address" />
          <input v-model="addr.contact" placeholder="Contact" />
          <button @click="removeAddress(index)">Remove</button>
        </div>
        <button @click="addAddress">Add Address</button>
      </div>
      <button @click="saveProfile">Save Profile</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Profile",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")) || {}
    };
  },
  methods: {
    addAddress() {
      if (!this.user.addresses) this.user.addresses = [];
      this.user.addresses.push({ address: "", contact: "" });
    },
    removeAddress(index) {
      this.user.addresses.splice(index, 1);
    },
    saveProfile() {
      localStorage.setItem("user", JSON.stringify(this.user));
      alert("Profile saved!");
    }
  }
};
</script>

<style scoped>
.profile {
  padding: 2rem;
}
.profile-pic img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}
.profile-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.addresses div {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>