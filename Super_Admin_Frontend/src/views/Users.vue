<template>
  <div class="users-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="search" class="search-input" placeholder="Search users..." />
        <select v-model="filterRole" class="filter-select">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openModal()">+ Add User</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="empty-row">Loading users...</td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <td colspan="6" class="empty-row">No users found.</td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user._id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ initials(user.name) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td><span class="pill" :class="roleClass(user.role)">{{ user.role }}</span></td>
            <td>
              <span class="pill" :class="user.status === 'active' ? 'pill-green' : 'pill-amber'">
                {{ user.status }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-group">
                <button class="btn btn-secondary btn-sm" @click="openModal(user)">Edit</button>
                <button
                  class="btn btn-sm"
                  :class="user.status === 'active' ? 'btn-amber' : 'btn-green'"
                  @click="toggleStatus(user)"
                >
                  {{ user.status === 'active' ? 'Deactivate' : 'Activate' }}
                </button>
                <button class="btn btn-danger btn-sm" @click="confirmDelete(user)">Delete</button>
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
          <h2 class="modal-title">{{ editingUser ? 'Edit User' : 'Add User' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <form @submit.prevent="saveUser" novalidate>
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input v-model="form.name" class="form-control" required placeholder="e.g. Maria Santos" />
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input v-model="form.email" type="email" class="form-control" required placeholder="user@sayotea.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password {{ editingUser ? '(leave blank to keep)' : '*' }}</label>
            <input v-model="form.password" type="password" class="form-control" :required="!editingUser" placeholder="••••••••" />
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Role *</label>
              <select v-model="form.role" class="form-control">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
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
              {{ saving ? 'Saving…' : 'Save User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2 class="modal-title">Delete User</h2>
        </div>
        <p class="confirm-text">Are you sure you want to delete <strong>{{ deleteTarget.name }}</strong>? This cannot be undone.</p>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteTarget = null">Cancel</button>
          <button class="btn btn-danger" @click="deleteUser">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/userService'

const emptyForm = () => ({ name: '', email: '', password: '', role: 'user', status: 'active' })

export default {
  name: 'Users',
  data() {
    return {
      users: [],
      loading: true,
      search: '',
      filterRole: '',
      filterStatus: '',
      showModal: false,
      editingUser: null,
      form: emptyForm(),
      saving: false,
      formError: '',
      deleteTarget: null,
    }
  },
  computed: {
    filteredUsers() {
      const q = this.search.toLowerCase()
      return this.users.filter(u => {
        const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        const matchRole   = !this.filterRole   || u.role === this.filterRole
        const matchStatus = !this.filterStatus || u.status === this.filterStatus
        return matchSearch && matchRole && matchStatus
      })
    },
  },
  async mounted() {
    await this.loadUsers()
  },
  methods: {
    async loadUsers() {
      this.loading = true
      try {
        const res = await userService.getAll()
        this.users = res.data
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    openModal(user = null) {
      this.editingUser = user
      this.form = user
        ? { name: user.name, email: user.email, password: '', role: user.role, status: user.status }
        : emptyForm()
      this.formError = ''
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.editingUser = null
    },

    async saveUser() {
      if (!this.form.name || !this.form.email) {
        this.formError = 'Name and email are required.'
        return
      }
      this.saving = true
      this.formError = ''
      try {
        const payload = { ...this.form }
        if (!payload.password) delete payload.password
        if (this.editingUser) {
          await userService.update(this.editingUser._id, payload)
        } else {
          await userService.create(payload)
        }
        await this.loadUsers()
        this.closeModal()
      } catch (e) {
        this.formError = e.response?.data?.message || 'Something went wrong.'
      } finally {
        this.saving = false
      }
    },

    async toggleStatus(user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      try {
        await userService.setStatus(user._id, newStatus)
        user.status = newStatus
      } catch (e) {
        console.error(e)
      }
    },

    confirmDelete(user) { this.deleteTarget = user },

    async deleteUser() {
      try {
        await userService.remove(this.deleteTarget._id)
        this.users = this.users.filter(u => u._id !== this.deleteTarget._id)
      } catch (e) {
        console.error(e)
      } finally {
        this.deleteTarget = null
      }
    },

    initials(name) {
      return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'
    },

    roleClass(role) {
      return { superadmin: 'pill-red', admin: 'pill-blue', user: 'pill-gray' }[role] || 'pill-gray'
    },

    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    },
  },
}
</script>

<style scoped>
.users-page { display: flex; flex-direction: column; gap: 16px; }

.filter-select {
  padding: 7px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

.user-cell { display: flex; align-items: center; gap: 8px; }
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ecfdf5;
  color: #1D9E75;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-group { display: flex; gap: 6px; }
.btn-amber { background: #fef9c3; color: #a16207; }
.btn-amber:hover { background: #fef08a; }
.btn-green { background: #dcfce7; color: #15803d; }
.btn-green:hover { background: #bbf7d0; }

.empty-row { text-align: center; color: #9ca3af; padding: 24px; font-size: 13px; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #fff;
  border-radius: 14px;
  width: 480px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}
.modal-sm { width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; }
.modal-close { background: none; border: none; font-size: 16px; color: #9ca3af; cursor: pointer; }
.modal-close:hover { color: #374151; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error { color: #b91c1c; font-size: 12px; margin-top: 8px; }
.confirm-text { font-size: 13px; color: #374151; margin-bottom: 20px; line-height: 1.6; }
</style>