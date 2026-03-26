<template>
  <div>
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="@/assets/images/sayotea-logo.png" class="logo" />
        <strong>Sayotea Admin</strong>
      </div>
      <div class="nav-right">
        <button class="btn logout" @click="logout">Logout</button>
      </div>
    </nav>

    <!-- Dashboard Container -->
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>

      <!-- Top Selling Drinks -->
      <h2>Top Selling Drinks</h2>
      <ul id="topProducts">
        <li v-for="(product, index) in topProducts" :key="index">
          {{ product.name }} ({{ product.sold }} sold)
        </li>
      </ul>

      <!-- Stats -->
      <div class="stats">
        <div class="stat-box">
          <h3>Total Orders</h3>
          <span>{{ totalOrders }}</span>
        </div>
        <div class="stat-box">
          <h3>Total Sales</h3>
          <span>₱{{ totalSales.toLocaleString() }}</span>
        </div>
        <div class="stat-box">
          <h3>Manage Inventory</h3>
          <button class="btn" @click="fetchProducts('all')">Open</button>
        </div>
        <div class="stat-box">
          <h3>View Product Stocks</h3>
          <button class="btn" @click="fetchProducts('lowstock')">Open</button>
        </div>
      </div>

      <!-- Add Product Form -->
      <h2>Add Product</h2>
      <form class="form" @submit.prevent="addProduct">
        <input v-model="newProduct.id" type="text" placeholder="ID" required />
        <input v-model="newProduct.name" type="text" placeholder="Name" required />
        <input v-model="newProduct.category" type="text" placeholder="Category" required />
        <input v-model.number="newProduct.price" type="number" placeholder="Price" required />
        <input v-model.number="newProduct.stock" type="number" placeholder="Stock" required />
        <button class="form button" type="submit">Add Product</button>
      </form>

      <!-- Product Table -->
      <div id="productTable" v-html="productTableHtml"></div>

      <!-- Live Orders -->
      <h2>Orders</h2>
      <div id="ordersContainer">
        <div v-for="order in liveOrders" :key="order.id" class="order-card">
          <p>{{ order.name }} x{{ order.qty }} ({{ order.size }}, {{ order.addon }})</p>
          <small>₱{{ order.price }}</small>
          <small>{{ order.created_at }}</small>
        </div>
      </div>

      <!-- Orders Table -->
      <table class="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Total</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>₱{{ parseFloat(order.total).toLocaleString() }}</td>
            <td>{{ order.date }}</td>
            <td>{{ order.status }}</td>
            <td>
              <button v-if="order.status === 'Pending'" class="approve" @click="approveOrder(order)">Approve</button>
              <button v-if="order.status !== 'Delivered' && order.status !== 'Cancelled'" class="cancel" @click="cancelOrder(order)">Cancel</button>
              <button class="receipt-btn" @click="downloadReceipt(order)">Receipt</button>
              <select v-model="order.status" @change="saveOrders">
                <option v-for="stat in statuses" :key="stat">{{ stat }}</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      © 2026 Sayotea Milktea Shop |
      <a href="pages/contact.html">Contact Us</a>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import Chart from 'chart.js/auto';

const orders = ref(JSON.parse(localStorage.getItem("orders")) || []);
const liveOrders = ref([]);
const topProducts = ref([]);
const productTableHtml = ref("");
const totalOrders = ref(orders.value.length);
const totalSales = ref(orders.value.reduce((sum, o) => sum + parseFloat(o.total || 0), 0));
const statuses = ["Pending", "Creating", "OTW to Delivery", "Delivered", "Cancelled"];

const newProduct = reactive({
  id: "",
  name: "",
  category: "",
  price: 0,
  stock: 0
});

// =================== METHODS ===================

function logout() {
  localStorage.setItem("isLoggedIn", "false");
  localStorage.removeItem("role");
  window.location.href = "../../user/loginregister/login.html";
}

function addProduct() {
  const formData = new FormData();
  Object.keys(newProduct).forEach(key => formData.append(key, newProduct[key]));

  fetch("add_product.php", { method: "POST", body: formData })
    .then(res => res.text())
    .then(data => {
      alert(data);
      Object.keys(newProduct).forEach(k => newProduct[k] = "");
      fetchProducts("all");
    });
}

function fetchProducts(type) {
  fetch(`fetch_products.php?type=${type}`)
    .then(res => res.text())
    .then(data => productTableHtml.value = data)
    .catch(err => alert("Error fetching data"));
}

function fetchLiveOrders() {
  fetch("../../../backend/fetch_orders.php")
    .then(res => res.json())
    .then(data => liveOrders.value = data)
    .catch(err => console.error("Error fetching live orders:", err));
}

