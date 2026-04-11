<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-logo">ST</div>
      <div>
        <div class="brand-name">SayoTea</div>
        <div class="brand-sub">Super Admin</div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in visibleNav"
        :key="item.name"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
        exact-active-class="nav-item--active"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="admin-info">
        <div class="admin-avatar">{{ initials }}</div>
        <div class="admin-details">
          <div class="admin-name">{{ userName }}</div>
          <div class="admin-role">{{ userRole }}</div>
        </div>
      </div>
      <button class="logout-btn" title="Logout" @click="logout">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script>
import { authStore } from '@/store/auth'

const ALL_NAV = [
  {
    name: 'Dashboard', label: 'Dashboard', to: '/', roles: ['admin', 'superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>`,
  },
  {
    name: 'Users', label: 'Users', to: '/users', roles: ['superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`,
  },
  {
    name: 'Products', label: 'Products', to: '/products', roles: ['admin', 'superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>`,
  },
  {
    name: 'Addons', label: 'Add-ons', to: '/addons', roles: ['admin', 'superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>`,
  },
  {
    name: 'Orders', label: 'Orders', to: '/orders', roles: ['admin', 'superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>`,
  },
  {
    name: 'Reports', label: 'Reports', to: '/reports', roles: ['admin', 'superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>`,
  },
  {
    name: 'Settings', label: 'Settings', to: '/settings', roles: ['superadmin'],
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
        1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06
        a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09
        A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68
        a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06
        a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09
        a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`,
  },
]

export default {
  name: 'Sidebar',
  computed: {
    visibleNav() {
      const role = authStore.role
      if (!role) return []
      return ALL_NAV.filter(item => item.roles.includes(role))
    },
    userName()  { return authStore.name },
    userRole()  { return authStore.role },
    initials()  { return authStore.initials },
  },
  methods: {
    logout() {
      authStore.clearAuth()
      this.$router.push('/login')
    },
  },
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}
.brand-logo {
  width: 36px; height: 36px;
  background: #1D9E75;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 13px; font-weight: 700;
  flex-shrink: 0;
}
.brand-name { font-size: 15px; font-weight: 700; color: #111827; }
.brand-sub  { font-size: 11px; color: #9ca3af; }

.sidebar-nav {
  flex: 1;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.12s;
  position: relative;
}
.nav-item:hover { background: #f3f4f6; color: #111827; }
.nav-item--active { background: #ecfdf5 !important; color: #1D9E75 !important; }
.nav-icon { display: flex; align-items: center; flex-shrink: 0; }
.nav-label { flex: 1; }
.nav-badge {
  font-size: 10px;
  font-weight: 600;
  background: #fee2e2;
  color: #b91c1c;
  padding: 1px 6px;
  border-radius: 20px;
}

.sidebar-footer {
  padding: 12px 14px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
}
.admin-info { display: flex; align-items: center; gap: 8px; min-width: 0; }
.admin-avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #1D9E75;
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600;
  flex-shrink: 0;
}
.admin-details { min-width: 0; }
.admin-name { font-size: 12px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.admin-role { font-size: 10px; color: #9ca3af; }

.logout-btn {
  background: none; border: none;
  color: #9ca3af; cursor: pointer;
  padding: 6px; border-radius: 6px;
  display: flex; align-items: center;
  flex-shrink: 0;
  transition: all 0.12s;
}
.logout-btn:hover { color: #ef4444; background: #fee2e2; }
</style>