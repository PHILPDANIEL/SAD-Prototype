<template>
  <div class="reports-page">
    <!-- Date Range Picker -->
    <div class="toolbar">
      <div class="toolbar-left">
        <label class="filter-label">From</label>
        <input v-model="dateFrom" type="date" class="filter-select" @change="load" />
        <label class="filter-label">To</label>
        <input v-model="dateTo" type="date" class="filter-select" @change="load" />
      </div>
      <button class="btn btn-secondary" @click="setRange('today')">Today</button>
      <button class="btn btn-secondary" @click="setRange('week')">This Week</button>
      <button class="btn btn-secondary" @click="setRange('month')">This Month</button>
    </div>

    <!-- Summary Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Sales</div>
        <div class="stat-value">₱{{ summary.totalSales?.toLocaleString() || '0' }}</div>
        <div class="stat-sub">{{ summary.totalOrders || 0 }} orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Order Value</div>
        <div class="stat-value">₱{{ avgOrder }}</div>
        <div class="stat-sub">per transaction</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Completed Orders</div>
        <div class="stat-value">{{ summary.completed || 0 }}</div>
        <div class="stat-sub stat-green">{{ completionRate }}% completion rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Canceled Orders</div>
        <div class="stat-value">{{ summary.canceled || 0 }}</div>
        <div class="stat-sub stat-red">{{ cancelRate }}% of total</div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- Top Products -->
      <div class="card">
        <div class="section-title">Top Products</div>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else-if="topProducts.length === 0" class="loading-text">No data yet.</div>
        <div v-else class="bar-list">
          <div class="bar-row" v-for="(p, i) in topProducts" :key="p.name">
            <span class="rank">#{{ i + 1 }}</span>
            <span class="bar-label">{{ p.name }}</span>
            <div class="bar-bg">
              <div class="bar-fill" :style="{ width: p.pct + '%' }"></div>
            </div>
            <span class="bar-val">₱{{ p.revenue?.toLocaleString() || p.count }}</span>
          </div>
        </div>
      </div>

      <!-- Orders by Status -->
      <div class="card">
        <div class="section-title">Orders by Status</div>
        <div v-if="loading" class="loading-text">Loading...</div>
        <div v-else>
          <div class="donut-wrap">
            <svg viewBox="0 0 120 120" class="donut-svg">
              <circle v-for="(seg, i) in donutSegments" :key="i"
                cx="60" cy="60" r="45"
                fill="none"
                :stroke="seg.color"
                stroke-width="18"
                :stroke-dasharray="`${seg.dash} ${seg.gap}`"
                :stroke-dashoffset="seg.offset"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="64" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">
                {{ summary.totalOrders || 0 }}
              </text>
            </svg>
          </div>
          <div class="legend">
            <div v-for="seg in donutSegments" :key="seg.label" class="legend-row">
              <span class="legend-dot" :style="{ background: seg.color }"></span>
              <span class="legend-label">{{ seg.label }}</span>
              <span class="legend-val">{{ seg.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { salesService } from '@/services/salesService'

export default {
  name: 'Reports',
  data() {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.slice(0, 8) + '01'
    return {
      loading: true,
      dateFrom: monthStart,
      dateTo: today,
      summary: {},
      topProducts: [],
    }
  },
  computed: {
    avgOrder() {
      if (!this.summary.totalOrders) return '0'
      return Math.round((this.summary.totalSales || 0) / this.summary.totalOrders).toLocaleString()
    },
    completionRate() {
      if (!this.summary.totalOrders) return 0
      return Math.round(((this.summary.completed || 0) / this.summary.totalOrders) * 100)
    },
    cancelRate() {
      if (!this.summary.totalOrders) return 0
      return Math.round(((this.summary.canceled || 0) / this.summary.totalOrders) * 100)
    },
    donutSegments() {
      const total = this.summary.totalOrders || 1
      const circ  = 2 * Math.PI * 45
      const statusData = [
        { label: 'Completed', count: this.summary.completed || 0, color: '#1D9E75' },
        { label: 'Pending',   count: this.summary.pending   || 0, color: '#3b82f6' },
        { label: 'Preparing', count: this.summary.preparing || 0, color: '#f59e0b' },
        { label: 'Canceled',  count: this.summary.canceled  || 0, color: '#ef4444' },
      ]
      let offset = 0
      return statusData.map(s => {
        const dash = (s.count / total) * circ
        const seg  = { ...s, dash, gap: circ - dash, offset: -offset }
        offset += dash
        return seg
      })
    },
  },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const [summaryRes, topRes] = await Promise.all([
          salesService.getByRange(this.dateFrom, this.dateTo),
          salesService.getTopProducts(),
        ])
        this.summary = summaryRes.data || {}
        const top = topRes.data || []
        const max = Math.max(...top.map(p => p.revenue || p.count || 0), 1)
        this.topProducts = top.map(p => ({ ...p, pct: Math.round(((p.revenue || p.count || 0) / max) * 100) }))
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    setRange(range) {
      const today = new Date()
      const fmt   = d => d.toISOString().split('T')[0]
      this.dateTo = fmt(today)
      if (range === 'today') {
        this.dateFrom = fmt(today)
      } else if (range === 'week') {
        const d = new Date(today)
        d.setDate(d.getDate() - 6)
        this.dateFrom = fmt(d)
      } else {
        this.dateFrom = fmt(today).slice(0, 8) + '01'
      }
      this.load()
    },
  },
}
</script>

<style scoped>
.reports-page { display: flex; flex-direction: column; gap: 20px; }
.filter-select { padding: 7px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #fff; }
.filter-label { font-size: 12px; color: #6b7280; font-weight: 500; }

.stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.stat-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
.stat-label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
.stat-value { font-size: 24px; font-weight: 700; color: #111827; }
.stat-sub   { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.stat-green { color: #15803d !important; }
.stat-red   { color: #b91c1c !important; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.loading-text { font-size: 13px; color: #9ca3af; padding: 12px 0; }
.bar-list { display: flex; flex-direction: column; gap: 10px; }
.bar-row  { display: flex; align-items: center; gap: 8px; }
.rank     { font-size: 11px; color: #9ca3af; width: 20px; flex-shrink: 0; }
.bar-label { font-size: 12px; color: #6b7280; width: 110px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar-bg   { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.bar-fill { height: 100%; background: #1D9E75; border-radius: 4px; }
.bar-val  { font-size: 12px; font-weight: 600; color: #374151; width: 52px; text-align: right; }

.donut-wrap { display: flex; justify-content: center; margin: 12px 0; }
.donut-svg  { width: 120px; height: 120px; }

.legend { display: flex; flex-direction: column; gap: 8px; }
.legend-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: #374151; }
.legend-val { font-weight: 600; color: #111827; }
</style>