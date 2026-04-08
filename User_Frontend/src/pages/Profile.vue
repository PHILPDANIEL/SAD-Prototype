<template>
  <div class="profile-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">My Profile</h1>
        <p class="page-sub">Manage your account details</p>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile...</p>
    </div>

    <div v-else class="profile-layout">

      <!-- Left: Avatar Card -->
      <div class="avatar-card">
        <div class="avatar-wrap">
          <img v-if="previewImage || user.profilePicture"
            :src="previewImage || user.profilePicture"
            class="avatar-img"
            alt="Profile"
          />
          <div v-else class="avatar-fallback">{{ userInitials }}</div>

          <!-- Camera overlay -->
          <label class="avatar-overlay" for="avatar-upload">
            <span>📷</span>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            class="file-input"
            @change="handleImageUpload"
          />
        </div>

        <h2 class="avatar-name">{{ user.username }}</h2>
        <p class="avatar-email">{{ user.email }}</p>
        <span class="role-pill">{{ user.role || 'Staff' }}</span>

        <div class="member-since" v-if="user.createdAt">
          <span>🗓 Member since {{ formatDate(user.createdAt) }}</span>
        </div>
      </div>

      <!-- Right: Forms -->
      <div class="forms-col">

        <!-- Account Info -->
        <div class="form-card">
          <h3 class="form-title">Account Information</h3>

          <div class="field-group">
            <label>Username</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="Your display name"
              :class="{ 'has-error': errors.username }"
            />
            <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
          </div>

          <div class="field-group">
            <label>Email Address</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              :class="{ 'has-error': errors.email }"
            />
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </div>

          <div class="form-footer">
            <button class="btn-save" :disabled="saving" @click="saveProfile">
              <span v-if="saving">Saving...</span>
              <span v-else>💾 Save Changes</span>
            </button>
          </div>
        </div>

        <!-- Change Password -->
        <div class="form-card">
          <h3 class="form-title">Change Password</h3>

          <div class="field-group">
            <label>Current Password</label>
            <div class="password-wrap">
              <input
                v-model="passwords.current"
                :type="showPasswords.current ? 'text' : 'password'"
                placeholder="Enter current password"
              />
              <button class="eye-btn" @click="togglePassword('current')">
                {{ showPasswords.current ? '🙈' : '👁' }}
              </button>
            </div>
          </div>

          <div class="field-group">
            <label>New Password</label>
            <div class="password-wrap">
              <input
                v-model="passwords.new"
                :type="showPasswords.new ? 'text' : 'password'"
                placeholder="At least 6 characters"
                :class="{ 'has-error': errors.newPassword }"
              />
              <button class="eye-btn" @click="togglePassword('new')">
                {{ showPasswords.new ? '🙈' : '👁' }}
              </button>
            </div>

            <!-- Strength bar -->
            <div class="strength-bar" v-if="passwords.new">
              <div class="strength-fill" :class="passwordStrengthClass" :style="{ width: passwordStrengthWidth }"></div>
            </div>
            <span class="strength-label" v-if="passwords.new">{{ passwordStrengthLabel }}</span>
          </div>

          <div class="field-group">
            <label>Confirm New Password</label>
            <div class="password-wrap">
              <input
                v-model="passwords.confirm"
                :type="showPasswords.confirm ? 'text' : 'password'"
                placeholder="Repeat new password"
                :class="{ 'has-error': errors.confirmPassword }"
              />
              <button class="eye-btn" @click="togglePassword('confirm')">
                {{ showPasswords.confirm ? '🙈' : '👁' }}
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
          </div>

          <div class="form-footer">
            <button class="btn-save" :disabled="changingPassword" @click="changePassword">
              <span v-if="changingPassword">Updating...</span>
              <span v-else>🔒 Update Password</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilePage",

  data() {
    return {
      user: {},
      loading: true,
      saving: false,
      changingPassword: false,
      previewImage: null,

      form: {
        username: "",
        email: "",
        profilePicture: ""
      },

      passwords: {
        current: "",
        new: "",
        confirm: ""
      },

      showPasswords: {
        current: false,
        new: false,
        confirm: false
      },

      errors: {},
      toast: { show: false, message: "", type: "success" }
    };
  },

  computed: {
    userInitials() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : "U";
    },

    passwordStrength() {
      const p = this.passwords.new;
      if (!p) return 0;
      let score = 0;
      if (p.length >= 6) score++;
      if (p.length >= 10) score++;
      if (/[A-Z]/.test(p)) score++;
      if (/[0-9]/.test(p)) score++;
      if (/[^a-zA-Z0-9]/.test(p)) score++;
      return score;
    },

    passwordStrengthClass() {
      if (this.passwordStrength <= 1) return "weak";
      if (this.passwordStrength <= 3) return "fair";
      return "strong";
    },

    passwordStrengthWidth() {
      return `${(this.passwordStrength / 5) * 100}%`;
    },

    passwordStrengthLabel() {
      if (this.passwordStrength <= 1) return "Weak";
      if (this.passwordStrength <= 3) return "Fair";
      return "Strong";
    }
  },

  async mounted() {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5001/api/user/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.user = res.data;
      this.form.username = res.data.username;
      this.form.email = res.data.email;
      this.form.profilePicture = res.data.profilePicture || "";
    } catch (err) {
      console.error("Profile load error:", err);
      this.showToast("Failed to load profile", "error");
    } finally {
      this.loading = false;
    }
  },

  methods: {
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        this.showToast("Image must be under 2MB", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
        this.form.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    validateProfile() {
      this.errors = {};
      if (!this.form.username.trim()) this.errors.username = "Username is required";
      if (!this.form.email.trim()) this.errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(this.form.email)) this.errors.email = "Invalid email format";
      return Object.keys(this.errors).length === 0;
    },

    async saveProfile() {
      if (!this.validateProfile()) return;

      this.saving = true;
      const token = localStorage.getItem("token");

      try {
        await axios.put(
          "http://localhost:5001/api/user/update",
          {
            username: this.form.username,
            email: this.form.email,
            profilePicture: this.form.profilePicture
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.user.username = this.form.username;
        this.user.email = this.form.email;
        this.user.profilePicture = this.form.profilePicture;
        this.showToast("✅ Profile updated successfully!");
      } catch (err) {
        this.showToast("Failed to update profile", "error");
      } finally {
        this.saving = false;
      }
    },

    async changePassword() {
      this.errors = {};

      if (!this.passwords.current) {
        this.errors.confirmPassword = "Enter your current password";
        return;
      }
      if (this.passwords.new.length < 6) {
        this.errors.newPassword = "Password must be at least 6 characters";
        return;
      }
      if (this.passwords.new !== this.passwords.confirm) {
        this.errors.confirmPassword = "Passwords do not match";
        return;
      }

      this.changingPassword = true;
      const token = localStorage.getItem("token");

      try {
        await axios.put(
          "http://localhost:5001/api/user/change-password",
          {
            currentPassword: this.passwords.current,
            newPassword: this.passwords.new
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.passwords = { current: "", new: "", confirm: "" };
        this.showToast("🔒 Password changed successfully!");
      } catch (err) {
        const msg = err.response?.data?.message || "Failed to change password";
        this.showToast(msg, "error");
      } finally {
        this.changingPassword = false;
      }
    },

    togglePassword(field) {
      this.showPasswords[field] = !this.showPasswords[field];
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric"
      });
    },

    showToast(message, type = "success") {
      this.toast = { show: true, message, type };
      setTimeout(() => { this.toast.show = false; }, 3000);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Lato:wght@400;700&display=swap');

* { box-sizing: border-box; }

.profile-page {
  min-height: 100vh;
  background: #f5f1ec;
  padding: 0;
  font-family: 'Lato', sans-serif;
}

/* Header */
.page-header {
  background: #1e1209;
  padding: 20px 28px;
  border-bottom: 3px solid #c87941;
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 22px;
  color: #f5c87a;
  margin: 0 0 3px;
}

.page-sub {
  font-size: 13px;
  color: #9e8070;
  margin: 0;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 80px;
  color: #8a7060;
}

.spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2d9d0;
  border-top-color: #c87941;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Layout */
.profile-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  padding: 24px 28px;
  align-items: start;
}

@media (max-width: 760px) {
  .profile-layout { grid-template-columns: 1fr; }
}

/* Avatar Card */
.avatar-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  padding: 28px 20px;
  text-align: center;
  border: 1.5px solid #ede8e2;
}

.avatar-wrap {
  position: relative;
  width: 110px;
  height: 110px;
  margin: 0 auto 14px;
}

.avatar-img {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f5c87a;
}

.avatar-fallback {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #1e1209;
  color: #f5c87a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 38px;
  font-weight: 700;
  border: 3px solid #f5c87a;
}

.avatar-overlay {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: #c87941;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: background 0.2s;
}
.avatar-overlay:hover { background: #a0612e; }

.file-input { display: none; }

.avatar-name {
  font-family: 'Sora', sans-serif;
  font-size: 17px;
  color: #1e1209;
  margin: 0 0 4px;
}

.avatar-email {
  font-size: 12px;
  color: #9e8c7c;
  margin: 0 0 10px;
  word-break: break-all;
}

.role-pill {
  display: inline-block;
  background: #1e1209;
  color: #f5c87a;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-family: 'Sora', sans-serif;
}

.member-since {
  font-size: 11px;
  color: #bbb0a6;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1.5px dashed #e8e0d8;
}

/* Forms */
.forms-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  border: 1.5px solid #ede8e2;
  overflow: hidden;
}

.form-title {
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #1e1209;
  margin: 0;
  padding: 16px 20px;
  border-bottom: 1.5px solid #f0ebe4;
  background: #faf7f3;
}

.field-group {
  padding: 14px 20px 0;
}
.field-group:last-of-type { padding-bottom: 0; }

.field-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b5c4e;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.field-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2d9d0;
  border-radius: 10px;
  font-family: 'Lato', sans-serif;
  font-size: 14px;
  color: #1e1209;
  background: #faf8f5;
  outline: none;
  transition: border-color 0.2s;
}

.field-group input:focus {
  border-color: #c87941;
  background: white;
}

.field-group input.has-error {
  border-color: #e74c3c;
  background: #fff5f5;
}

.error-msg {
  display: block;
  font-size: 11px;
  color: #e74c3c;
  margin-top: 4px;
}

/* Password field */
.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-right: 44px;
}

.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}

/* Strength bar */
.strength-bar {
  height: 4px;
  background: #e8e0d8;
  border-radius: 99px;
  margin-top: 8px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s, background 0.3s;
}

.strength-fill.weak   { background: #e74c3c; }
.strength-fill.fair   { background: #f39c12; }
.strength-fill.strong { background: #27ae60; }

.strength-label {
  font-size: 11px;
  font-weight: 700;
  display: block;
  margin-top: 3px;
  color: #9e8c7c;
}

/* Form Footer */
.form-footer {
  padding: 16px 20px;
  border-top: 1.5px solid #f0ebe4;
  margin-top: 14px;
  background: #faf7f3;
  display: flex;
  justify-content: flex-end;
}

.btn-save {
  padding: 10px 24px;
  background: #1e1209;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) { background: #3a2010; }
.btn-save:disabled { background: #c4b8ac; cursor: not-allowed; }

/* Toast */
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 28px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  z-index: 500;
  white-space: nowrap;
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
  font-family: 'Lato', sans-serif;
}

.toast.success { background: #1e1209; color: #f5c87a; }
.toast.error   { background: #c0392b; color: white; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>