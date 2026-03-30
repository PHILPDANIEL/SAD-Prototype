<template>
  <div class="main">
    <h1>Store</h1>

    <div class="store-container">
      <div class="product-grid">
        <ProductCard
          v-for="product in products"
          :key="product._id"
          :product="product"
          @add-to-cart="addToCart"
        />
      </div>

      <div class="cart-summary card">
        <h2>Order Summary</h2>
        <OrderSummary
          :cart="cart"
          @remove-item="removeFromCart"
          @place-order="placeOrder"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ProductCard from "../components/ProductCard.vue";
import OrderSummary from "../components/OrderSummary.vue";
import axios from "axios";

export default {
  components: { ProductCard, OrderSummary },
  data() {
    return {
      products: [],
      cart: []
    };
  },
  mounted() {
    axios.get("http://localhost:5001/api/products")
      .then(res => this.products = res.data)
      .catch(err => console.error(err));
  },
  methods: {
    addToCart(product) {
      const existing = this.cart.find(p => p._id === product._id);
      if (existing) existing.quantity++;
      else this.cart.push({ ...product, quantity: 1 });
    },
    removeFromCart(id) {
      this.cart = this.cart.filter(p => p._id !== id);
    },
    placeOrder() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.addresses || user.addresses.length === 0) {
        alert("Please add your delivery address in Profile first.");
        this.$router.push('/profile');
        return;
      }

      const order = {
        customerName: user.username,
        products: this.cart.map(p => ({
          productId: p._id,
          name: p.name,
          price: p.price,
          quantity: p.quantity
        }))
      };

      axios.post("http://localhost:5001/api/orders", order)
        .then(res => {
          alert("Order placed successfully! Your receipt will appear.");
          this.cart = [];
        })
        .catch(err => console.error(err));
    }
  }
};
</script>

<style scoped>
.store-container {
  display: flex;
  gap: 20px;
}

.product-grid {
  flex: 3;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.cart-summary {
  flex: 1;
  min-width: 250px;
}
</style>