<template>
  <div class="products-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="search" class="search-input" placeholder="Search products..." />
        <select v-model="filterCategory" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="low stock">Low Stock</option>
          <option value="out of stock">Out of Stock</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openModal()">+ Add Product</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="empty-row">Loading products...</td>
          </tr>
          <tr v-else-if="filteredProducts.length === 0">
            <td colspan="6" class="empty-row">No products found.</td>
          </tr>
          <tr v-for="product in filteredProducts" :key="product._id">
            <td>
              <div class="product-name-cell">
                <div class="product-dot" :style="{ background: categoryColor(product.category) }"></div>
                {{ product.name }}
              </div>
            </td>
            <td>{{ product.category }}</td>
            <td>₱{{ product.price }}</td>
            <td>
              <span :class="stockClass(product.stock)">{{ product.stock }}</span>
            </td>
            <td>
              <span class="pill" :class="statusPill(product.stock)">{{ stockLabel(product.stock) }}</span>
            </td>
            <td>
              <div class="action-group">
                <button class="btn btn-secondary btn-sm" @click="openModal(product)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(product)">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">{{ editingProduct ? 'Edit Product' : 'Add Product' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveProduct" novalidate>
          <div class="form-group">
            <label class="form-label">Product Name *</label>
            <input v-model="form.name" class="form-control" required placeholder="e.g. Taro Milk Tea" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="form.category" class="form-control">
                <option value="">Select category</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                <option value="__new__">+ New Category</option>
              </select>
            </div>
            <div class="form-group" v-if="form.category === '__new__'">
              <label class="form-label">New Category Name</label>
              <input v-model="form.newCategory" class="form-control" placeholder="e.g. Slushie" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Price (₱) *</label>
              <input v-model.number="form.price" type="number" min="0" class="form-control" placeholder="95" />
            </div>
            <div class="form-group">
              <label class="form-label">Stock *</label>
              <input v-model.number="form.stock" type="number" min="0" class="form-control" placeholder="100" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" rows="2" placeholder="Optional product description"></textarea>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Product' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Delete Product</h2>
        </div>
        <p class="confirm-text">Delete <strong>{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="deleteProduct">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { productService } from '@/services/productService'

const emptyForm = () => ({ name: '', category: '', newCategory: '', price: '', stock: '', description: '' })

const CAT_COLORS = ['#1D9E75', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4']

export default {
  name: 'Products',
  data() {
    return {
      products: [],
      loading: true,
      search: '',
      filterCategory: '',
      filterStatus: '',
      showModal: false,
      editingProduct: null,
      form: emptyForm(),
      saving: false,
      formError: '',
      deleteTarget: null,
      categories: ['Milk Tea', 'Latte', 'Tea', 'Signature', 'Slushie', 'Juice'],
    }
  },
  computed: {
    filteredProducts() {
      const q = this.search.toLowerCase()
      return this.products.filter(p => {
        const matchSearch   = !q || p.name.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        const matchCategory = !this.filterCategory || p.category === this.filterCategory
        const matchStatus   = !this.filterStatus   || this.stockLabel(p.stock) === this.filterStatus
        return matchSearch && matchCategory && matchStatus
      })
    },
  },
  async mounted() {
    await this.loadProducts()
  },
  methods: {
    async loadProducts() {
      this.loading = true
      try {
        const res = await productService.getAll()
        this.products = res.data
        // Merge any new categories from DB
        const dbCats = [...new Set(res.data.map(p => p.category).filter(Boolean))]
        dbCats.forEach(c => { if (!this.categories.includes(c)) this.categories.push(c) })
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    openModal(product = null) {
      this.editingProduct = product
      this.form = product
        ? { name: product.name, category: product.category, newCategory: '', price: product.price, stock: product.stock, description: product.description || '' }
        : emptyForm()
      this.formError = ''
      this.showModal = true
    },

    closeModal() { this.showModal = false; this.editingProduct = null },

    async saveProduct() {
      if (!this.form.name || !this.form.price === '') {
        this.formError = 'Name and price are required.'
        return
      }
      const payload = { ...this.form }
      if (payload.category === '__new__') {
        if (!payload.newCategory.trim()) { this.formError = 'Enter a category name.'; return }
        payload.category = payload.newCategory.trim()
        if (!this.categories.includes(payload.category)) this.categories.push(payload.category)
      }
      delete payload.newCategory

      this.saving = true
      this.formError = ''
      try {
        if (this.editingProduct) {
          await productService.update(this.editingProduct._id, payload)
        } else {
          await productService.create(payload)
        }
        await this.loadProducts()
        this.closeModal()
      } catch (e) {
        this.formError = e.response?.data?.message || 'Something went wrong.'
      } finally {
        this.saving = false
      }
    },

    confirmDelete(product) { this.deleteTarget = product },

    async deleteProduct() {
      try {
        await productService.remove(this.deleteTarget._id)
        this.products = this.products.filter(p => p._id !== this.deleteTarget._id)
      } catch (e) { console.error(e) }
      finally { this.deleteTarget = null }
    },

    stockLabel(stock) {
      if (stock === 0) return 'out of stock'
      if (stock <= 10) return 'low stock'
      return 'available'
    },
    statusPill(stock) {
      if (stock === 0) return 'pill-red'
      if (stock <= 10) return 'pill-amber'
      return 'pill-green'
    },
    stockClass(stock) {
      if (stock === 0) return 'stock-zero'
      if (stock <= 10) return 'stock-low'
      return 'stock-ok'
    },
    categoryColor(cat) {
      const idx = this.categories.indexOf(cat)
      return CAT_COLORS[idx % CAT_COLORS.length] || '#6b7280'
    },
  },
}
</script>

<style scoped>
.products-page { display: flex; flex-direction: column; gap: 16px; }
.filter-select { padding: 7px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; }
.product-name-cell { display: flex; align-items: center; gap: 8px; }
.product-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.action-group { display: flex; gap: 6px; }
.empty-row { text-align: center; color: #9ca3af; padding: 24px; font-size: 13px; }
.stock-ok   { color: #15803d; font-weight: 600; }
.stock-low  { color: #a16207; font-weight: 600; }
.stock-zero { color: #b91c1c; font-weight: 600; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 500px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-sm { width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; }
.modal-close { background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error { color: #b91c1c; font-size: 12px; margin-top: 8px; }
.confirm-text { font-size: 13px; color: #374151; margin-bottom: 20px; }
</style>