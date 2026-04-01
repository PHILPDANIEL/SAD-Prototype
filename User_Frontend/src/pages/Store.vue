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

    <!-- Floating Checkout Button -->
    <router-link to="/checkout" class="checkout-btn">
      Go to Checkout
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
      loading: true
    };
  },
  async mounted() {
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

      if (existing) existing.qty++;
      else cart.push({ ...product, qty: 1 });

      localStorage.setItem("cart", JSON.stringify(cart));
      alert("Added to cart!");
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

/* Floating Checkout Button */
.checkout-btn {
  position: fixed;
  bottom: 25px;
  right: 25px;
  display: inline-block;
  padding: 12px 20px;
  background: #00b894;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  transition: background 0.2s;
}

.checkout-btn:hover {
  background: #019775;
}
</style>