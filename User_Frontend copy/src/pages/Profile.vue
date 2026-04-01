<template>
  <div class="profile-page">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Profile</h1>
        <p class="page-sub">Manage your account information</p>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="skeleton-layout">
      <div class="skeleton-card tall"></div>
      <div class="skeleton-right">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else class="profile-layout">

      <!-- Left: Avatar Card -->
      <div class="avatar-card">
        <div class="avatar-ring">
          <div class="avatar-wrap">
            <img v-if="preview || user.profilePicture" :src="preview || user.profilePicture" alt="avatar" class="avatar-img" />
            <div v-else class="avatar-fallback">{{ userInitials }}</div>
            <label class="avatar-upload-btn" title="Change photo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <input type="file" accept="image/*" hidden @change="handleAvatarChange" />
            </label>
          </div>
        </div>

        <h2 class="avatar-name">{{ user.username || '—' }}</h2>
        <p class="avatar-role">
          <span class="role-badge">{{ user.role || 'Staff' }}</span>
        </p>
        <p class="avatar-email">{{ user.email || '—' }}</p>

        <div class="divider"></div>

        <!-- Quick Stats -->
        <div class="profile-stats">
          <div class="pstat">
            <span class="pstat-value">{{ stats.total ?? '—' }}</span>
            <span class="pstat-label">Total Orders</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <span class="pstat-value">{{ stats.completed ?? '—' }}</span>
            <span class="pstat-label">Completed</span>
          </div>
          <div class="pstat-divider"></div>
          <div class="pstat">
            <span class="pstat-value">{{ stats.pending ?? '—' }}</span>
            <span class="pstat-label">Pending</span>
          </div>
        </div>

        <div class="divider"></div>

        <p class="member-since">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Member since {{ memberSince }}
        </p>
      </div>

      <!-- Right: Forms -->
      <div class="forms-col">

        <!-- Edit Profile Card -->
        <div class="form-card">
          <div class="form-card-header">
            <div class="form-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3 class="form-card-title">Personal Information</h3>
              <p class="form-card-sub">Update your name and email</p>
            </div>
          </div>

          <form class="form" @submit.prevent="updateProfile">
            <div class="form-row">
              <div class="field">
                <label class="field-label">Username</label>
                <input
                  v-model="form.username"
                  type="text"
                  class="field-input"
                  placeholder="Your username"
                  :class="{ error: errors.username }"
                />
                <span class="field-error" v-if="errors.username">{{ errors.username }}</span>
              </div>
              <div class="field">
                <label class="field-label">Email Address</label>
                <input
                  v-model="form.email"
                  type="email"
                  class="field-input"
                  placeholder="your@email.com"
                  :class="{ error: errors.email }"
                />
                <span class="field-error" v-if="errors.email">{{ errors.email }}</span>
              </div>
            </div>

            <div class="field">
              <label class="field-label">Role</label>
              <input
                v-model="user.role"
                type="text"
                class="field-input"
                disabled
              />
              <span class="field-hint">Role can only be changed by an administrator.</span>
            </div>

            <div class="form-actions">
              <button type="button" class="reset-btn" @click="resetProfileForm">Reset</button>
              <button type="submit" class="save-btn" :disabled="profileSaving">
                <svg v-if="profileSaving" class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {{ profileSaving ? 'Saving…' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Change Password Card -->
        <div class="form-card">
          <div class="form-card-header">
            <div class="form-card-icon security">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
            </div>
            <div>
              <h3 class="form-card-title">Change Password</h3>
              <p class="form-card-sub">Keep your account secure</p>
            </div>
          </div>

          <form class="form" @submit.prevent="changePassword">
            <div class="field">
              <label class="field-label">Current Password</label>
              <div class="password-wrap">
                <input
                  v-model="pwForm.current"
                  :type="showPw.current ? 'text' : 'password'"
                  class="field-input"
                  placeholder="Enter current password"
                  :class="{ error: pwErrors.current }"
                />
                <button type="button" class="eye-btn" @click="showPw.current = !showPw.current">
                  <svg v-if="!showPw.current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <span class="field-error" v-if="pwErrors.current">{{ pwErrors.current }}</span>
            </div>

            <div class="form-row">
              <div class="field">
                <label class="field-label">New Password</label>
                <div class="password-wrap">
                  <input
                    v-model="pwForm.newPw"
                    :type="showPw.newPw ? 'text' : 'password'"
                    class="field-input"
                    placeholder="New password"
                    :class="{ error: pwErrors.newPw }"
                    @input="checkStrength"
                  />
                  <button type="button" class="eye-btn" @click="showPw.newPw = !showPw.newPw">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <!-- Password strength -->
                <div class="strength-bar" v-if="pwForm.newPw">
                  <div
                    class="strength-fill"
                    :class="strengthClass"
                    :style="{ width: strengthWidth }"
                  ></div>
                </div>
                <span class="strength-label" v-if="pwForm.newPw" :class="strengthClass">
                  {{ strengthLabel }}
                </span>
                <span class="field-error" v-if="pwErrors.newPw">{{ pwErrors.newPw }}</span>
              </div>

              <div class="field">
                <label class="field-label">Confirm New Password</label>
                <div class="password-wrap">
                  <input
                    v-model="pwForm.confirm"
                    :type="showPw.confirm ? 'text' : 'password'"
                    class="field-input"
                    placeholder="Confirm new password"
                    :class="{ error: pwErrors.confirm }"
                  />
                  <button type="button" class="eye-btn" @click="showPw.confirm = !showPw.confirm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
                <span class="field-error" v-if="pwErrors.confirm">{{ pwErrors.confirm }}</span>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="reset-btn" @click="resetPwForm">Reset</button>
              <button type="submit" class="save-btn security-save" :disabled="pwSaving">
                <svg v-if="pwSaving" class="spin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                {{ pwSaving ? 'Updating…' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>

    <!-- Toast -->
    <transition name="toast-slide">
      <div class="toast" :class="toast.type" v-if="toast.show">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'ProfilePage',

  data() {
    return {
      loading: true,
      user: {},
      preview: null,
      avatarFile: null,

      form: { username: '', email: '' },
      errors: {},
      profileSaving: false,

      pwForm: { current: '', newPw: '', confirm: '' },
      pwErrors: {},
      pwSaving: false,
      showPw: { current: false, newPw: false, confirm: false },
      passwordStrength: 0,

      stats: { total: null, completed: null, pending: null },

      toast: { show: false, message: '', type: 'success' },
    }
  },

  computed: {
    userInitials() {
      return (this.user.username || 'U').slice(0, 2).toUpperCase()
    },
    memberSince() {
      if (!this.user.createdAt) return '—'
      return new Date(this.user.createdAt).toLocaleDateString('en-PH', {
        month: 'long', year: 'numeric',
      })
    },
    strengthClass() {
      if (this.passwordStrength <= 1) return 'weak'
      if (this.passwordStrength <= 2) return 'fair'
      if (this.passwordStrength <= 3) return 'good'
      return 'strong'
    },
    strengthLabel() {
      return { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' }[this.strengthClass]
    },
    strengthWidth() {
      return `${(this.passwordStrength / 4) * 100}%`
    },
  },

  async mounted() {
    await Promise.all([this.fetchUser(), this.fetchStats()])
  },

  methods: {
    token() {
      return localStorage.getItem('token')
    },

    async fetchUser() {
      this.loading = true
      try {
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.user = res.data
        this.form.username = res.data.username || ''
        this.form.email    = res.data.email    || ''
      } catch {
        this.showToast('Failed to load profile.', 'error')
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      try {
        const res = await axios.get('/api/orders/stats', {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.stats = res.data
      } catch {}
    },

    handleAvatarChange(e) {
      const file = e.target.files[0]
      if (!file) return
      this.avatarFile = file
      this.preview = URL.createObjectURL(file)
    },

    validateProfile() {
      const errs = {}
      if (!this.form.username.trim()) errs.username = 'Username is required.'
      if (!this.form.email.trim())    errs.email    = 'Email is required.'
      else if (!/\S+@\S+\.\S+/.test(this.form.email)) errs.email = 'Enter a valid email.'
      this.errors = errs
      return Object.keys(errs).length === 0
    },

    async updateProfile() {
      if (!this.validateProfile()) return
      this.profileSaving = true
      try {
        const formData = new FormData()
        formData.append('username', this.form.username)
        formData.append('email', this.form.email)
        if (this.avatarFile) formData.append('profilePicture', this.avatarFile)

        const res = await axios.put('/api/user/profile', formData, {
          headers: {
            Authorization: `Bearer ${this.token()}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        this.user = { ...this.user, ...res.data }
        this.avatarFile = null
        this.showToast('Profile updated successfully!', 'success')
      } catch (err) {
        this.showToast(err.response?.data?.message || 'Failed to update profile.', 'error')
      } finally {
        this.profileSaving = false
      }
    },

    resetProfileForm() {
      this.form.username = this.user.username || ''
      this.form.email    = this.user.email    || ''
      this.preview = null
      this.avatarFile = null
      this.errors = {}
    },

    checkStrength() {
      const pw = this.pwForm.newPw
      let score = 0
      if (pw.length >= 8)          score++
      if (/[A-Z]/.test(pw))        score++
      if (/[0-9]/.test(pw))        score++
      if (/[^A-Za-z0-9]/.test(pw)) score++
      this.passwordStrength = score
    },

    validatePassword() {
      const errs = {}
      if (!this.pwForm.current) errs.current = 'Current password is required.'
      if (!this.pwForm.newPw)   errs.newPw   = 'New password is required.'
      else if (this.pwForm.newPw.length < 8) errs.newPw = 'Password must be at least 8 characters.'
      if (!this.pwForm.confirm)  errs.confirm = 'Please confirm your new password.'
      else if (this.pwForm.newPw !== this.pwForm.confirm) errs.confirm = 'Passwords do not match.'
      this.pwErrors = errs
      return Object.keys(errs).length === 0
    },

    async changePassword() {
      if (!this.validatePassword()) return
      this.pwSaving = true
      try {
        await axios.put('/api/user/change-password', {
          currentPassword: this.pwForm.current,
          newPassword:     this.pwForm.newPw,
        }, {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.showToast('Password updated successfully!', 'success')
        this.resetPwForm()
      } catch (err) {
        this.showToast(err.response?.data?.message || 'Failed to update password.', 'error')
      } finally {
        this.pwSaving = false
      }
    },

    resetPwForm() {
      this.pwForm = { current: '', newPw: '', confirm: '' }
      this.pwErrors = {}
      this.passwordStrength = 0
      this.showPw = { current: false, newPw: false, confirm: false }
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Epilogue:wght@400;500&display=swap');

* { box-sizing: border-box; }

.profile-page {
  font-family: 'Epilogue', sans-serif;
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1a1a;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Header ── */
.page-header { margin-bottom: 1.75rem; }
.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a2e;
}
.page-sub { margin: 0; font-size: 0.875rem; color: #999; }

/* ── Skeleton ── */
.skeleton-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
}
.skeleton-right { display: flex; flex-direction: column; gap: 1.5rem; }
.skeleton-card {
  border-radius: 18px;
  height: 220px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}
