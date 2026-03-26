<template>
  <div class="page">
    <h1>Products</h1>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Price</th>
          <th>Stock</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="product in products" :key="product._id">
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>{{ product.price }}</td>
          <td :class="{ low: product.stock <= 10 }">
            {{ product.stock }}
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
      products: []
    }
  },

  async mounted() {
    try {
      const res = await axios.get("/api/products")
      this.products = res.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style>
.low {
  color: red;
  font-weight: bold;
}
</style>