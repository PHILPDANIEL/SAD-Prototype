<template>
<div class="page">
<h1>Orders</h1>

<h3>Create Order</h3>

<input v-model="newOrder.order_number" placeholder="Order Number">
<input v-model="newOrder.total_amount" placeholder="Total Amount">
<input v-model="newOrder.payment_method" placeholder="Payment Method">

<button @click="addOrder">Add Order</button>

<h3>Orders List</h3>

<table>
<tr>
<th>Order #</th>
<th>Total</th>
<th>Payment</th>
<th>Action</th>
</tr>

<tr v-for="o in orders" :key="o._id">
<td>{{ o.order_number }}</td>
<td>{{ o.total_amount }}</td>
<td>{{ o.payment_method }}</td>

<td>
<button @click="deleteOrder(o._id)">Delete</button>
</td>

</tr>
</table>

</div>
</template>

<script>
import axios from "axios"

export default {
data(){
return{
orders:[],
newOrder:{
order_number:"",
total_amount:0,
payment_method:""
}
}
},

async mounted(){
const res = await axios.get("/api/orders")
this.orders = res.data
},

methods:{
async addOrder(){
const res = await axios.post("/api/orders", this.newOrder)
this.orders.push(res.data)

this.newOrder = {
order_number:"",
total_amount:0,
payment_method:""
}
},

async deleteOrder(id){
await axios.delete(`/api/orders/${id}`)
this.orders = this.orders.filter(o => o._id !== id)
}
}
}
</script>

<style>
table{
width:100%;
border-collapse: collapse;
}

th, td{
border:1px solid #ddd;
padding:8px;
}

th{
background:#f4f4f4;
}
</style>