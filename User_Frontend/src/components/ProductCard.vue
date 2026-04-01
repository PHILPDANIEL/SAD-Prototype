<template>
  <div class="card">

    <img
      v-if="product.image"
      :src="product.image"
      class="product-img"
    />

    <div class="card-body">
      <h3>{{ product.name }}</h3>
      <p class="category">{{ product.category }}</p>
      <p class="price">₱ {{ product.price }}</p>

      <button @click="addToCart">
        Add to Order
      </button>
    </div>

  </div>
</template>

<script>
export default {
  name: "ProductCard",
  props: ["product"],

  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.product);
    }
  }
};
</script>

<style scoped>
.card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}

.product-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.card-body {
  padding: 15px;
}

.category {
  color: gray;
  font-size: 13px;
}

.price {
  font-weight: bold;
  margin: 10px 0;
}

button {
  width: 100%;
  padding: 10px;
  border: none;
  background: #6c5ce7;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #5a4bd8;
}
</style>