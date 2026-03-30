import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import Store from "../pages/Store.vue";
import Orders from "../pages/Orders.vue";
import Profile from "../pages/Profile.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/store", name: "Store", component: Store },
  { path: "/orders", name: "Orders", component: Orders },
  { path: "/profile", name: "Profile", component: Profile },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;