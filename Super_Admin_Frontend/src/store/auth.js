import { reactive } from 'vue'

// Decode JWT payload without external library
function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// Rehydrate from localStorage on page load
const storedToken = localStorage.getItem('token')
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
})()

export const authStore = reactive({
  token: storedToken || null,
  user:  storedUser  || null,

  setAuth(user, token) {
    this.user  = user
    this.token = token
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
  },

  clearAuth() {
    this.user  = null
    this.token = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  get isLoggedIn() {
    if (!this.token) return false
    // Check token expiry
    const decoded = decodeToken(this.token)
    if (!decoded?.exp) return false
    if (Date.now() / 1000 > decoded.exp) {
      this.clearAuth()
      return false
    }
    return true
  },

  get role() {
    return this.user?.role || null
  },

  get name() {
    return this.user?.name || 'Admin'
  },

  get initials() {
    const name = this.user?.name || 'SA'
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  },
})