function saveOrders() {
  localStorage.setItem("orders", JSON.stringify(orders.value));
  loadOrders();
}

function cancelOrder(order) {
  if(confirm("Cancel this order?")) {
    order.status = "Cancelled";
    saveOrders();
  }
}

function approveOrder(order) {
  order.status = "Creating";
  saveOrders();
}

function downloadReceipt(order) {
  const receipt = `
SAYOTEA MILKTEA SHOP
------------------------
Order ID: ${order.id}
Date: ${order.date}
Status: ${order.status}

Total: ₱${order.total}
`;
  const blob = new Blob([receipt], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "receipt_" + order.id + ".txt";
  link.click();
}

function loadOrders() {
  totalOrders.value = orders.value.length;
  totalSales.value = orders.value.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  loadTopProducts();
  renderSalesChart();
}

function loadTopProducts() {
  const productCount = {};
  orders.value.forEach(order => {
    if(!order.items) return;
    order.items.forEach(item => {
      if(!productCount[item.name]) productCount[item.name] = 0;
      productCount[item.name] += item.qty;
    });
  });
  topProducts.value = Object.entries(productCount)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .map(([name, sold]) => ({ name, sold }));
}

function renderSalesChart() {
  const salesPerDay = {};
  orders.value.forEach(order => {
    const date = order.date;
    if(!salesPerDay[date]) salesPerDay[date] = 0;
    salesPerDay[date] += parseFloat(order.total || 0);
  });
  const ctx = document.getElementById("salesChart");
  if(!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(salesPerDay),
      datasets: [{ label: "Daily Sales ₱", data: Object.values(salesPerDay) }]
    }
  });
}

// =================== MOUNT ===================
onMounted(() => {
  if(localStorage.getItem("isLoggedIn") !== "true" || localStorage.getItem("role") !== "admin") {
    window.location.href = "../../user/loginregister/login.html";
  }

  loadOrders();
  fetchLiveOrders();
  setInterval(fetchLiveOrders, 5000);
  setInterval(loadOrders, 3000);
});
</script>

<style scoped>
/* ===== Navbar ===== */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 50px;
  background: #5cb85c;
  color: white;
  border-radius: 0 0 12px 12px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.nav-left .logo { height: 40px; border-radius: 50%; }
.nav-right .btn { padding: 8px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; }
.btn.logout { background: #d9534f; color: white; }
.btn.logout:hover { background: #c9302c; }

/* ===== Dashboard Container ===== */
.dashboard-container {
  width: 95%;
  max-width: 1200px;
  margin: 30px auto;
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  font-family: Arial, sans-serif;
  min-height: calc(100vh - 120px);
  padding-bottom: 80px;
}

h1 { text-align: center; color: #5cb85c; }
h2 { margin-top: 40px; color: #5cb85c; }

/* Stats Cards */
.stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 25px 0;
  gap: 20px;
}
.stat-box {
  flex: 1 1 45%;
  min-width: 220px;
  background: #fafafa;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 15px;
}
.stat-box h3 { color: #5cb85c; }
.stat-box .btn {
  background: #5cb85c;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
}

/* Orders Table */
.orders-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
.orders-table th { background: #5cb85c; color: white; padding: 10px; }
.orders-table td { padding: 10px; border-bottom: 1px solid #ddd; }
.approve { background:#5cb85c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; }
.cancel { background:#d9534f; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:5px; }
.receipt-btn { background:#0275d8; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; margin-left:5px; }
.order-notification { position:fixed; top:20px; right:20px; background:#5cb85c; color:white; padding:15px; border-radius:8px; box-shadow:0 5px 10px rgba(0,0,0,0.2); z-index:9999; }

/* Footer */
footer {
  position:fixed;
  bottom:0;
  left:0;
  width:100%;
  background:#2f2f2f;
  color:white;
  text-align:center;
  padding:15px;
  z-index:1000;
}
footer a { color:#5cb85c; text-decoration:none; }

/* Product Table */
.product-table { width:100%; border-collapse:collapse; margin-top:20px; }
.product-table th { background:#5cb85c; color:white; padding:12px; }
.product-table td { padding:10px; border-bottom:1px solid #ddd; }
.price { color:#2ecc71; font-weight:bold; }
.edit-btn { background:#3498db; border:none; padding:6px 12px; color:white; border-radius:5px; cursor:pointer; }
.delete-btn { background:#e74c3c; border:none; padding:6px 12px; color:white; border-radius:5px; cursor:pointer; }

/* Form */
form { margin-top: 20px; }
form input { padding: 8px; margin: 5px; }
form button { background: #5cb85c; color: white; border: none; padding: 8px 15px; cursor: pointer; }
</style>