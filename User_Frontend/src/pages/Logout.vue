<template>
  <div class="logout-wrapper">
    <div v-if="!confirmed" class="logout-card">

      <div class="icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>

      <h2 class="logout-title">Sign out?</h2>
      <p class="logout-body">
        You'll need to sign in again to access your account.
      </p>

      <div class="action-row">
        <button class="btn-cancel" @click="cancel">Cancel</button>
        <button class="btn-confirm" :disabled="loading" @click="confirmLogout">
          <span v-if="loading" class="spinner" aria-hidden="true"></span>
          {{ loading ? 'Signing out…' : 'Sign out' }}
        </button>
      </div>

    </div>

    <div v-else class="logout-card done-state">
      <div class="check-circle" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p class="done-text">Signed out successfully</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogoutPage",

  data() {
    return {
      confirmed: false,
      loading: false
    };
  },

  methods: {
    cancel() {
      this.$router.back();
    },

    async confirmLogout() {
      this.loading = true;

      await new Promise(resolve => setTimeout(resolve, 600));

      localStorage.removeItem("token");
      localStorage.removeItem("cart");

      this.loading = false;
      this.confirmed = true;

      await new Promise(resolve => setTimeout(resolve, 1000));

      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.logout-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f4f0;
  padding: 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.logout-card {
  background: #ffffff;
  border: 1px solid #e2e0d8;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  width: 100%;
  max-width: 360px;
  text-align: center;
}

.icon-wrap {
  width: 48px;
  height: 48px;
  background: #f5f4f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  color: #555;
}

.logout-title {
  font-family: 'Georgia', serif;
  font-size: 20px;
  font-weight: normal;
  color: #1a1a1a;
  margin: 0 0 0.5rem;
}

.logout-body {
  font-size: 14px;
  color: #6b6b6b;
  margin: 0 0 1.75rem;
  line-height: 1.5;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-cancel {
  height: 40px;
  background: #ffffff;
  color: #333;
  border: 1px solid #d8d6ce;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: inherit;
}

.btn-cancel:hover {
  background: #f5f4f0;
  border-color: #bbb9b0;
}

.btn-confirm {
  height: 40px;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s, opacity 0.15s;
  font-family: inherit;
}

.btn-confirm:hover:not(:disabled) {
  background: #333;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.done-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 2.5rem;
}

.check-circle {
  width: 44px;
  height: 44px;
  background: #eaf7f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d8a5c;
}

.done-text {
  font-size: 15px;
  color: #333;
  margin: 0;
  font-weight: 500;
}
</style>