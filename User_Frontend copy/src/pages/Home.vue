<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-left">
        <div class="avatar-wrapper">
          <img
            v-if="user.profilePicture"
            :src="user.profilePicture"
            alt="Profile"
            class="avatar"
          />
          <div v-else class="avatar-fallback">
            {{ userInitials }}
          </div>
          <span class="avatar-status"></span>
        </div>
        <div class="welcome-text">
          <p class="welcome-greeting">Good {{ timeOfDay }},</p>
          <h1 class="welcome-name">{{ user.username || 'User' }} 👋</h1>
          <p class="welcome-sub">Here's what's happening with your orders today.</p>
        </div>
      </div>
      <div class="welcome-date">
        <p class="date-day">{{ currentDay }}</p>
        <p class="date-full">{{ currentDate }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card total">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Orders</span>
          <span class="stat-value" :class="{ loading: statsLoading }">
            {{ statsLoading ? '—' : stats.total }}
          </span>
        </div>
        <div class="stat-badge stat-badge--total">All time</div>
      </div>

      <div class="stat-card pending">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pending Orders</span>
          <span class="stat-value" :class="{ loading: statsLoading }">
            {{ statsLoading ? '—' : stats.pending }}
          </span>
        </div>
        <div class="stat-badge stat-badge--pending">In queue</div>
      </div>

      <div class="stat-card completed">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Completed Orders</span>
          <span class="stat-value" :class="{ loading: statsLoading }">
            {{ statsLoading ? '—' : stats.completed }}
          </span>
        </div>
        <div class="stat-badge stat-badge--completed">Done</div>
      </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">Recent Orders</h2>
        <router-link to="/orders" class="see-all-btn">See all →</router-link>
      </div>

      <div v-if="ordersLoading" class="table-loading">
        <div class="skeleton-row" v-for="n in 4" :key="n"></div>
      </div>

      <div v-else-if="recentOrders.length === 0" class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        <p>No recent orders found.</p>
      </div>

      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order._id" class="order-row">
            <td class="order-id">#{{ order._id?.slice(-6).toUpperCase() }}</td>
            <td>{{ order.customerName || 'Walk-in' }}</td>
            <td>{{ order.items?.length || 0 }} item(s)</td>
            <td class="order-total">₱{{ (order.totalAmount || 0).toFixed(2) }}</td>
            <td>
              <span class="status-badge" :class="statusClass(order.status)">
                {{ order.status || 'unknown' }}
              </span>
            </td>
            <td class="order-date">{{ formatDate(order.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Error Banner -->
    <div v-if="error" class="error-banner">
      ⚠️ {{ error }}
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'HomePage',

  data() {
    return {
      user: {},
      stats: {
        total: 0,
        pending: 0,
        completed: 0,
      },
      recentOrders: [],
      statsLoading: true,
      ordersLoading: true,
      error: null,
    }
  },

  computed: {
    userInitials() {
      const name = this.user.username || ''
      return name.slice(0, 2).toUpperCase() || 'U'
    },
    timeOfDay() {
      const hour = new Date().getHours()
      if (hour < 12) return 'morning'
      if (hour < 18) return 'afternoon'
      return 'evening'
    },
    currentDay() {
      return new Date().toLocaleDateString('en-PH', { weekday: 'long' })
    },
    currentDate() {
      return new Date().toLocaleDateString('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    },
  },

  async mounted() {
    await this.fetchUser()
    await Promise.all([this.fetchStats(), this.fetchRecentOrders()])
  },

  methods: {
    async fetchUser() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.user = res.data
      } catch (err) {
        this.error = 'Failed to load user profile.'
      }
    },

    async fetchStats() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/orders/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.stats = res.data
      } catch (err) {
        this.error = 'Failed to load order statistics.'
      } finally {
        this.statsLoading = false
      }
    },

    async fetchRecentOrders() {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get('/api/orders?limit=5&sort=-createdAt', {
          headers: { Authorization: `Bearer ${token}` },
        })
        this.recentOrders = res.data
      } catch (err) {
        this.error = 'Failed to load recent orders.'
      } finally {
        this.ordersLoading = false
      }
    },

    statusClass(status) {
      const map = {
        pending: 'status--pending',
        completed: 'status--completed',
        cancelled: 'status--cancelled',
        processing: 'status--processing',
      }
      return map[status?.toLowerCase()] || 'status--unknown'
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      return new Date(dateStr).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

* {
  box-sizing: border-box;
}

.dashboard {
  font-family: 'DM Sans', sans-serif;
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1a1a;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Welcome Section ── */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
  border-radius: 20px;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  color: #fff;
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 200, 100, 0.08);
}

.welcome-section::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: 30%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: rgba(100, 180, 255, 0.06);
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  z-index: 1;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar,
.avatar-fallback {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.25);
  object-fit: cover;
}

.avatar-fallback {
  background: linear-gradient(135deg, #e9a84c, #f7c96e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.avatar-status {
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 13px;
  height: 13px;
  background: #4ade80;
  border-radius: 50%;
  border: 2px solid #16213e;
}

.welcome-text {
  z-index: 1;
}

.welcome-greeting {
  margin: 0 0 2px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.welcome-name {
  font-family: 'Sora', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #fff;
}

.welcome-sub {
  margin: 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.5);
}

.welcome-date {
  text-align: right;
  z-index: 1;
}

.date-day {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 4px;
  color: #e9a84c;
}

.date-full {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

/* ── Stats Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.stat-card.total::before { background: #0f3460; }
.stat-card.pending::before { background: #e9a84c; }
.stat-card.completed::before { background: #4ade80; }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 22px;
  height: 22px;
}

.stat-card.total .stat-icon { background: #e8edf7; color: #0f3460; }
.stat-card.pending .stat-icon { background: #fdf3e1; color: #c47f0a; }
.stat-card.completed .stat-icon { background: #e8faf0; color: #16a34a; }

.stat-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stat-label {
  font-size: 0.78rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.stat-value {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.stat-value.loading {
  color: #ddd;
}

.stat-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.7rem;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 500;
}

.stat-badge--total { background: #e8edf7; color: #0f3460; }
.stat-badge--pending { background: #fdf3e1; color: #c47f0a; }
.stat-badge--completed { background: #e8faf0; color: #16a34a; }

/* ── Recent Orders ── */
.recent-section {
  background: #fff;
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.see-all-btn {
  font-size: 0.85rem;
  color: #0f3460;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.15s;
}

.see-all-btn:hover {
  opacity: 0.7;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.orders-table thead tr {
  border-bottom: 2px solid #f0f0f0;
}

.orders-table th {
  text-align: left;
  padding: 0.6rem 0.75rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #aaa;
  font-weight: 500;
}

.order-row {
  border-bottom: 1px solid #f7f7f7;
  transition: background 0.15s;
}

.order-row:hover {
  background: #fafafa;
}

.orders-table td {
  padding: 0.85rem 0.75rem;
  color: #333;
}

.order-id {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  color: #0f3460;
}

.order-total {
  font-weight: 600;
  color: #1a1a1a;
}

.order-date {
  color: #aaa;
  font-size: 0.83rem;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status--pending    { background: #fdf3e1; color: #c47f0a; }
.status--completed  { background: #e8faf0; color: #16a34a; }
.status--cancelled  { background: #fde8e8; color: #dc2626; }
.status--processing { background: #e8edf7; color: #0f3460; }
.status--unknown    { background: #f0f0f0; color: #888; }

/* Skeleton loading */
.table-loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.skeleton-row {
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #bbb;
}

.empty-state svg {
  width: 48px;
  height: 48px;
  margin-bottom: 0.75rem;
  opacity: 0.4;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

/* Error banner */
.error-banner {
  margin-top: 1.5rem;
  background: #fde8e8;
  color: #dc2626;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  font-size: 0.88rem;
  border-left: 4px solid #dc2626;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .dashboard {
    padding: 1.25rem 1rem;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }

  .welcome-date {
    text-align: left;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .orders-table th:nth-child(2),
  .orders-table td:nth-child(2),
  .orders-table th:nth-child(6),
  .orders-table td:nth-child(6) {
    display: none;
  }
}
</style>