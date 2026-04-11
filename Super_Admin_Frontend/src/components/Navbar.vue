<template>
  <header class="navbar">
    <div class="navbar-left">
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>
    <div class="navbar-right">
      <div class="live-badge">
        <span class="live-dot"></span>
        Live
      </div>
      <div class="time-display">{{ currentTime }}</div>
      <div class="user-chip">
        <div class="chip-avatar">{{ initials }}</div>
        <div class="chip-info">
          <span class="chip-name">{{ userName }}</span>
          <span class="chip-role">{{ userRole }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { authStore } from '@/store/auth'

export default {
  name: 'Navbar',
  props: {
    pageTitle: { type: String, default: 'Dashboard' },
  },
  data() {
    return { currentTime: '' }
  },
  computed: {
    userName() { return authStore.name },
    userRole() { return authStore.role },
    initials() { return authStore.initials },
  },
  mounted() {
    this.tick()
    this._timer = setInterval(this.tick, 1000)
  },
  beforeUnmount() {
    clearInterval(this._timer)
  },
  methods: {
    tick() {
      this.currentTime = new Date().toLocaleTimeString('en-PH', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  height: 60px;
  flex-shrink: 0;
}

.page-title { font-size: 16px; font-weight: 700; color: #111827; }

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.live-badge {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 600; color: #15803d;
  background: #dcfce7; padding: 4px 10px; border-radius: 20px;
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%; background: #15803d;
  animation: blink 1.5s infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.time-display { font-size: 12px; color: #6b7280; font-variant-numeric: tabular-nums; }

.user-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 10px 4px 4px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  background: #fafafa;
}
.chip-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: #1D9E75; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
}
.chip-info { display: flex; flex-direction: column; }
.chip-name { font-size: 12px; font-weight: 600; color: #111827; line-height: 1.2; }
.chip-role { font-size: 10px; color: #9ca3af; line-height: 1.2; }
</style>