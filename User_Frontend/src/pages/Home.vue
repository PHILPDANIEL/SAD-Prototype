<template>
  <div class="dashboard">

    <!-- Top Bar -->
    <div class="topbar">
      <div class="topbar-left">
        <span class="logo-text">☕ SayoTea</span>
        <span class="date-badge">{{ todayFormatted }}</span>
      </div>
      <div class="topbar-right">
        <span class="greeting-chip">{{ timeGreeting }}, {{ user.username || 'Staff' }} 👋</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading dashboard...</p>
    </div>

    <template v-else>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card accent-orange">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <p class="stat-label">Total Orders Today</p>
            <h2 class="stat-value">{{ stats.total }}</h2>
            <p class="stat-sub">All transactions</p>
          </div>
        </div>

        <div class="stat-card accent-amber">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <p class="stat-label">Pending</p>
            <h2 class="stat-value">{{ stats.pending }}</h2>
            <p class="stat-sub">Awaiting preparation</p>
          </div>
        </div>

        <div class="stat-card accent-green">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <p class="stat-label">Completed</p>
            <h2 class="stat-value">{{ stats.completed }}</h2>
            <p class="stat-sub">Served today</p>
          </div>
        </div>

        <div class="stat-card accent-brown">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <p class="stat-label">Revenue Today</p>
            <h2 class="stat-value">₱{{ stats.revenue ? Number(stats.revenue).toLocaleString() : '0' }}</h2>
            <p class="stat-sub">Gross sales</p>
          </div>
        </div>
      </div>

      <!-- Two Column Section -->
      <div class="two-col">

        <!-- Recent Orders -->
        <div class="panel">
          <div class="panel-header">
            <h3>Recent Orders</h3>
            <router-link to="/orders" class="see-all">See all →</router-link>
          </div>

          <div v-if="recentOrders.length === 0" class="panel-empty">
            No orders yet today 🍵
          </div>

          <div v-else class="order-list">
            <div
              v-for="order in recentOrders"
              :key="order._id"
              class="order-row"
            >
              <div class="order-row-left">
                <span class="order-num">#{{ order.orderNumber || order._id.slice(-4).toUpperCase() }}</span>
                <span class="order-items-count">{{ order.items?.length || 0 }} item(s)</span>
              </div>
              <div class="order-row-right">
                <span :class="['status-chip', statusClass(order.status)]">
                  {{ order.status }}
                </span>
                <span class="order-price">₱{{ Number(order.total).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="panel">
          <div class="panel-header">
            <h3>Quick Actions</h3>
          </div>

          <div class="quick-actions">
            <router-link to="/store" class="quick-btn primary">
              <span class="qb-icon">🛒</span>
              <span>New Order</span>
            </router-link>

            <router-link to="/orders" class="quick-btn">
              <span class="qb-icon">📋</span>
              <span>View Orders</span>
            </router-link>

            <router-link to="/profile" class="quick-btn">
              <span class="qb-icon">👤</span>
              <span>My Profile</span>
            </router-link>

            <button class="quick-btn danger" @click="confirmLogout">
              <span class="qb-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>

          <!-- Staff Info -->
          <div class="staff-card">
            <div class="staff-avatar">
              <img v-if="user.profilePicture" :src="user.profilePicture" />
              <span v-else>{{ userInitials }}</span>
            </div>
            <div class="staff-info">
              <p class="staff-name">{{ user.username }}</p>
              <p class="staff-email">{{ user.email }}</p>
              <span class="role-chip">{{ user.role || 'Staff' }}</span>
            </div>
          </div>
        </div>

      </div>

    </template>

    <!-- Logout confirm modal -->
    <transition name="fade">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="modal">
          <p class="modal-icon">🚪</p>
          <h3>Logout?</h3>
          <p>Are you sure you want to end your session?</p>
          <div class="modal-actions">
            <button class="modal-cancel" @click="showLogoutModal = false">Cancel</button>
            <button class="modal-confirm" @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomePage",

  data() {
    return {
      user: {},
      stats: { total: 0, pending: 0, completed: 0, revenue: 0 },
      recentOrders: [],
      loading: true,
      showLogoutModal: false
    };
  },

  computed: {
    userInitials() {
      return this.user.username ? this.user.username.charAt(0).toUpperCase() : "U";
    },

    todayFormatted() {
      return new Date().toLocaleDateString("en-PH", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
      });
    },

    timeGreeting() {
      const h = new Date().getHours();
      if (h < 12) return "Good morning";
      if (h < 17) return "Good afternoon";
      return "Good evening";
    }
  },

  async mounted() {
    const token = localStorage.getItem("token");
    try {
      const [userRes, statsRes] = await Promise.all([
        axios.get("http://localhost:5001/api/user/me", { headers: { Authorization: `Bearer ${token}` } }),
        axios.get("http://localhost:5001/api/order/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      this.user = userRes.data;
      this.stats = statsRes.data;

      // Try recent orders
      try {
        const ordersRes = await axios.get("http://localhost:5001/api/order?limit=5", {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.recentOrders = ordersRes.data.slice(0, 5);
      } catch (_) {}

    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    statusClass(status) {
      const map = {
        pending: "chip-pending",
        completed: "chip-completed",
        cancelled: "chip-cancelled",
        preparing: "chip-preparing"
      };
      return map[(status || "").toLowerCase()] || "chip-pending";
    },

    confirmLogout() {
      this.showLogoutModal = true;
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("cart");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Lato:wght@400;700&display=swap');

* { box-sizing: border-box; }

.dashboard {
  min-height: 100vh;
  background: #f5f1ec;
  padding: 0;
  font-family: 'Lato', sans-serif;
}

/* Top Bar */
.topbar {
  background: #1e1209;
  color: white;
  padding: 14px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.logo-text {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #f5c87a;
  margin-right: 14px;
}

.date-badge {
  font-size: 12px;
  color: #b89e80;
}

.greeting-chip {
  background: rgba(255,255,255,0.08);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: #f0e8da;
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 16px;
  padding: 24px 28px 0;
}

.stat-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border-left: 4px solid transparent;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); }

.accent-orange { border-left-color: #e85d04; }
.accent-amber  { border-left-color: #f4a93a; }
.accent-green  { border-left-color: #2ecc71; }
.accent-brown  { border-left-color: #795548; }

.stat-icon { font-size: 28px; margin-top: 2px; }

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9e8c7c;
  margin: 0 0 4px;
  font-weight: 700;
}

.stat-value {
  font-family: 'Sora', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1e1209;
  margin: 0 0 2px;
}

.stat-sub {
  font-size: 11px;
  color: #bbb0a6;
  margin: 0;
}

/* Two Column */
.two-col {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  padding: 16px 28px 28px;
}

@media (max-width: 820px) {
  .two-col { grid-template-columns: 1fr; }
}

/* Panel */
.panel {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1.5px solid #f0ebe4;
}

.panel-header h3 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  color: #1e1209;
}

.see-all {
  font-size: 12px;
  color: #c87941;
  text-decoration: none;
  font-weight: 700;
}

.panel-empty {
  text-align: center;
  padding: 40px;
  color: #bbb0a6;
  font-size: 14px;
}

/* Order List */
.order-list { padding: 8px 0; }

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #f8f4ef;
  transition: background 0.15s;
}

.order-row:hover { background: #faf7f3; }
.order-row:last-child { border-bottom: none; }

.order-row-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-num {
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #1e1209;
}

.order-items-count {
  font-size: 11px;
  color: #bbb0a6;
}

.order-row-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-chip {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  text-transform: capitalize;
}
.chip-pending   { background: #fff3e0; color: #e65100; }
.chip-preparing { background: #e3f2fd; color: #1565c0; }
.chip-completed { background: #e8f5e9; color: #2e7d32; }
.chip-cancelled { background: #fce4ec; color: #b71c1c; }

.order-price {
  font-size: 13px;
  font-weight: 700;
  color: #c87941;
  font-family: 'Sora', sans-serif;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 16px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid #e8e0d8;
  background: #faf7f3;
  font-family: 'Lato', sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #4a3c30;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
}

.quick-btn:hover {
  background: #f0ebe4;
  border-color: #d9cec4;
  transform: translateY(-1px);
}

.quick-btn.primary {
  background: #1e1209;
  color: white;
  border-color: #1e1209;
}

.quick-btn.primary:hover { background: #3a2010; }

.quick-btn.danger {
  color: #c0392b;
  border-color: #fce4ec;
  background: #fff5f5;
}

.quick-btn.danger:hover { background: #fce4ec; }

.qb-icon { font-size: 18px; }

/* Staff Card */
.staff-card {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 16px 16px;
  padding: 14px;
  background: #f5f1ec;
  border-radius: 12px;
  border: 1.5px solid #e8e0d8;
}

.staff-avatar {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: #1e1209;
  color: #f5c87a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}

.staff-avatar img { width: 100%; height: 100%; object-fit: cover; }

.staff-name {
  font-weight: 700;
  font-size: 14px;
  color: #1e1209;
  margin: 0 0 2px;
}

.staff-email {
  font-size: 11px;
  color: #9e8c7c;
  margin: 0 0 6px;
}

.role-chip {
  font-size: 10px;
  font-weight: 700;
  background: #1e1209;
  color: #f5c87a;
  padding: 2px 8px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  width: 300px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-icon { font-size: 36px; margin: 0 0 10px; }

.modal h3 {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  color: #1e1209;
  margin: 0 0 8px;
}

.modal p { font-size: 13px; color: #8a7060; margin: 0 0 20px; }

.modal-actions { display: flex; gap: 10px; }

.modal-cancel, .modal-confirm {
  flex: 1;
  padding: 11px;
  border-radius: 10px;
  font-family: 'Lato', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.modal-cancel { background: #f0ebe4; color: #4a3c30; }
.modal-confirm { background: #c0392b; color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter, .fade-leave-to { opacity: 0; }
</style>