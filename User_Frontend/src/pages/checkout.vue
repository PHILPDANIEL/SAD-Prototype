<template>
  <div class="checkout">

    <h1>Checkout</h1>

    <div v-if="cart.length === 0">
      Cart is empty
    </div>

    <div v-else>

      <div class="cart-item"
        v-for="item in cart"
        :key="item._id"
      >
        <span>{{ item.name }}</span>
        <span>Qty: {{ item.qty }}</span>
        <span>₱ {{ item.price * item.qty }}</span>
      </div>

      <h2>Total: ₱ {{ total }}</h2>

      <button @click="placeOrder">
        Place Order
      </button>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cart: []
    };
  },

  computed: {
    total() {
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }
  },

  mounted() {
    this.cart = JSON.parse(localStorage.getItem("cart")) || [];
  },

  methods: {
    async placeOrder() {
      const token = localStorage.getItem("token");

      try {
        await axios.post(
          "http://localhost:5001/api/order/create",
          {
            items: this.cart,
            total: this.total
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        localStorage.removeItem("cart");

        alert("Order placed successfully!");

        this.$router.push("/orders");

      } catch (err) {
        console.error("Order failed:", err);
      }
    }
  }
};
</script>

<style scoped>
.checkout {
  padding: 25px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

button {
  margin-top: 20px;
  padding: 10px;
  background: #6c5ce7;
  color: white;
  border: none;
}
</style>