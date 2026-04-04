<template>
  <div class="store">

    <h1 class="page-title">Store</h1>
    <p class="subtitle">Choose your favorite drinks</p>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      Loading products...
    </div>

    <!-- Product Grid -->
    <div v-else class="product-grid">
      <ProductCard
        v-for="product in products"
        :key="product._id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </div>

    <!-- Floating Cart Button -->
    <router-link to="/checkout" class="cart-btn">
      🛒
      <span v-if="cartCount > 0" class="cart-badge">
        {{ cartCount }}
      </span>
    </router-link>

  </div>
</template>

<script>
import axios from "axios";
import ProductCard from "../components/ProductCard.vue";

export default {
  name: "StorePage",
  components: { ProductCard },

  data() {
    return {
      products: [],
      loading: true,
      cartCount: 0
    };
  },

  async mounted() {
    this.loadCartCount();

    try {
      const res = await axios.get("http://localhost:5001/api/product");
      this.products = res.data;
      this.loading = false;
    } catch (error) {
      console.error("Failed to load products:", error);
    }
  },

  methods: {
    addToCart(product) {
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existing = cart.find(item => item._id === product._id);

      if (existing) {
        existing.qty++;
      } else {
        cart.push({
          ...product,
          qty: 1
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      this.loadCartCount(); // update badge
      alert("Added to cart!");
    },

    loadCartCount() {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      this.cartCount = cart.reduce((total, item) => total + item.qty, 0);
    }
  }
};
</script>

<style scoped>
.store {
  padding: 25px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 5px;
}

.subtitle {
  color: gray;
  margin-bottom: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.loading {
  font-size: 18px;
}

/* Floating Cart Button */
.cart-btn {
  position: fixed;
  bottom: 25px;
  right: 25px;
  background: #6c5ce7;
  color: white;
  font-size: 24px;
  padding: 15px;
  border-radius: 50%;
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

/* Cart Badge */
.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: red;
  color: white;
  font-size: 12px;
  padding: 4px 7px;
  border-radius: 50%;
}
</style>