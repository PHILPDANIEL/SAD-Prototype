<template>
  <div class="dashboard">
    <!-- Stat Cards -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.iconBg }">
          <span v-html="stat.icon"></span>
        </div>
        <div class="stat-body">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-delta" :class="stat.deltaClass">{{ stat.delta }}</div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="dash-grid">
      <!-- Top Products -->
      <div class="card">
        <div class="section-title">Top Products Today</div>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else class="bar-list">
          <div class="bar-row" v-for="p in topProducts" :key="p.name">
            <span class="bar-label">{{ p.name }}</span>
            <div class="bar-bg">
              <div class="bar-fill" :style="{ width: p.pct + '%' }"></div>
            </div>
            <span class="bar-val">{{ p.count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <div class="section-title">Recent Orders</div>
        <div v-if="loading" class="loading-text">Loading...</div>
        <table v-else>
          <thead>
            <tr>
              <th>Order</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order._id">
              <td>#{{ order.orderNumber }}</td>
              <td>₱{{ order.total }}</td>
              <td><span class="pill" :class="statusClass(order.status)">{{ order.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { orderService } from '@/services/orderService'
import { salesService } from '@/services/salesService'

export default {
  name: 'Dashboard',
  data() {
    return {
      loading: true,
      stats: [
        { label: 'Total Users',  value: '—', delta: 'loading…', deltaClass: '', iconBg: '#ecfdf5',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
        { label: 'Total Orders', value: '—', delta: 'loading…', deltaClass: '', iconBg: '#eff6ff',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>' },
        { label: 'Total Sales',  value: '—', delta: 'loading…', deltaClass: '', iconBg: '#fefce8',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>' },
        { label: 'Products',     value: '—', delta: 'loading…', deltaClass: '', iconBg: '#fdf2f8',
          icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' },
      ],
      topProducts: [],
      recentOrders: [],
    }
  },
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const [summaryRes, topRes, ordersRes] = await Promise.all([
          salesService.getSummary(),
          salesService.getTopProducts(),
          orderService.getAll(),
        ])

        const s = summaryRes.data
        this.stats[0].value = s.totalUsers?.toLocaleString() || '0'
        this.stats[0].delta = `+${s.newUsersThisWeek || 0} this week`
        this.stats[0].deltaClass = 'delta-green'

        this.stats[1].value = s.totalOrders?.toLocaleString() || '0'
        this.stats[1].delta = `+${s.ordersToday || 0} today`
        this.stats[1].deltaClass = 'delta-blue'

        this.stats[2].value = `₱${(s.totalSales || 0).toLocaleString()}`
        this.stats[2].delta = `+₱${(s.salesToday || 0).toLocaleString()} today`
        this.stats[2].deltaClass = 'delta-amber'

        this.stats[3].value = s.totalProducts?.toLocaleString() || '0'
        this.stats[3].delta = `${s.lowStock || 0} low stock`
        this.stats[3].deltaClass = s.lowStock > 0 ? 'delta-red' : 'delta-green'

        // Top products — normalize to %
        const top = topRes.data || []
        const max = Math.max(...top.map(p => p.count), 1)
        this.topProducts = top.map(p => ({ ...p, pct: Math.round((p.count / max) * 100) }))

        // Recent 5 orders
        const allOrders = ordersRes.data || []
        this.recentOrders = allOrders.slice(0, 5)
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        this.loading = false
      }
    },

    statusClass(status) {
      const map = { completed: 'pill-green', pending: 'pill-blue', preparing: 'pill-amber', canceled: 'pill-red' }
      return map[status] || 'pill-gray'
    },
  },
}
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 20px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-label { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 700; color: #111827; }
.stat-delta { font-size: 11px; margin-top: 3px; }
.delta-green { color: #15803d; }
.delta-blue  { color: #1d4ed8; }
.delta-amber { color: #a16207; }
.delta-red   { color: #b91c1c; }

.dash-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row  { display: flex; align-items: center; gap: 10px; }
.bar-label { font-size: 12px; color: #6b7280; width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-bg    { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.bar-fill  { height: 100%; background: #1D9E75; border-radius: 4px; transition: width 0.5s ease; }
.bar-val   { font-size: 12px; font-weight: 600; color: #374151; width: 30px; text-align: right; }

.loading-text { font-size: 13px; color: #9ca3af; padding: 12px 0; }
</style>