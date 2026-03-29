<template>
  <div class="page">
    <h1>Inventory</h1>

    <h3>Restock Product</h3>

    <select v-model="selectedProduct">
      <option disabled value="">Select Product</option>
      <option v-for="p in products" :key="p._id" :value="p._id">
        {{ p.name }}
      </option>
    </select>

    <input v-model.number="quantity" type="number" placeholder="Quantity to add">

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
        <td>{{ formatDate(log.date) }}</td>
      </tr>
    </table>

  </div>
</template>

<script>
import axios from "axios"

export default {
  data() {
    return {
      products: [],
      logs: [],
      selectedProduct: "",
      quantity: null
    }
  },

  async mounted() {
    await this.loadProducts()
    await this.loadLogs()
  },

  methods: {
    async loadProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/products")
        this.products = res.data
      } catch (err) {
        console.error("Error loading products:", err)
      }
    },

    async loadLogs() {
      try {
        const res = await axios.get("http://localhost:5000/api/inventory")
        this.logs = res.data
      } catch (err) {
        console.error("Error loading inventory logs:", err)
      }
    },

    formatDate(dateStr) {
      const d = new Date(dateStr)
      return d.toLocaleString()
    },

    async restock() {
      if (!this.selectedProduct || !this.quantity || this.quantity <= 0) {
        alert("Please select a product and enter a valid quantity")
        return
      }

      try {
        // Send restock request
        const res = await axios.post("http://localhost:5000/api/inventory", {
          productId: this.selectedProduct,
          quantity: this.quantity
        })

        // Update product stock locally
        const product = this.products.find(p => p._id === this.selectedProduct)
        if (product) product.stock += this.quantity

        // Add the new log entry to the table
        this.logs.push({
          _id: res.data._id,
          productName: product.name,
          quantity: this.quantity,
          date: res.data.date
        })

        // Reset form
        this.selectedProduct = ""
        this.quantity = null

        alert("Stock updated successfully")
      } catch (err) {
        console.error("Error updating stock:", err)
        alert("Failed to update stock")
      }
    }
  }
}
</script>

<style>
.page {
  padding: 20px;
}

select, input {
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 5px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background: #f4f4f4;
}

button {
  cursor: pointer;
  padding: 5px 10px;
}
</style>