<template>
<div class="page">
<h1>Inventory</h1>

<h3>Restock Product</h3>

<select v-model="selectedProduct">
<option v-for="p in products" :value="p._id">
{{ p.name }}
</option>
</select>

<input v-model="quantity" placeholder="Quantity">

<button @click="restock">Add Stock</button>

<h3>Inventory Logs</h3>

<table>
<tr>
<th>Product</th>
<th>Quantity Added</th>
<th>Date</th>
</tr>

<tr v-for="log in logs" :key="log._id">
<td>{{ log.productName }}</td>
<td>{{ log.quantity }}</td>
<td>{{ log.date }}</td>
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
logs:[],
selectedProduct:null,
quantity:0
}
},

async mounted(){
const p=await axios.get("/api/products")
const l=await axios.get("/api/inventory")

this.products=p.data
this.logs=l.data
},

methods:{
async restock(){
await axios.post("/api/inventory",{
productId:this.selectedProduct,
quantity:this.quantity
})
alert("Stock updated")
}
}
}
</script>