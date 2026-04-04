<template>
  <div class="checkout">

    <h1>Checkout</h1>

    <!-- Empty Cart -->
    <div v-if="!cart || cart.length === 0" class="empty">
      Cart is empty
    </div>

    <!-- Cart Items -->
    <div 
      v-for="item in cart || []" 
      :key="item._id" 
      class="cart-item"
    >
      <span>{{ item.name }}</span>
      <span>Qty: {{ item.qty }}</span>
      <span>₱ {{ item.price * item.qty }}</span>
    </div>

    <!-- Total -->
    <h2>Total: ₱ {{ total }}</h2>

    <!-- Button -->
    <button 
      @click="placeOrder"
      :disabled="!cart || cart.length === 0"
    >
      Place Order
    </button>

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
      if (!this.cart) return 0;

      return this.cart.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      );
    }
  },

  mounted() {
    const storedCart = localStorage.getItem("cart");

    if (storedCart) {
      this.cart = JSON.parse(storedCart);
    } else {
      this.cart = [];
    }
  },

  methods: {
    async placeOrder() {
      if (!this.cart || this.cart.length === 0) {
        return alert("Cart is empty!");
      }

      const token = localStorage.getItem("token");

      if (!token) {
        return alert("Please login first!");
      }

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
        this.cart = [];

        alert("Order placed successfully!");
        this.$router.push("/orders");

      } catch (err) {
        console.error("Order failed:", err.response || err);
        alert(err.response?.data?.message || "Order failed");
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

button:disabled {
  background: gray;
  cursor: not-allowed;
}

.empty {
  color: gray;
  margin-bottom: 15px;
}
</style>