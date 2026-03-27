<template>
<div class="page">
<h1>Products</h1>

<h3>Add Product</h3>

<input v-model="newProduct.name" placeholder="Name">
<input v-model="newProduct.price" placeholder="Price">
<input v-model="newProduct.stock" placeholder="Stock">

<button @click="addProduct">Add</button>

<h3>Product List</h3>

<table>
<tr>
<th>Name</th>
<th>Price</th>
<th>Stock</th>
<th>Action</th>
</tr>

<tr v-for="p in products" :key="p._id">
<td>{{ p.name }}</td>
<td>{{ p.price }}</td>
<td :class="{low:p.stock<=10}">
{{ p.stock }}
</td>

<td>
<button @click="deleteProduct(p._id)">Delete</button>
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
products:[],
newProduct:{
name:"",
price:0,
stock:0
}
}
},

async mounted(){
const res = await axios.get("/api/products")
this.products=res.data
},

methods:{
async addProduct(){
const res=await axios.post("/api/products",this.newProduct)
this.products.push(res.data)
},

async deleteProduct(id){
await axios.delete(`/api/products/${id}`)
this.products=this.products.filter(p=>p._id!==id)
}
}
}
</script>

<style>
.low{
color:red;
font-weight:bold;
}
</style>