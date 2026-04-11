<template>
  <div class="settings-page">
    <div class="settings-grid">
      <!-- System Settings -->
      <div class="card">
        <div class="section-title">System Settings</div>
        <form @submit.prevent="saveSystem">
          <div class="form-group">
            <label class="form-label">System / Business Name</label>
            <input v-model="system.name" class="form-control" placeholder="SayoTea POS" />
          </div>
          <div class="form-group">
            <label class="form-label">Currency</label>
            <select v-model="system.currency" class="form-control">
              <option value="PHP">PHP (₱)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Tax Rate (%)</label>
              <input v-model.number="system.taxRate" type="number" min="0" max="100" step="0.5" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Service Fee (%)</label>
              <input v-model.number="system.serviceFee" type="number" min="0" max="100" step="0.5" class="form-control" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Low Stock Alert Threshold</label>
            <input v-model.number="system.lowStockAt" type="number" min="1" class="form-control" placeholder="10" />
            <p class="hint">Products below this quantity will show as "low stock".</p>
          </div>
          <div class="save-row">
            <span v-if="systemSaved" class="saved-msg">✓ Saved!</span>
            <button type="submit" class="btn btn-primary" :disabled="systemSaving">
              {{ systemSaving ? 'Saving…' : 'Save Settings' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Account Settings -->
      <div class="card">
        <div class="section-title">Change Password</div>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input v-model="pw.current" type="password" class="form-control" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input v-model="pw.newPw" type="password" class="form-control" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input v-model="pw.confirm" type="password" class="form-control" placeholder="••••••••" />
          </div>
          <p v-if="pwError" class="form-error">{{ pwError }}</p>
          <p v-if="pwSuccess" class="form-success">{{ pwSuccess }}</p>
          <div class="save-row">
            <button type="submit" class="btn btn-primary" :disabled="pwSaving">
              {{ pwSaving ? 'Updating…' : 'Update Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card danger-card">
      <div class="section-title danger-title">Danger Zone</div>
      <div class="danger-row">
        <div>
          <p class="danger-label">Clear all orders</p>
          <p class="danger-hint">Permanently deletes all orders from the database. Cannot be undone.</p>
        </div>
        <button class="btn btn-danger" @click="warnDanger('orders')">Clear Orders</button>
      </div>
    </div>

    <!-- Danger Confirm -->
    <div v-if="dangerTarget" class="modal-backdrop" @click.self="dangerTarget = null">
      <div class="modal">
        <div class="modal-header"><h2 class="modal-title">Are you absolutely sure?</h2></div>
        <p class="confirm-text">This will permanently delete all <strong>{{ dangerTarget }}</strong> from the database. Type <strong>DELETE</strong> to confirm.</p>
        <input v-model="dangerConfirm" class="form-control" placeholder="Type DELETE" style="margin-bottom: 16px;" />
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="dangerTarget = null">Cancel</button>
          <button class="btn btn-danger" :disabled="dangerConfirm !== 'DELETE'" @click="executeDanger">Confirm Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'Settings',
  data() {
    return {
      system: { name: 'SayoTea POS', currency: 'PHP', taxRate: 12, serviceFee: 0, lowStockAt: 10 },
      systemSaving: false,
      systemSaved: false,
      pw: { current: '', newPw: '', confirm: '' },
      pwSaving: false,
      pwError: '',
      pwSuccess: '',
      dangerTarget: null,
      dangerConfirm: '',
    }
  },
  async mounted() {
    try {
      const res = await api.get('/settings')
      if (res.data) Object.assign(this.system, res.data)
    } catch (e) { /* use defaults */ }
  },
  methods: {
    async saveSystem() {
      this.systemSaving = true
      try {
        await api.post('/settings', this.system)
        this.systemSaved = true
        setTimeout(() => { this.systemSaved = false }, 2000)
      } catch (e) { console.error(e) }
      finally { this.systemSaving = false }
    },

    async changePassword() {
      this.pwError = ''; this.pwSuccess = ''
      if (!this.pw.current || !this.pw.newPw) { this.pwError = 'All fields are required.'; return }
      if (this.pw.newPw !== this.pw.confirm) { this.pwError = 'Passwords do not match.'; return }
      if (this.pw.newPw.length < 6) { this.pwError = 'Password must be at least 6 characters.'; return }
      this.pwSaving = true
      try {
        await api.post('/auth/change-password', { currentPassword: this.pw.current, newPassword: this.pw.newPw })
        this.pwSuccess = 'Password updated successfully.'
        this.pw = { current: '', newPw: '', confirm: '' }
      } catch (e) {
        this.pwError = e.response?.data?.message || 'Failed to update password.'
      } finally {
        this.pwSaving = false
      }
    },

    warnDanger(target) { this.dangerTarget = target; this.dangerConfirm = '' },
    async executeDanger() {
      try {
        await api.delete(`/${this.dangerTarget}`)
      } catch (e) { console.error(e) }
      finally { this.dangerTarget = null }
    },
  },
}
</script>

<style scoped>
.settings-page { display: flex; flex-direction: column; gap: 20px; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.hint { font-size: 11px; color: #9ca3af; margin-top: 4px; }
.save-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.saved-msg { font-size: 12px; color: #15803d; font-weight: 500; }
.form-error { color: #b91c1c; font-size: 12px; margin-top: 4px; }
.form-success { color: #15803d; font-size: 12px; margin-top: 4px; }

.danger-card { border-color: #fecaca; }
.danger-title { color: #b91c1c; }
.danger-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.danger-label { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; }
.danger-hint  { font-size: 12px; color: #9ca3af; }

.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 100; }
.modal { background: #fff; border-radius: 14px; width: 420px; max-width: 95vw; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; }
.confirm-text { font-size: 13px; color: #374151; margin-bottom: 16px; line-height: 1.6; }
</style>