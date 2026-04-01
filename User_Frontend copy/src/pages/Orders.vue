<template>
  <div class="orders-page">

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Orders</h1>
        <p class="page-sub">Manage and track all customer orders</p>
      </div>
      <button class="export-btn" @click="exportCSV">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export CSV
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <!-- Search -->
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by customer or order ID…"
          class="search-input"
          @input="handleSearch"
        />
        <button v-if="search" class="clear-search" @click="clearSearch">✕</button>
      </div>

      <!-- Status Filter Tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ active: activeStatus === tab.value }"
          @click="setStatus(tab.value)"
        >
          <span class="tab-dot" :class="tab.dotClass"></span>
          {{ tab.label }}
          <span class="tab-count" v-if="tab.count !== null">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Sort -->
      <select v-model="sortBy" class="sort-select" @change="fetchOrders">
        <option value="-createdAt">Newest First</option>
        <option value="createdAt">Oldest First</option>
        <option value="-totalAmount">Highest Amount</option>
        <option value="totalAmount">Lowest Amount</option>
      </select>
    </div>

    <!-- Orders Table -->
    <div class="table-card">
      <!-- Skeleton Loading -->
      <div v-if="loading" class="skeleton-wrap">
        <div class="skeleton-header"></div>
        <div class="skeleton-row" v-for="n in 6" :key="n"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <p class="empty-title">No orders found</p>
        <p class="empty-sub">Try adjusting your filters or search term.</p>
      </div>

      <!-- Table -->
      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(order, index) in orders"
            :key="order._id"
            class="order-row"
            :style="{ animationDelay: `${index * 40}ms` }"
            @click="openDetail(order)"
          >
            <td>
              <span class="order-id">#{{ order._id?.slice(-6).toUpperCase() }}</span>
            </td>
            <td>
              <div class="customer-cell">
                <div class="cust-avatar">{{ getInitials(order.customerName) }}</div>
                <span>{{ order.customerName || 'Walk-in' }}</span>
              </div>
            </td>
            <td>
              <span class="items-pill">{{ order.items?.length || 0 }} item(s)</span>
            </td>
            <td>
              <span class="amount">₱{{ (order.totalAmount || 0).toFixed(2) }}</span>
            </td>
            <td>
              <span class="status-badge" :class="statusClass(order.status)">
                <span class="status-dot"></span>
                {{ order.status || 'unknown' }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(order.createdAt) }}</td>
            <td @click.stop>
              <div class="actions">
                <button class="action-btn view-btn" title="View" @click="openDetail(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="action-btn status-btn" title="Change Status" @click="openStatusModal(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="17 1 21 5 17 9"/>
                    <path d="M3 11V9a4 4 0 014-4h14"/>
                    <polyline points="7 23 3 19 7 15"/>
                    <path d="M21 13v2a4 4 0 01-4 4H3"/>
                  </svg>
                </button>
                <button class="action-btn delete-btn" title="Delete" @click="confirmDelete(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="!loading && totalPages > 1">
        <button class="page-btn" :disabled="currentPage === 1" @click="goPage(currentPage - 1)">‹ Prev</button>
        <div class="page-numbers">
          <button
            v-for="p in pageRange"
            :key="p"
            class="page-num"
            :class="{ active: p === currentPage, ellipsis: p === '…' }"
            @click="p !== '…' && goPage(p)"
          >{{ p }}</button>
        </div>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">Next ›</button>
      </div>
    </div>

    <!-- ── Order Detail Modal ── -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showDetail" @click.self="closeDetail">
        <div class="modal detail-modal">
          <button class="modal-close" @click="closeDetail">✕</button>
          <div class="modal-header">
            <h2 class="modal-title">Order Detail</h2>
            <span class="status-badge" :class="statusClass(selectedOrder?.status)">
              <span class="status-dot"></span>
              {{ selectedOrder?.status }}
            </span>
          </div>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">Order ID</span>
              <span class="meta-value">#{{ selectedOrder?._id?.slice(-6).toUpperCase() }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Customer</span>
              <span class="meta-value">{{ selectedOrder?.customerName || 'Walk-in' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Date</span>
              <span class="meta-value">{{ formatDate(selectedOrder?.createdAt) }}</span>
            </div>
          </div>

          <div class="detail-items">
            <h3 class="detail-section-title">Items Ordered</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedOrder?.items" :key="item._id || item.productId">
                  <td>{{ item.name || item.productName || '—' }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>₱{{ (item.price || 0).toFixed(2) }}</td>
                  <td>₱{{ ((item.price || 0) * (item.quantity || 1)).toFixed(2) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="detail-total">
            <span>Total Amount</span>
            <span class="total-amount">₱{{ (selectedOrder?.totalAmount || 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Change Status Modal ── -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showStatusModal" @click.self="closeStatusModal">
        <div class="modal status-modal">
          <button class="modal-close" @click="closeStatusModal">✕</button>
          <h2 class="modal-title">Update Order Status</h2>
          <p class="modal-sub">Order <strong>#{{ selectedOrder?._id?.slice(-6).toUpperCase() }}</strong></p>

          <div class="status-options">
            <label
              v-for="s in statusOptions"
              :key="s.value"
              class="status-option"
              :class="{ selected: newStatus === s.value }"
            >
              <input type="radio" v-model="newStatus" :value="s.value" hidden />
              <span class="status-badge" :class="s.class">
                <span class="status-dot"></span>{{ s.label }}
              </span>
            </label>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" @click="closeStatusModal">Cancel</button>
            <button class="confirm-btn" :disabled="statusUpdating" @click="updateStatus">
              {{ statusUpdating ? 'Saving…' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Delete Confirm Modal ── -->
    <transition name="modal-fade">
      <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
        <div class="modal delete-modal">
          <div class="delete-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </div>
          <h2 class="modal-title">Delete Order?</h2>
          <p class="modal-sub">This action cannot be undone. Order <strong>#{{ selectedOrder?._id?.slice(-6).toUpperCase() }}</strong> will be permanently removed.</p>
          <div class="modal-actions">
            <button class="cancel-btn" @click="showDeleteModal = false">Cancel</button>
            <button class="delete-confirm-btn" :disabled="deleting" @click="deleteOrder">
              {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast Notification -->
    <transition name="toast-slide">
      <div class="toast" :class="toast.type" v-if="toast.show">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'OrdersPage',

  data() {
    return {
      orders: [],
      loading: true,
      search: '',
      searchTimeout: null,
      activeStatus: 'all',
      sortBy: '-createdAt',
      currentPage: 1,
      totalPages: 1,
      totalOrders: 0,
      perPage: 10,

      // Status counts
      statusCounts: { all: 0, pending: 0, completed: 0, cancelled: 0 },

      // Modals
      showDetail: false,
      showStatusModal: false,
      showDeleteModal: false,
      selectedOrder: null,
      newStatus: '',
      statusUpdating: false,
      deleting: false,

      // Toast
      toast: { show: false, message: '', type: 'success' },

      statusTabs: [
        { label: 'All', value: 'all', dotClass: 'dot-all', count: null },
        { label: 'Pending', value: 'pending', dotClass: 'dot-pending', count: null },
        { label: 'Completed', value: 'completed', dotClass: 'dot-completed', count: null },
        { label: 'Cancelled', value: 'cancelled', dotClass: 'dot-cancelled', count: null },
      ],

      statusOptions: [
        { label: 'Pending',   value: 'pending',   class: 'status--pending' },
        { label: 'Processing',value: 'processing', class: 'status--processing' },
        { label: 'Completed', value: 'completed',  class: 'status--completed' },
        { label: 'Cancelled', value: 'cancelled',  class: 'status--cancelled' },
      ],
    }
  },

  computed: {
    pageRange() {
      const pages = []
      const total = this.totalPages
      const cur = this.currentPage
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i)
      } else {
        pages.push(1)
        if (cur > 3) pages.push('…')
        const start = Math.max(2, cur - 1)
        const end = Math.min(total - 1, cur + 1)
        for (let i = start; i <= end; i++) pages.push(i)
        if (cur < total - 2) pages.push('…')
        pages.push(total)
      }
      return pages
    },
  },

  async mounted() {
    await this.fetchOrders()
    await this.fetchStatusCounts()
  },

  methods: {
    token() {
      return localStorage.getItem('token')
    },

    async fetchOrders() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          limit: this.perPage,
          sort: this.sortBy,
        }
        if (this.search) params.search = this.search
        if (this.activeStatus !== 'all') params.status = this.activeStatus

        const res = await axios.get('/api/orders', {
          headers: { Authorization: `Bearer ${this.token()}` },
          params,
        })
        // Expects: { orders: [], total: N, page: N, totalPages: N }
        this.orders = res.data.orders || res.data
        this.totalOrders = res.data.total || this.orders.length
        this.totalPages = res.data.totalPages || 1
      } catch (err) {
        this.showToast('Failed to load orders.', 'error')
      } finally {
        this.loading = false
      }
    },

    async fetchStatusCounts() {
      try {
        const res = await axios.get('/api/orders/stats', {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        // Expects: { total, pending, completed, cancelled }
        const d = res.data
        this.statusTabs[0].count = d.total
        this.statusTabs[1].count = d.pending
        this.statusTabs[2].count = d.completed
        this.statusTabs[3].count = d.cancelled || 0
      } catch {}
    },

    handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1
        this.fetchOrders()
      }, 400)
    },

    clearSearch() {
      this.search = ''
      this.currentPage = 1
      this.fetchOrders()
    },

    setStatus(val) {
      this.activeStatus = val
      this.currentPage = 1
      this.fetchOrders()
    },

    goPage(page) {
      if (page < 1 || page > this.totalPages) return
      this.currentPage = page
      this.fetchOrders()
    },

    openDetail(order) {
      this.selectedOrder = order
      this.showDetail = true
    },

    closeDetail() {
      this.showDetail = false
      this.selectedOrder = null
    },

    openStatusModal(order) {
      this.selectedOrder = order
      this.newStatus = order.status
      this.showStatusModal = true
    },

    closeStatusModal() {
      this.showStatusModal = false
      this.selectedOrder = null
    },

    async updateStatus() {
      this.statusUpdating = true
      try {
        await axios.patch(
          `/api/orders/${this.selectedOrder._id}/status`,
          { status: this.newStatus },
          { headers: { Authorization: `Bearer ${this.token()}` } }
        )
        // Update locally
        const idx = this.orders.findIndex(o => o._id === this.selectedOrder._id)
        if (idx !== -1) this.orders[idx].status = this.newStatus
        this.showToast('Order status updated!', 'success')
        this.closeStatusModal()
        this.fetchStatusCounts()
      } catch {
        this.showToast('Failed to update status.', 'error')
      } finally {
        this.statusUpdating = false
      }
    },

    confirmDelete(order) {
      this.selectedOrder = order
      this.showDeleteModal = true
    },

    async deleteOrder() {
      this.deleting = true
      try {
        await axios.delete(`/api/orders/${this.selectedOrder._id}`, {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.orders = this.orders.filter(o => o._id !== this.selectedOrder._id)
        this.showDeleteModal = false
        this.selectedOrder = null
        this.showToast('Order deleted.', 'success')
        this.fetchStatusCounts()
      } catch {
        this.showToast('Failed to delete order.', 'error')
      } finally {
        this.deleting = false
      }
    },

    exportCSV() {
      const headers = ['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date']
      const rows = this.orders.map(o => [
        '#' + o._id?.slice(-6).toUpperCase(),
        o.customerName || 'Walk-in',
        o.items?.length || 0,
        (o.totalAmount || 0).toFixed(2),
        o.status,
        this.formatDate(o.createdAt),
      ])
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sayotea-orders-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },

    statusClass(status) {
      const map = {
        pending:    'status--pending',
        completed:  'status--completed',
        cancelled:  'status--cancelled',
        processing: 'status--processing',
      }
      return map[status?.toLowerCase()] || 'status--unknown'
    },

    getInitials(name) {
      if (!name) return 'W'
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-PH', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3000)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Epilogue:wght@400;500&display=swap');

* { box-sizing: border-box; }

.orders-page {
  font-family: 'Epilogue', sans-serif;
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1a1a;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a2e;
}

.page-sub {
  margin: 0;
  font-size: 0.875rem;
  color: #999;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.55rem 1.1rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.export-btn:hover { background: #0f3460; transform: translateY(-1px); }
.export-btn svg { width: 15px; height: 15px; }

/* ── Filters Bar ── */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #aaa;
}

.search-input {
  width: 100%;
  padding: 0.6rem 2.5rem 0.6rem 2.2rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  background: #fff;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #0f3460; }
.search-input::placeholder { color: #ccc; }

.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  font-size: 0.8rem;
}

.filter-tabs {
  display: flex;
  gap: 6px;
  background: #fff;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  padding: 5px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #888;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.filter-tab:hover { background: #f5f5f5; color: #333; }
.filter-tab.active { background: #1a1a2e; color: #fff; }
.filter-tab.active .tab-dot { background: #e9a84c; }

.tab-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #ccc;
  flex-shrink: 0;
}
.dot-pending  { background: #e9a84c; }
.dot-completed { background: #4ade80; }
.dot-cancelled { background: #f87171; }
.dot-all { background: #93c5fd; }

.tab-count {
  background: rgba(255,255,255,0.15);
  padding: 1px 6px;
  border-radius: 20px;
  font-size: 0.72rem;
}
.filter-tab:not(.active) .tab-count {
  background: #f0f0f0;
  color: #666;
}

.sort-select {
  padding: 0.6rem 0.9rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.85rem;
  background: #fff;
  color: #333;
  outline: none;
  cursor: pointer;
}

/* ── Table Card ── */
.table-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* Skeleton */
.skeleton-wrap { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
.skeleton-header { height: 36px; border-radius: 6px; background: #f0f0f0; }
.skeleton-row {
  height: 52px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f5f5f5 25%, #ececec 50%, #f5f5f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #ccc;
}
.empty-icon svg { width: 52px; height: 52px; margin-bottom: 1rem; opacity: 0.35; }
.empty-title { font-family: 'Sora', sans-serif; font-size: 1rem; color: #999; margin: 0 0 6px; }
.empty-sub { font-size: 0.85rem; margin: 0; color: #bbb; }

/* Orders Table */
.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table thead {
  border-bottom: 2px solid #f3f3f3;
}

.orders-table th {
  padding: 0.9rem 1rem;
  text-align: left;
  font-size: 0.73rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #bbb;
  font-weight: 500;
}

.order-row {
  border-bottom: 1px solid #f8f8f8;
  cursor: pointer;
  animation: rowIn 0.3s ease both;
  transition: background 0.15s;
}
.order-row:hover { background: #fafaf8; }
.order-row:last-child { border-bottom: none; }

@keyframes rowIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.orders-table td {
  padding: 0.9rem 1rem;
  font-size: 0.875rem;
  color: #333;
  vertical-align: middle;
}

.order-id {
  font-family: 'Sora', sans-serif;
  font-weight: 600;
  font-size: 0.8rem;
  color: #0f3460;
  background: #e8edf7;
  padding: 3px 8px;
  border-radius: 6px;
}

.customer-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cust-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.items-pill {
  background: #f3f3f3;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 0.8rem;
  color: #666;
}

.amount {
  font-weight: 600;
  color: #1a1a1a;
}

.date-cell { color: #aaa; font-size: 0.82rem; }

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}
.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status--pending    { background: #fdf3e1; color: #c47f0a; }
.status--completed  { background: #e8faf0; color: #16a34a; }
.status--cancelled  { background: #fde8e8; color: #dc2626; }
.status--processing { background: #e8edf7; color: #0f3460; }
.status--unknown    { background: #f0f0f0; color: #888; }

/* Action Buttons */
.actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s;
}
.order-row:hover .actions { opacity: 1; }

.action-btn {
  width: 30px; height: 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s, transform 0.1s;
}
.action-btn svg { width: 14px; height: 14px; }
.action-btn:active { transform: scale(0.92); }

.view-btn   { background: #e8edf7; color: #0f3460; }
.view-btn:hover { background: #d0d9f0; }

.status-btn { background: #fdf3e1; color: #c47f0a; }
.status-btn:hover { background: #f7e1b0; }

.delete-btn { background: #fde8e8; color: #dc2626; }
.delete-btn:hover { background: #fcc; }

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 1.25rem;
  border-top: 1px solid #f3f3f3;
}

.page-btn {
  padding: 6px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.83rem;
  cursor: pointer;
  color: #555;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #0f3460; color: #0f3460; }
.page-btn:disabled { opacity: 0.4; cursor: default; }

.page-numbers { display: flex; gap: 4px; }

.page-num {
  width: 34px; height: 34px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.83rem;
  cursor: pointer;
  color: #555;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.page-num:hover:not(.ellipsis) { border-color: #0f3460; color: #0f3460; }
.page-num.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }
.page-num.ellipsis { border: none; cursor: default; }

/* ── Modals ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-close {
  position: absolute;
  top: 1.1rem; right: 1.1rem;
  background: #f3f3f3;
  border: none;
  border-radius: 50%;
  width: 30px; height: 30px;
  font-size: 0.8rem;
  cursor: pointer;
  color: #777;
  transition: background 0.15s;
}
.modal-close:hover { background: #e8e8e8; }

.modal-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1a2e;
}
.modal-sub { font-size: 0.875rem; color: #888; margin: 0 0 1.5rem; }

/* Detail Modal */
.detail-modal { width: 100%; max-width: 560px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.detail-meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  background: #f8f8f6;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}
.meta-item { display: flex; flex-direction: column; gap: 3px; }
.meta-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: #aaa; }
.meta-value { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600; color: #1a1a1a; }

.detail-section-title {
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 0.75rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}
.items-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #bbb;
  border-bottom: 1.5px solid #f0f0f0;
}
.items-table td {
  padding: 0.65rem 0.75rem;
  border-bottom: 1px solid #f8f8f8;
  color: #333;
}

.detail-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid #f0f0f0;
  padding-top: 1rem;
  font-weight: 600;
  color: #555;
}
.total-amount {
  font-family: 'Sora', sans-serif;
  font-size: 1.3rem;
  color: #1a1a2e;
}

/* Status Modal */
.status-modal { width: 100%; max-width: 380px; }

.status-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
}
.status-option {
  display: flex;
  align-items: center;
  padding: 0.65rem 1rem;
  border: 1.5px solid #f0f0f0;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.status-option:hover { border-color: #ddd; background: #fafafa; }
.status-option.selected { border-color: #1a1a2e; background: #f3f4f9; }

/* Delete Modal */
.delete-modal { width: 100%; max-width: 360px; text-align: center; }
.delete-icon {
  width: 60px; height: 60px;
  background: #fde8e8;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
  color: #dc2626;
}
.delete-icon svg { width: 26px; height: 26px; }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.delete-modal .modal-actions { justify-content: center; }

.cancel-btn {
  padding: 0.6rem 1.3rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  background: #fff;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  color: #555;
  cursor: pointer;
  transition: background 0.15s;
}
.cancel-btn:hover { background: #f5f5f5; }

.confirm-btn {
  padding: 0.6rem 1.3rem;
  border: none;
  border-radius: 10px;
  background: #1a1a2e;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-btn:hover:not(:disabled) { background: #0f3460; }
.confirm-btn:disabled { opacity: 0.5; cursor: default; }

.delete-confirm-btn {
  padding: 0.6rem 1.3rem;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-confirm-btn:hover:not(:disabled) { background: #b91c1c; }
.delete-confirm-btn:disabled { opacity: 0.5; cursor: default; }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal, .modal-fade-leave-active .modal {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal, .modal-fade-leave-to .modal {
  transform: translateY(16px) scale(0.97);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 2000;
  white-space: nowrap;
}
.toast.success { background: #1a1a2e; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.3s ease;
}
.toast-slide-enter-from, .toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .orders-page { padding: 1.25rem 1rem; }
  .filters-bar { flex-direction: column; align-items: stretch; }
  .filter-tabs { overflow-x: auto; }
  .orders-table th:nth-child(3),
  .orders-table td:nth-child(3) { display: none; }
  .detail-meta { grid-template-columns: repeat(2, 1fr); }
}
</style>