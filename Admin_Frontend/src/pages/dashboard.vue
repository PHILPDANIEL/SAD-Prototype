<template>
<div class="page">
<h1>Dashboard</h1>

<div class="cards">
<div class="card">
<h3>Total Orders</h3>
<p>{{ orders }}</p>
</div>

<div class="card">
<h3>Total Sales</h3>
<p>₱ {{ sales }}</p>
</div>

<div class="card">
<h3>Products</h3>
<p>{{ products }}</p>
</div>

<div class="card alert" v-if="lowStock.length">
<h3>Low Stock</h3>
<p>{{ lowStock.length }} items</p>
</div>
</div>

<h3>Recent Orders</h3>
<table>
<tr>
<th>Customer</th>
<th>Total</th>
<th>Status</th>
</tr>
<tr v-for="o in recentOrders" :key="o._id">
<td>{{ o.customer }}</td>
<td>{{ o.total }}</td>
<td>{{ o.status }}</td>
</tr>
</table>

</div>
</template>

<script>
import axios from "axios"

export default {
data() {
return {
orders: 0,
sales: 0,
products: 0,
lowStock: [],
recentOrders: []
}
},

async mounted() {
const orders = await axios.get("/api/orders")
const products = await axios.get("/api/products")

this.orders = orders.data.length
this.sales = orders.data.reduce((sum, o) => sum + o.total, 0)
this.products = products.data.length
this.lowStock = products.data.filter(p => p.stock <= 10)
this.recentOrders = orders.data.slice(0,5)
}
}
</script>