import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import Store from "../pages/store.vue";
import Orders from "../pages/orders.vue";
import Profile from "../pages/profile.vue";
import Logout from "../pages/logout.vue";
import Checkout from "../pages/checkout.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/store", component: Store },
  { path: "/orders", component: Orders },
  { path: "/profile", component: Profile },
  { path: "/logout", component: Logout },
  {path: "/checkout",component: Checkout}
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;