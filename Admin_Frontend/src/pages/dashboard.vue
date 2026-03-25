<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <img src="../../assets/images/sayotea-logo.png" class="logo" />
        <strong>Sayotea Admin</strong>
      </div>
      <div class="nav-right">
        <button class="btn logout" @click="logout">Logout</button>
      </div>
    </nav>

    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>

      <h2>Top Selling Drinks</h2>
      <ul>
        <li v-for="p in topProducts" :key="p.name">
          {{ p.name }} ({{ p.qty }} sold)
        </li>
      </ul>

      <div class="stats">
        <div class="stat-box">
          <h3>Total Orders</h3>
          <span>{{ orders.length }}</span>
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

      <h2>Add Product</h2>
      <form class="form" @submit.prevent="addProduct">
        <input v-model="newProduct.id" placeholder="ID" required />
        <input v-model="newProduct.name" placeholder="Name" required />
        <input v-model="newProduct.category" placeholder="Category" required />
        <input v-model="newProduct.price" type="number" placeholder="Price" required />
        <input v-model="newProduct.stock" type="number" placeholder="Stock" required />
        <button type="submit">Add Product</button>
      </form>

      <div v-html="productTable"></div>

      <h2>Orders</h2>

      <!-- live orders -->
      <div>
        <div class="order-card" v-for="o in liveOrders" :key="o.id">
          <p>{{ o.name }} x{{ o.qty }} ({{ o.size }}, {{ o.addon }})</p>
          <small>₱{{ o.price }}</small>
          <small>{{ o.created_at }}</small>
        </div>
      </div>

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
            <td>₱{{ Number(order.total).toLocaleString() }}</td>
            <td>{{ order.date }}</td>

            <td>
              <select v-model="order.status" @change="saveOrders">
                <option v-for="s in statuses" :key="s">
                  {{ s }}
                </option>
              </select>
            </td>

            <td>
              <button
                v-if="order.status === 'Pending'"
                class="approve"
                @click="approveOrder(order)"
              >
                Approve
              </button>

              <button
                v-if="order.status !== 'Delivered' && order.status !== 'Cancelled'"
                class="cancel"
                @click="cancelOrder(order)"
              >
                Cancel
              </button>

              <button class="receipt-btn" @click="downloadReceipt(order)">
                Receipt
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer>
      © 2026 Sayotea Milktea Shop
    </footer>
  </div>
</template>

<script>
export default {
  name: "AdminDashboard",

  data() {
    return {
      orders: [],
      liveOrders: [],
      topProducts: [],
      productTable: "",
      statuses: [
        "Pending",
        "Creating",
        "OTW to Delivery",
        "Delivered",
        "Cancelled",
      ],
      newProduct: {
        id: "",
        name: "",
        category: "",
        price: "",
        stock: "",
      },
    };
  },

  computed: {
    totalSales() {
      return this.orders.reduce(
        (sum, o) => sum + (parseFloat(o.total) || 0),
        0
      );
    },
  },

  mounted() {
    console.log("Admin Dashboard Loaded");

    this.checkLogin();
    this.loadOrders();
    this.loadTopProducts();
    this.fetchOrders();

    setInterval(this.loadOrders, 3000);
    setInterval(this.fetchOrders, 5000);
  },

  methods: {
    checkLogin() {
      if (
        localStorage.getItem("isLoggedIn") !== "true" ||
        localStorage.getItem("role") !== "admin"
      ) {
        window.location.href = "../../user/loginregister/login.html";
      }
    },

    logout() {
      localStorage.setItem("isLoggedIn", "false");
      localStorage.removeItem("role");
      window.location.href = "../../user/loginregister/login.html";
    },

    loadOrders() {
      this.orders = JSON.parse(localStorage.getItem("orders")) || [];
    },

    saveOrders() {
      localStorage.setItem("orders", JSON.stringify(this.orders));
      this.loadOrders();
    },

    approveOrder(order) {
      order.status = "Creating";
      this.saveOrders();
    },

    cancelOrder(order) {
      if (confirm("Cancel this order?")) {
        order.status = "Cancelled";
        this.saveOrders();
      }
    },

    downloadReceipt(order) {
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
    },

loadTopProducts() {
  let orders = JSON.parse(localStorage.getItem("orders"));

  // fallback if corrupted or null
  if (!Array.isArray(orders)) {
    console.warn("Orders is not an array, using fallback data");
    orders = [];
  }

  const productCount = {};

  orders.forEach((order) => {
    if (!order.items) return;

    order.items.forEach((item) => {
      if (!productCount[item.name]) productCount[item.name] = 0;
      productCount[item.name] += item.qty;
    });
  });

  const sorted = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  this.topProducts = sorted.map((p) => ({
    name: p[0],
    qty: p[1],
  }));
},

    fetchProducts(type) {
      fetch(`fetch_products.php?type=${type}`)
        .then((res) => res.text())
        .then((data) => {
          this.productTable = data;
        })
        .catch(() => alert("Error fetching data"));
    },

    addProduct() {
      const formData = new FormData();
      Object.keys(this.newProduct).forEach((k) =>
        formData.append(k, this.newProduct[k])
      );

      fetch("add_product.php", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.text())
        .then((data) => {
          alert(data);
          this.fetchProducts("all");
        });
    },

    fetchOrders() {
      fetch("../../../backend/fetch_orders.php")
        .then((res) => res.json())
        .then((data) => {
          this.liveOrders = data;
        })
        .catch((err) => console.error(err));
    },
  },
};
</script>

