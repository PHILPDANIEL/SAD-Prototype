<template>
  <div class="logout-page">
    <div class="logout-card" :class="{ 'is-leaving': leaving }">

      <!-- Brand -->
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 010 8h-1"/>
            <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <span class="brand-name">SayoTea</span>
      </div>

      <!-- Avatar -->
      <div class="avatar-wrap">
        <img v-if="user.profilePicture" :src="user.profilePicture" alt="avatar" class="avatar" />
        <div v-else class="avatar-fallback">{{ userInitials }}</div>
        <div class="avatar-ring"></div>
      </div>

      <!-- Message -->
      <h1 class="goodbye-text">See you soon,</h1>
      <p class="username-text">{{ user.username || 'Friend' }} 👋</p>
      <p class="sub-text">You're about to be signed out of your account.</p>

      <!-- Actions -->
      <div class="actions">
        <button class="cancel-btn" @click="goBack" :disabled="leaving">
          ← Stay Signed In
        </button>
        <button class="logout-btn" @click="confirmLogout" :disabled="leaving">
          <span v-if="!leaving">Sign Out</span>
          <span v-else class="leaving-state">
            <svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Signing out…
          </span>
        </button>
      </div>

      <!-- Decorative circles -->
      <div class="deco deco-1"></div>
      <div class="deco deco-2"></div>
      <div class="deco deco-3"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogoutPage',

  data() {
    return {
      user: {},
      leaving: false,
    }
  },

  computed: {
    userInitials() {
      return (this.user.username || 'U').slice(0, 2).toUpperCase()
    },
  },

  mounted() {
    // Load user from localStorage so we can show their name
    const raw = localStorage.getItem('sayotea-user')
    if (raw) {
      try { this.user = JSON.parse(raw) } catch {}
    }
  },

  methods: {
    goBack() {
      this.$router.push('/home')
    },

    async confirmLogout() {
      this.leaving = true
      // Small delay for UX feel
      await new Promise(r => setTimeout(r, 1200))
      // Clear all auth data
      localStorage.removeItem('token')
      localStorage.removeItem('sayotea-user')
      localStorage.removeItem('sayotea-cart')
      // Redirect to login (adjust path to match your login route)
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

* { box-sizing: border-box; }

.logout-page {
  min-height: 100vh;
  background: #f7f5f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: 'DM Sans', sans-serif;
}

/* ── Card ── */
.logout-card {
  background: linear-gradient(160deg, #1a1a2e 0%, #16213e 55%, #0f3460 100%);
  border-radius: 28px;
  padding: 3rem 2.5rem 2.5rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15, 52, 96, 0.35);
  animation: cardIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

.logout-card.is-leaving {
  animation: cardOut 0.4s ease forwards;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes cardOut {
  to { opacity: 0; transform: translateY(-20px) scale(0.97); }
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a2e;
}
.brand-icon svg { width: 17px; height: 17px; }

.brand-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

/* ── Avatar ── */
.avatar-wrap {
  width: 90px;
  height: 90px;
  margin: 0 auto 1.5rem;
  position: relative;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  z-index: 0;
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(1.06); }
}

.avatar,
.avatar-fallback {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
  border: 3px solid #1a1a2e;
}

.avatar { object-fit: cover; }

.avatar-fallback {
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #e9a84c;
}

/* ── Text ── */
.goodbye-text {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 4px;
}

.username-text {
  font-family: 'Sora', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 12px;
}

.sub-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0 0 2rem;
  line-height: 1.5;
}

/* ── Actions ── */
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
  z-index: 1;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 13px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.cancel-btn:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}
.cancel-btn:disabled { opacity: 0.4; cursor: default; }

.logout-btn {
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 13px;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  color: #1a1a2e;
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.logout-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px);
}
.logout-btn:disabled { cursor: default; }

.leaving-state {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spin {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Decorative Circles ── */
.deco {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  z-index: 0;
  pointer-events: none;
}
.deco-1 { width: 200px; height: 200px; top: -80px; right: -60px; }
.deco-2 { width: 140px; height: 140px; bottom: -50px; left: -40px; background: rgba(233,168,76,0.06); }
.deco-3 { width: 80px;  height: 80px;  bottom: 60px; right: 20px; }

/* ── Responsive ── */
@media (max-width: 480px) {
  .logout-card { padding: 2.5rem 1.75rem 2rem; }
  .username-text { font-size: 1.35rem; }
}
</style>