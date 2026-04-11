<template>
  <div class="addons-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="search" class="search-input" placeholder="Search add-ons..." />
        <select v-model="filterCategory" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openModal()">+ Add Addon</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="empty-row">Loading add-ons...</td>
          </tr>
          <tr v-else-if="filtered.length === 0">
            <td colspan="6" class="empty-row">No add-ons found.</td>
          </tr>
          <tr v-for="addon in filtered" :key="addon._id">
            <td>{{ addon.name }}</td>
            <td><span class="pill pill-blue">{{ addon.category }}</span></td>
            <td>{{ addon.price === 0 ? 'Free' : '+₱' + addon.price }}</td>
            <td>{{ addon.assignedTo || 'All Products' }}</td>
            <td>
              <span class="pill" :class="addon.status === 'active' ? 'pill-green' : 'pill-amber'">
                {{ addon.status }}
              </span>
            </td>
            <td>
              <div class="action-group">
                <button class="btn btn-secondary btn-sm" @click="openModal(addon)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(addon)">Delete</button>
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
          <h2 class="modal-title">{{ editing ? 'Edit Add-on' : 'Add Add-on' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="save" novalidate>
          <div class="form-group">
            <label class="form-label">Add-on Name *</label>
            <input v-model="form.name" class="form-control" required placeholder="e.g. Extra Pearls" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select v-model="form.category" class="form-control">
                <option value="">Select</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Price (₱) *</label>
              <input v-model.number="form.price" type="number" min="0" class="form-control" placeholder="15" />
            </div>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Assign To</label>
              <select v-model="form.assignedTo" class="form-control">
                <option value="">All Products</option>
                <option value="Milk Tea only">Milk Tea only</option>
                <option value="Latte only">Latte only</option>
                <option value="Tea only">Tea only</option>
                <option value="Signature only">Signature only</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-control">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header"><h2 class="modal-title">Delete Add-on</h2></div>
        <p class="confirm-text">Delete <strong>{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="deleteAddon">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { addonService } from '@/services/addonService'

const emptyForm = () => ({ name: '', category: '', price: 0, assignedTo: '', status: 'active' })

export default {
  name: 'Addons',
  data() {
    return {
      addons: [],
      loading: true,
      search: '',
      filterCategory: '',
      filterStatus: '',
      showModal: false,
      editing: null,
      form: emptyForm(),
      saving: false,
      formError: '',
      deleteTarget: null,
      categories: ['Topping', 'Boost', 'Preference', 'Size', 'Sugar Level'],
    }
  },
  computed: {
    filtered() {
      const q = this.search.toLowerCase()
      return this.addons.filter(a => {
        const matchSearch = !q || a.name.toLowerCase().includes(q)
        const matchCat    = !this.filterCategory || a.category === this.filterCategory
        const matchStatus = !this.filterStatus   || a.status === this.filterStatus
        return matchSearch && matchCat && matchStatus
      })
    },
  },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const res = await addonService.getAll()
        this.addons = res.data
      } catch (e) { console.error(e) }
      finally { this.loading = false }
    },

    openModal(addon = null) {
      this.editing = addon
      this.form = addon
        ? { name: addon.name, category: addon.category, price: addon.price, assignedTo: addon.assignedTo || '', status: addon.status }
        : emptyForm()
      this.formError = ''
      this.showModal = true
    },
    closeModal() { this.showModal = false; this.editing = null },

    async save() {
      if (!this.form.name || !this.form.category) { this.formError = 'Name and category are required.'; return }
      this.saving = true; this.formError = ''
      try {
        if (this.editing) await addonService.update(this.editing._id, this.form)
        else await addonService.create(this.form)
        await this.load()
        this.closeModal()
      } catch (e) { this.formError = e.response?.data?.message || 'Error saving.' }
      finally { this.saving = false }
    },

    confirmDelete(addon) { this.deleteTarget = addon },
    async deleteAddon() {
      try { await addonService.remove(this.deleteTarget._id); this.addons = this.addons.filter(a => a._id !== this.deleteTarget._id) }
      catch (e) { console.error(e) }
      finally { this.deleteTarget = null }
    },
  },
}
</script>

<style scoped>
.addons-page { display: flex; flex-direction: column; gap: 16px; }
.filter-select { padding: 7px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; }
.action-group { display: flex; gap: 6px; }
.empty-row { text-align: center; color: #9ca3af; padding: 24px; font-size: 13px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 460px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-sm { width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; }
.modal-close { background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error { color: #b91c1c; font-size: 12px; margin-top: 8px; }
.confirm-text { font-size: 13px; color: #374151; margin-bottom: 20px; }
</style>