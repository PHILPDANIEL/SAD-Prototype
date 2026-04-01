import { createRouter, createWebHistory } from "vue-router"

import Home from "../pages/home.vue"
import Store from "../pages/store.vue"
import Orders from "../pages/orders.vue"
import Profile from "../pages/profile.vue"
import Logout from "../pages/logout.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/store",
    name: "Store",
    component: Store
  },
  {
    path: "/orders",
    name: "Orders",
    component: Orders
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile
  },
  {
    path: "/logout",
    name: "Logout",
    component: Logout
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router