<style>
/* General dashboard container */
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

/* Navbar */
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

.nav-left .logo {
    height: 40px;
    border-radius: 50%;
}

.nav-right .btn {
    padding: 8px 20px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}

.btn.logout {
    background: #d9534f;
    color: white;
}

.btn.logout:hover {
    background: #c9302c;
}

/* Headings */
h1 {
    text-align: center;
    color: #5cb85c;
}

h2 {
    margin-top: 40px;
    color: #5cb85c;
}

/* Stats cards */
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

.stat-box h3 {
    color: #5cb85c;
}

.stat-box .btn {
    background: #5cb85c;
    color: white;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
    border-radius: 6px;
}

/* Orders table */
.orders-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 14px;
}

.orders-table th {
    background: #5cb85c;
    color: white;
    padding: 10px;
}

.orders-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
}

.approve {
    background:#5cb85c;
    color:white;
    border:none;
    padding:5px 10px;
    border-radius:5px;
    cursor:pointer;
}

.cancel {
    background:#d9534f;
    color:white;
    border:none;
    padding:5px 10px;
    border-radius:5px;
    cursor:pointer;
    margin-left:5px;
}

.receipt-btn {
    background:#0275d8;
    color:white;
    border:none;
    padding:5px 10px;
    border-radius:5px;
    cursor:pointer;
    margin-left:5px;
}

.order-notification {
    position:fixed;
    top:20px;
    right:20px;
    background:#5cb85c;
    color:white;
    padding:15px;
    border-radius:8px;
    box-shadow:0 5px 10px rgba(0,0,0,0.2);
    z-index:9999;
}

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

footer a {
    color:#5cb85c;
    text-decoration:none;
}

/* Product table */
.product-table {
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

.product-table th {
    background:#5cb85c;
    color:white;
    padding:12px;
}

.product-table td {
    padding:10px;
    border-bottom:1px solid #ddd;
}

.price {
    color:#2ecc71;
    font-weight:bold;
}

.edit-btn {
    background:#3498db;
    border:none;
    padding:6px 12px;
    color:white;
    border-radius:5px;
    cursor:pointer;
}

.delete-btn {
    background:#e74c3c;
    border:none;
    padding:6px 12px;
    color:white;
    border-radius:5px;
    cursor:pointer;
}



form {
    margin-top: 20px;
}

form input {
    padding: 8px;
    margin: 5px;
}

form button {
    background: #5cb85c;
    color: white;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
}
</style>