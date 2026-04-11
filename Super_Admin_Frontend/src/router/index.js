import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/store/auth'

import Login     from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'
import Users     from '@/views/Users.vue'
import Products  from '@/views/Products.vue'
import Addons    from '@/views/Addons.vue'
import Orders    from '@/views/Orders.vue'
import Reports   from '@/views/Reports.vue'
import Settings  from '@/views/Settings.vue'

const routes = [
  { path: '/login',    name: 'Login',     component: Login,     meta: { public: true } },
  { path: '/',         name: 'Dashboard', component: Dashboard, meta: { roles: ['admin', 'superadmin'] } },
  { path: '/users',    name: 'Users',     component: Users,     meta: { roles: ['superadmin'] } },
  { path: '/products', name: 'Products',  component: Products,  meta: { roles: ['admin', 'superadmin'] } },
  { path: '/addons',   name: 'Addons',    component: Addons,    meta: { roles: ['admin', 'superadmin'] } },
  { path: '/orders',   name: 'Orders',    component: Orders,    meta: { roles: ['admin', 'superadmin'] } },
  { path: '/reports',  name: 'Reports',   component: Reports,   meta: { roles: ['admin', 'superadmin'] } },
  { path: '/settings', name: 'Settings',  component: Settings,  meta: { roles: ['superadmin'] } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = authStore.isLoggedIn
  const userRole   = authStore.role

  if (to.meta.public) {
    return isLoggedIn ? next('/') : next()
  }
  if (!isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } })
  }
  const allowedRoles = to.meta.roles
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return next('/')
  }
  next()
})

export default router