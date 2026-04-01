<template>
  <div class="sidebar-wrapper" :class="{ collapsed: isCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar">

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
        <transition name="fade-text">
          <div class="brand-text" v-show="!isCollapsed">
            <span class="brand-name">SayoTea</span>
            <span class="brand-tag">POS System</span>
          </div>
        </transition>
        <button class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? 'Expand' : 'Collapse'">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            :style="{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
      </div>

      <!-- User Mini Profile -->
      <div class="user-card" v-show="!isCollapsed">
        <div class="user-avatar">
          <img v-if="user.profilePicture" :src="user.profilePicture" alt="avatar" />
          <span v-else>{{ userInitials }}</span>
        </div>
        <div class="user-info">
          <p class="user-name">{{ user.username || 'User' }}</p>
          <p class="user-role">{{ user.role || 'Staff' }}</p>
        </div>
        <span class="online-dot"></span>
      </div>

      <div class="user-avatar-only" v-show="isCollapsed" :title="user.username">
        <img v-if="user.profilePicture" :src="user.profilePicture" alt="avatar" />
        <span v-else>{{ userInitials }}</span>
        <span class="online-dot"></span>
      </div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Nav Label -->
      <transition name="fade-text">
        <p class="nav-label" v-show="!isCollapsed">NAVIGATION</p>
      </transition>

      <!-- Nav Links -->
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: $route.path === item.to }"
          :title="isCollapsed ? item.label : ''"
        >
          <div class="nav-icon" v-html="item.icon"></div>
          <transition name="fade-text">
            <span class="nav-label-text" v-show="!isCollapsed">{{ item.label }}</span>
          </transition>
          <transition name="fade-text">
            <span class="nav-badge" v-if="item.badge && !isCollapsed">{{ item.badge }}</span>
          </transition>
          <div class="active-indicator"></div>
        </router-link>
      </nav>

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Divider -->
      <div class="divider"></div>

      <!-- Logout -->
      <router-link to="/logout" class="nav-item logout-item" :title="isCollapsed ? 'Logout' : ''">
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </div>
        <transition name="fade-text">
          <span class="nav-label-text" v-show="!isCollapsed">Logout</span>
        </transition>
      </router-link>

    </aside>

    <!-- Main Content Slot -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Sidebar',

  data() {
    return {
      isCollapsed: false,
      user: {},
      pendingCount: 0,
    }
  },

  computed: {
    userInitials() {
      const name = this.user.username || ''
      return name.slice(0, 2).toUpperCase() || 'U'
    },
    navItems() {
      return [
        {
          to: '/home',
          label: 'Dashboard',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>`,
        },
        {
          to: '/store',
          label: 'Store',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>`,
        },
        {
          to: '/orders',
          label: 'Orders',
          badge: this.pendingCount > 0 ? this.pendingCount : null,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>`,
        },
        {
          to: '/profile',
          label: 'Profile',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>`,
        },
      ]
    },
  },

  async mounted() {
    this.loadCollapsedState()
    await this.fetchUser()
    await this.fetchPendingCount()
  },

  methods: {
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed
      localStorage.setItem('sidebar-collapsed', this.isCollapsed)
    },

    loadCollapsedState() {
      const saved = localStorage.getItem('sidebar-collapsed')
      if (saved !== null) this.isCollapsed = saved === 'true'
    },

    async fetchUser() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.user = res.data
      } catch {}
    },

    async fetchPendingCount() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/orders/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.pendingCount = res.data.pending || 0
      } catch {}
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Layout Wrapper ── */
.sidebar-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f7f5f0;
  transition: all 0.3s ease;
}

/* ── Sidebar ── */
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0.85rem;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-wrapper.collapsed .sidebar {
  width: 70px;
}

/* ── Brand ── */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 0.4rem 1.25rem;
  position: relative;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #1a1a2e;
}
.brand-icon svg { width: 20px; height: 20px; }

.brand-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
}

.brand-name {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
}

.brand-tag {
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.collapse-btn {
  margin-left: auto;
  background: rgba(255,255,255,0.07);
  border: none;
  border-radius: 8px;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255,255,255,0.5);
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}
.collapse-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
.collapse-btn svg { width: 14px; height: 14px; }

/* ── User Card ── */
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 0.7rem 0.85rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a1a2e;
  flex-shrink: 0;
  overflow: hidden;
}
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }

.user-info { overflow: hidden; }

.user-name {
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
  text-transform: capitalize;
}

.online-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  border: 2px solid #16213e;
  position: absolute;
  top: 10px;
  right: 10px;
}

/* Collapsed avatar */
.user-avatar-only {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 auto 1rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.user-avatar-only img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.user-avatar-only .online-dot { top: 1px; right: 1px; }

/* ── Divider ── */
.divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 0.5rem 0;
  border-radius: 1px;
}

/* ── Nav Label ── */
.nav-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.25);
  padding: 0.5rem 0.6rem 0.35rem;
  white-space: nowrap;
  overflow: hidden;
}

/* ── Nav ── */
.nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.65rem 0.75rem;
  border-radius: 11px;
  text-decoration: none;
  color: rgba(255,255,255,0.5);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  position: relative;
  transition: background 0.18s, color 0.18s;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.85);
}

.nav-item.active {
  background: rgba(233,168,76,0.15);
  color: #f7c96e;
}

.nav-item.active .nav-icon {
  color: #f7c96e;
}

.active-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: #e9a84c;
  border-radius: 3px 0 0 3px;
  transition: height 0.2s ease;
}
.nav-item.active .active-indicator {
  height: 60%;
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
.nav-icon :deep(svg),
.nav-icon svg {
  width: 18px;
  height: 18px;
}

.nav-label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-badge {
  margin-left: auto;
  background: #e9a84c;
  color: #1a1a2e;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  flex-shrink: 0;
}

/* Logout */
.logout-item {
  color: rgba(255,100,100,0.6);
  margin-bottom: 0.25rem;
}
.logout-item:hover {
  background: rgba(220, 38, 38, 0.12);
  color: #f87171;
}

/* Spacer */
.spacer { flex: 1; }

/* ── Main Content ── */
.main-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  transition: all 0.3s ease;
}

/* ── Fade text transition ── */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
  transform: translateX(-6px);
}

/* ── Mobile ── */
@media (max-width: 768px) {
  .sidebar-wrapper {
    flex-direction: column;
  }
  .sidebar {
    width: 100% !important;
    min-height: auto;
    height: auto;
    flex-direction: row;
    align-items: center;
    padding: 0.75rem 1rem;
    position: sticky;
    top: 0;
    z-index: 200;
    overflow-x: auto;
  }
  .brand { padding-bottom: 0; border-bottom: none; }
  .user-card, .user-avatar-only,
  .nav-label, .divider, .spacer { display: none !important; }
  .nav {
    flex-direction: row;
    margin-left: auto;
    gap: 4px;
  }
  .nav-item {
    padding: 0.5rem 0.75rem;
    gap: 6px;
  }
  .active-indicator {
    width: 0;
    height: 3px;
    bottom: 0;
    top: auto;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 3px 3px 0 0;
  }
  .nav-item.active .active-indicator {
    width: 60%;
    height: 3px;
  }
  .collapse-btn { display: none; }
  .main-content { overflow-y: visible; }
}
</style>