.skeleton-card.tall { height: 520px; }
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Profile Layout ── */
.profile-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ── Avatar Card ── */
.avatar-card {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #fff;
  position: sticky;
  top: 1.5rem;
}

.avatar-ring {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  padding: 3px;
  margin-bottom: 1.1rem;
}

.avatar-wrap {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  background: #1a1a2e;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #e9a84c;
}

.avatar-upload-btn {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s;
  color: #fff;
}
.avatar-wrap:hover .avatar-upload-btn { opacity: 1; }
.avatar-upload-btn svg { width: 24px; height: 24px; }

.avatar-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #fff;
}

.avatar-role { margin: 0 0 6px; }
.role-badge {
  background: rgba(233,168,76,0.2);
  color: #f7c96e;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(233,168,76,0.3);
}

.avatar-email {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin: 0;
  word-break: break-all;
}

.divider {
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 1.1rem 0;
}

/* Profile Stats */
.profile-stats {
  display: flex;
  align-items: center;
  gap: 0;
  width: 100%;
  justify-content: space-around;
}
.pstat { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.pstat-value {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
}
.pstat-label { font-size: 0.68rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
.pstat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }

.member-since {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin: 0;
}
.member-since svg { width: 13px; height: 13px; flex-shrink: 0; }

/* ── Forms Col ── */
.forms-col { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Form Card ── */
.form-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.75rem;
  box-shadow: 0 2px 14px rgba(0,0,0,0.05);
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1.5px solid #f3f3f3;
}

.form-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #e8edf7;
  color: #0f3460;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.form-card-icon.security { background: #fdf3e1; color: #c47f0a; }
.form-card-icon svg { width: 20px; height: 20px; }

.form-card-title {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 3px;
}
.form-card-sub { font-size: 0.8rem; color: #aaa; margin: 0; }

/* ── Form Fields ── */
.form { display: flex; flex-direction: column; gap: 1.1rem; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #aaa;
}

.field-input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  color: #1a1a1a;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input:focus {
  border-color: #0f3460;
  box-shadow: 0 0 0 3px rgba(15,52,96,0.07);
}
.field-input:disabled {
  background: #fafafa;
  color: #bbb;
  cursor: not-allowed;
}
.field-input.error { border-color: #dc2626; }

.field-error { font-size: 0.75rem; color: #dc2626; }
.field-hint  { font-size: 0.73rem; color: #bbb; }

/* Password Wrap */
.password-wrap { position: relative; }
.password-wrap .field-input { padding-right: 2.5rem; width: 100%; }
.eye-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #bbb;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.15s;
}
.eye-btn:hover { color: #555; }
.eye-btn svg { width: 16px; height: 16px; }

/* Password strength */
.strength-bar {
  height: 4px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-top: 5px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease, background 0.3s;
}
.strength-fill.weak  { background: #dc2626; }
.strength-fill.fair  { background: #f59e0b; }
.strength-fill.good  { background: #3b82f6; }
.strength-fill.strong { background: #16a34a; }
.strength-label {
  font-size: 0.72rem;
  font-weight: 600;
}
.strength-label.weak   { color: #dc2626; }
.strength-label.fair   { color: #f59e0b; }
.strength-label.good   { color: #3b82f6; }
.strength-label.strong { color: #16a34a; }

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 0.5rem;
}

.reset-btn {
  padding: 0.6rem 1.2rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  color: #777;
  cursor: pointer;
  transition: all 0.15s;
}
.reset-btn:hover { border-color: #ccc; color: #333; }

.save-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0.6rem 1.4rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.save-btn:hover:not(:disabled) { background: #0f3460; transform: translateY(-1px); }
.save-btn:disabled { opacity: 0.5; cursor: default; }
.save-btn.security-save { background: #c47f0a; }
.save-btn.security-save:hover:not(:disabled) { background: #a36909; }

/* Spinner */
.spin-icon {
  width: 15px;
  height: 15px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 2000;
  white-space: nowrap;
}
.toast.success { background: #1a1a2e; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
  .avatar-card { position: static; }
  .skeleton-layout { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .profile-page { padding: 1.25rem 1rem; }
  .form-row { grid-template-columns: 1fr; }
}
</style>