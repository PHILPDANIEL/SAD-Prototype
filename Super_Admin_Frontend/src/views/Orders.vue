<template>
  <div class="orders-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="search" class="search-input" placeholder="Search orders..." />
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
        </select>
        <input v-model="filterDate" type="date" class="filter-select" />
      </div>
      <div class="order-counts">
        <span v-for="s in statusSummary" :key="s.label" class="count-chip" :class="s.cls">
          {{ s.label }}: {{ s.count }}
        </span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="empty-row">Loading orders...</td>
          </tr>
          <tr v-else-if="filtered.length === 0">
            <td colspan="7" class="empty-row">No orders found.</td>
          </tr>
          <tr v-for="order in filtered" :key="order._id">
            <td><strong>#{{ order.orderNumber || order._id?.slice(-5).toUpperCase() }}</strong></td>
            <td>{{ order.customerName || 'Walk-in' }}</td>
            <td class="items-cell">
              <span v-for="(item, i) in order.items" :key="i" class="item-tag">
                {{ item.name }} x{{ item.qty }}
              </span>
            </td>
            <td><strong>₱{{ order.total }}</strong></td>
            <td><span class="pill" :class="statusClass(order.status)">{{ order.status }}</span></td>
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>
              <select
                :value="order.status"
                class="status-select"
                :class="statusSelectClass(order.status)"
                @change="updateStatus(order, $event.target.value)"
                :disabled="order.status === 'completed' || order.status === 'canceled'"
              >
                <option value="pending">pending</option>
                <option value="preparing">preparing</option>
                <option value="completed">completed</option>
                <option value="canceled">canceled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { orderService } from '@/services/orderService'

export default {
  name: 'Orders',
  data() {
    return {
      orders: [],
      loading: true,
      search: '',
      filterStatus: '',
      filterDate: '',
    }
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase()
      return this.orders.filter(o => {
        const matchSearch = !q ||
          String(o.orderNumber || '').toLowerCase().includes(q) ||
          (o.customerName || '').toLowerCase().includes(q)
        const matchStatus = !this.filterStatus || o.status === this.filterStatus
        const matchDate   = !this.filterDate   || o.createdAt?.startsWith(this.filterDate)
        return matchSearch && matchStatus && matchDate
      })
    },
    statusSummary() {
      const statuses = ['pending', 'preparing', 'completed', 'canceled']
      const cls = { pending: 'chip-blue', preparing: 'chip-amber', completed: 'chip-green', canceled: 'chip-red' }
      return statuses.map(s => ({
        label: s,
        count: this.orders.filter(o => o.status === s).length,
        cls: cls[s],
      }))
    },
  },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await orderService.getAll()
        this.orders = res.data
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },

    async updateStatus(order, newStatus) {
      if (order.status === newStatus) return
      try {
        await orderService.updateStatus(order._id, newStatus)
        order.status = newStatus
      } catch (e) { console.error(e) }
    },

    statusClass(s) {
      return { completed: 'pill-green', pending: 'pill-blue', preparing: 'pill-amber', canceled: 'pill-red' }[s] || 'pill-gray'
    },

    statusSelectClass(s) {
      return { completed: 'sel-green', pending: 'sel-blue', preparing: 'sel-amber', canceled: 'sel-red' }[s] || ''
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
  },
}
</script>

<style scoped>
.orders-page { display: flex; flex-direction: column; gap: 16px; }
.filter-select { padding: 7px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; }
.empty-row { text-align: center; color: #9ca3af; padding: 24px; font-size: 13px; }

.order-counts { display: flex; gap: 8px; flex-wrap: wrap; }
.count-chip { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; }
.chip-blue   { background: #dbeafe; color: #1d4ed8; }
.chip-amber  { background: #fef9c3; color: #a16207; }
.chip-green  { background: #dcfce7; color: #15803d; }
.chip-red    { background: #fee2e2; color: #b91c1c; }

.items-cell { max-width: 180px; }
.item-tag { display: inline-block; font-size: 11px; background: #f3f4f6; color: #374151; padding: 2px 6px; border-radius: 4px; margin: 1px; }

.status-select {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e0e0e0;
  cursor: pointer;
}
.status-select:disabled { opacity: 0.5; cursor: not-allowed; }
.sel-green  { background: #dcfce7; color: #15803d; border-color: #86efac; }
.sel-blue   { background: #dbeafe; color: #1d4ed8; border-color: #93c5fd; }
.sel-amber  { background: #fef9c3; color: #a16207; border-color: #fde047; }
.sel-red    { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
</style>