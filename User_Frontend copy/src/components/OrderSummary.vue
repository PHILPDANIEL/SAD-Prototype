<template>
  <div class="cart">
    <h2>Cart</h2>

    <div v-for="item in cart" :key="item.id">
      {{ item.name }} x {{ item.quantity }}
    </div>

    <button @click="checkout">Checkout</button>
  </div>
</template>

<script setup>
defineProps(["cart", "checkout"])
</script>