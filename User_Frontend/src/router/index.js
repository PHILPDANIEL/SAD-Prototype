import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import Store from "../pages/store.vue";
import Orders from "../pages/orders.vue";
import Profile from "../pages/profile.vue";
import Logout from "../pages/logout.vue";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";
import Checkout from "../pages/checkout.vue"; // ✅ ADD THIS

const routes = [
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  { path: "/", component: Home },
  { path: "/store", component: Store },
  { path: "/checkout", component: Checkout }, // ✅ ADD THIS
  { path: "/orders", component: Orders },
  { path: "/profile", component: Profile },
  { path: "/logout", component: Logout }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (!token && to.path !== "/login" && to.path !== "/register") {
    next("/login");
  } else {
    next();
  }
});

export default router;