<template>
  <div class="product-card">
    <h3>{{ product.name }}</h3>
    <p>Price: ₱{{ product.price }}</p>
    <p>Stock: {{ product.stock }}</p>
    <input type="number" v-model.number="quantity" min="1" :max="product.stock" />
    <button @click="addToCart">Add to Cart</button>
  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: {
    product: Object,
    cart: Array
  },
  data() {
    return {
      quantity: 1
    };
  },
  methods: {
    addToCart() {
      if (this.quantity > 0 && this.quantity <= this.product.stock) {
        const existing = this.cart.find(item => item.productId === this.product._id);
        if (existing) existing.quantity += this.quantity;
        else this.cart.push({ ...this.product, productId: this.product._id, quantity: this.quantity });
        this.quantity = 1;
        alert("Added to cart");
      }
    }
  }
};
</script>

<style scoped>
.product-card {
  border: 1px solid #ccc;
  padding: 10px;
  margin: 10px;
  border-radius: 8px;
  width: 200px;
}
.product-card h3 {
  margin: 0 0 5px 0;
}
.product-card input {
  width: 60px;
  margin-right: 5px;
}
</style>