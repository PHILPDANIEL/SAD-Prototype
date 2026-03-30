<template>
  <div class="page">
    <h1>Products</h1>

    <h3>Add Product</h3>
    <input v-model="newProduct.name" placeholder="Product Name">
    <input v-model="newProduct.category" placeholder="Category">
    <input v-model.number="newProduct.price" type="number" placeholder="Price">
    <input v-model.number="newProduct.stock" type="number" placeholder="Stock">
    <button @click="addProduct">Add Product</button>

    <h3>Product List</h3>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="p in products" :key="p._id">
          <td>{{ p.name || "No name" }}</td>
          <td>{{ p.category || "-" }}</td>
          <td>₱ {{ p.price != null ? p.price : "-" }}</td>
          <td :class="{ low: p.stock != null && p.stock <= 10 }">
            {{ p.stock != null ? p.stock : 0 }}
          </td>
          <td>
            <button @click="deleteProduct(p._id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      products: [],
      newProduct: {
        name: "",
        category: "",
        price: null,
        stock: null
      }
    }
  },

  async mounted() {
    this.loadProducts()
  },

  methods: {
    async loadProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/products")
        this.products = res.data
        console.log("Products loaded:", res.data)
      } catch (err) {
        console.error("Failed to load products:", err)
        alert("Failed to load products. Check if your backend is running on port 5000.")
      }
    },

    async addProduct() {
      if (!this.newProduct.name || this.newProduct.price == null || this.newProduct.stock == null) {
        alert("Please fill all required fields: Name, Price, Stock")
        return
      }

      try {
        // Make a shallow copy to avoid sending any unwanted properties
        const productToSend = { ...this.newProduct }
        const res = await axios.post("http://localhost:5000/api/products", productToSend)
        this.products.unshift(res.data)
        this.newProduct = { name: "", category: "", price: null, stock: null }
      } catch (err) {
        console.error("Failed to add product:", err)
        alert("Failed to add product. Make sure backend is running and MongoDB is connected.")
      }
    },

    async deleteProduct(_id) {
      if (!confirm("Delete this product?")) return
      try {
        await axios.delete(`http://localhost:5000/api/products/${_id}`)
        this.products = this.products.filter(p => p._id !== _id)
      } catch (err) {
        console.error("Failed to delete product:", err)
        alert("Failed to delete product. Make sure backend is running and MongoDB is connected.")
      }
    }
  }
}
</script>

<style>
.page { padding: 20px; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background: #f4f4f4; }
button { cursor: pointer; padding: 5px 10px; }
.low { color: red; font-weight: bold; }
</style>