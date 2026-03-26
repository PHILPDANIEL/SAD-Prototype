import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/dashboard.vue';
import Orders from '../pages/orders.vue';
import Products from '../pages/products.vue';
import Inventory from '../pages/inventory.vue';
import Logout from '../pages/logout.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/orders', name: 'Orders', component: Orders },
  { path: '/products', name: 'Products', component: Products },
  { path: '/inventory', name: 'Inventory', component: Inventory },
  { path: '/logout', name: 'Logout', component: Logout },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;