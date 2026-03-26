<template>
  <div class="page">
    <h1>Inventory</h1>

    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Stock In</th>
          <th>Stock Out</th>
          <th>Remaining</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in inventory" :key="item._id">
          <td>{{ item.productName }}</td>
          <td>{{ item.stockIn }}</td>
          <td>{{ item.stockOut }}</td>
          <td>{{ item.remainingStock }}</td>
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
      inventory: []
    }
  },

  async mounted() {
    try {
      const res = await axios.get("/api/inventory")
      this.inventory = res.data
    } catch (err) {
      console.error(err)
    }
  }
}
</script>