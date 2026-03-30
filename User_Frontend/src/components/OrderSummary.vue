<template>
  <div class="order-summary">
    <h3>Cart Summary</h3>
    <div v-if="cart.length === 0">Cart is empty</div>
    <div v-else>
      <div v-for="item in cart" :key="item.productId" class="cart-item">
        <span>{{ item.name }} x {{ item.quantity }}</span>
        <span>₱{{ item.price * item.quantity }}</span>
      </div>
      <hr>
      <h4>Total: ₱{{ total }}</h4>
      <button @click="$emit('checkout')">Place Order</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderSummary",
  props: ["cart"],
  computed: {
    total() {
      return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  }
};
</script>

<style scoped>
.order-summary {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  width: 250px;
}
.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
button {
  margin-top: 10px;
  padding: 5px 10px;
}
</style>