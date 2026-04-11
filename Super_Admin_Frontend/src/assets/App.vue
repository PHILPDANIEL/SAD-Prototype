<template>
  <div id="app">
    <router-view v-if="isAuthPage" />
    <div v-else class="app-layout">
      <Sidebar />
      <div class="main-area">
        <Navbar :page-title="pageTitle" />
        <div class="page-content">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import Navbar  from '@/components/Navbar.vue'

const PAGE_TITLES = {
  Dashboard: 'Dashboard', Users: 'Users', Products: 'Products',
  Addons: 'Add-ons', Orders: 'Orders', Reports: 'Reports', Settings: 'Settings',
}

export default {
  name: 'App',
  components: { Sidebar, Navbar },
  computed: {
    isAuthPage() { return this.$route.meta?.public === true },
    pageTitle()  { return PAGE_TITLES[this.$route.name] || 'Super Admin' },
  },
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #f5f5f5; color: #1a1a1a; font-size: 14px; }
#app { height: 100vh; overflow: hidden; }
.app-layout { display: flex; height: 100vh; overflow: hidden; }
.main-area  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.page-content { flex: 1; overflow-y: auto; padding: 24px; background: #f5f5f5; }

/* Global btn */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: background 0.15s; font-family: inherit; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary   { background: #1D9E75; color: #fff; }
.btn-primary:hover:not(:disabled)   { background: #0F6E56; }
.btn-secondary { background: #fff; color: #333; border: 1px solid #e0e0e0; }
.btn-secondary:hover:not(:disabled) { background: #f5f5f5; }
.btn-danger    { background: #fee2e2; color: #b91c1c; }
.btn-danger:hover:not(:disabled)    { background: #fecaca; }
.btn-sm { padding: 5px 10px; font-size: 12px; }

/* Pill badges */
.pill { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; white-space: nowrap; }
.pill-green  { background: #dcfce7; color: #15803d; }
.pill-amber  { background: #fef9c3; color: #a16207; }
.pill-red    { background: #fee2e2; color: #b91c1c; }
.pill-blue   { background: #dbeafe; color: #1d4ed8; }
.pill-gray   { background: #f3f4f6; color: #6b7280; }
.pill-purple { background: #ede9fe; color: #6d28d9; }

/* Cards */
.card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; }
.section-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 16px; }

/* Tables */
.table-wrap { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
thead th { background: #f9fafb; padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; }
tbody td { padding: 11px 14px; font-size: 13px; color: #374151; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #fafafa; }

/* Forms */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 12px; font-weight: 500; color: #374151; margin-bottom: 6px; }
.form-control { width: 100%; padding: 8px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; color: #111827; background: #fff; transition: border-color 0.15s; outline: none; font-family: inherit; }
.form-control:focus { border-color: #1D9E75; }
textarea.form-control { resize: vertical; }

/* Toolbar */
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-input { padding: 7px 12px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; width: 220px; outline: none; font-family: inherit; background: #fff; }
.search-input:focus { border-color: #1D9E75; }
.filter-select { padding: 7px 10px; border: 1px solid #e0e0e0; border-radius: 8px; font-size: 13px; background: #fff; cursor: pointer; font-family: inherit; outline: none; }
.filter-select:focus { border-color: #1D9E75; }

/* Modals */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal { background: #fff; border-radius: 14px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-sm { width: 360px; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.modal-title { font-size: 16px; font-weight: 700; color: #111827; }
.modal-close { background: none; border: none; font-size: 18px; color: #9ca3af; cursor: pointer; }
.modal-close:hover { color: #374151; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-error   { color: #b91c1c; font-size: 12px; margin-top: 6px; }
.form-success { color: #15803d; font-size: 12px; margin-top: 6px; }
.confirm-text { font-size: 13px; color: #374151; margin-bottom: 20px; line-height: 1.6; }
.empty-row { text-align: center; color: #9ca3af; padding: 32px; font-size: 13px; }
</style>