<template>
  <div class="product-card" @click="$emit('open-modal', product)">

    <div class="card-img-wrap">
      <img v-if="product.image" :src="product.image" :alt="product.name" class="card-img" />
      <div v-else class="card-img-placeholder">🧋</div>

      <span v-if="product.category" class="card-badge">{{ product.category }}</span>
    </div>

    <div class="card-body">
      <h3 class="card-name">{{ product.name }}</h3>
      <p v-if="product.description" class="card-desc">{{ product.description }}</p>

      <div class="card-footer">
        <span class="card-price">₱{{ (product.price || 0).toFixed(2) }}</span>
        <button
          class="card-add-btn"
          aria-label="Add {{ product.name }} to cart"
          @click.stop="$emit('open-modal', product)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: "ProductCard",

  props: {
    product: { type: Object, required: true }
  },

  emits: ["open-modal"]
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.product-card {
  background: white;
  border: 1.5px solid #ede8e2;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
}

.product-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 28px rgba(45, 31, 14, 0.12);
  border-color: #d9cec4;
}

/* Image */
.card-img-wrap {
  position: relative;
  height: 150px;
  background: #f0ebe4;
  overflow: hidden;
  flex-shrink: 0;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .card-img {
  transform: scale(1.04);
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(45, 31, 14, 0.75);
  color: white;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 999px;
  font-family: 'Sora', sans-serif;
}

/* Body */
.card-body {
  padding: 14px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.card-name {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #2d1f0e;
  margin: 0;
  line-height: 1.2;
}

.card-desc {
  font-size: 12px;
  color: #8a7060;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
}

.card-price {
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #e85d04;
}

.card-add-btn {
  width: 32px;
  height: 32px;
  background: #2d1f0e;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  flex-shrink: 0;
}

.card-add-btn:hover { background: #3d2a12; }
.card-add-btn:active { transform: scale(0.92); }
</style>