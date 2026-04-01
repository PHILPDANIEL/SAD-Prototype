<template>
  <div class="card">
    <h3>{{ product.name }}</h3>
    <p>₱ {{ product.price }}</p>
    <button @click="$emit('add', product)">Add to Cart</button>
  </div>
</template>

<script setup>
defineProps(["product"])
</script>