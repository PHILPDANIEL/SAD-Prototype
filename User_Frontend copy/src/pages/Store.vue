<template>
  <div class="store-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Store</h1>
        <p class="page-sub">Browse products and place orders</p>
      </div>
      <div class="header-actions">
        <button class="cart-toggle-btn" @click="showCart = !showCart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
          </svg>
          Cart
          <span class="cart-count" v-if="cartTotal > 0">{{ cartItems.length }}</span>
        </button>
      </div>
    </div>

    <!-- Search & Category Filter -->
    <div class="filters-bar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search products…"
          class="search-input"
          @input="filterProducts"
        />
      </div>

      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat"
          class="cat-tab"
          :class="{ active: activeCategory === cat }"
          @click="setCategory(cat)"
        >{{ cat }}</button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area" :class="{ 'cart-open': showCart }">

      <!-- Products Grid -->
      <div class="products-section">
        <!-- Skeleton -->
        <div v-if="loading" class="products-grid">
          <div class="product-skeleton" v-for="n in 8" :key="n"></div>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <p>No products found.</p>
        </div>

        <!-- Grid -->
        <div v-else class="products-grid">
          <div
            v-for="(product, i) in filteredProducts"
            :key="product._id"
            class="product-card"
            :style="{ animationDelay: `${i * 40}ms` }"
            :class="{ 'out-of-stock': product.stock === 0 }"
          >
            <!-- Product Image / Icon -->
            <div class="product-image">
              <img v-if="product.image" :src="product.image" :alt="product.name" />
              <div v-else class="product-icon-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8h1a4 4 0 010 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <span class="stock-badge" :class="stockClass(product.stock)">
                {{ stockLabel(product.stock) }}
              </span>
            </div>

            <div class="product-info">
              <p class="product-category">{{ product.category || 'Uncategorized' }}</p>
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc" v-if="product.description">{{ product.description }}</p>
              <div class="product-footer">
                <span class="product-price">₱{{ (product.price || 0).toFixed(2) }}</span>
                <button
                  class="add-btn"
                  :disabled="product.stock === 0"
                  @click="addToCart(product)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Panel -->
      <transition name="cart-slide">
        <div class="cart-panel" v-if="showCart">
          <div class="cart-header">
            <h2 class="cart-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              Your Cart
            </h2>
            <button class="close-cart" @click="showCart = false">✕</button>
          </div>

          <!-- Cart Empty -->
          <div v-if="cartItems.length === 0" class="cart-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
            </svg>
            <p>Cart is empty</p>
          </div>

          <!-- Cart Items -->
          <div v-else class="cart-items">
            <div class="cart-item" v-for="item in cartItems" :key="item._id">
              <div class="cart-item-info">
                <p class="cart-item-name">{{ item.name }}</p>
                <p class="cart-item-price">₱{{ (item.price || 0).toFixed(2) }}</p>
              </div>
              <div class="cart-item-controls">
                <button class="qty-btn" @click="decreaseQty(item)">−</button>
                <span class="qty-value">{{ item.qty }}</span>
                <button class="qty-btn" @click="increaseQty(item)">+</button>
                <button class="remove-btn" @click="removeFromCart(item)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <p class="cart-item-subtotal">₱{{ (item.price * item.qty).toFixed(2) }}</p>
            </div>
          </div>

          <!-- Customer Name -->
          <div class="customer-input" v-if="cartItems.length > 0">
            <label class="input-label">Customer Name (optional)</label>
            <input
              v-model="customerName"
              type="text"
              placeholder="Walk-in customer"
              class="cust-input"
            />
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary" v-if="cartItems.length > 0">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₱{{ cartTotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>Total</span>
              <span class="total-price">₱{{ cartTotal.toFixed(2) }}</span>
            </div>
            <button
              class="checkout-btn"
              :disabled="placingOrder"
              @click="placeOrder"
            >
              {{ placingOrder ? 'Placing Order…' : 'Place Order' }}
            </button>
            <button class="clear-cart-btn" @click="clearCart">Clear Cart</button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Success Toast -->
    <transition name="toast-slide">
      <div class="toast" :class="toast.type" v-if="toast.show">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'StorePage',

  data() {
    return {
      products: [],
      filteredProducts: [],
      loading: true,
      search: '',
      activeCategory: 'All',
      categories: ['All'],

      // Cart
      cartItems: [],
      showCart: false,
      customerName: '',
      placingOrder: false,

      // Toast
      toast: { show: false, message: '', type: 'success' },
    }
  },

  computed: {
    cartTotal() {
      return this.cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
    },
  },

  async mounted() {
    await this.fetchProducts()
    this.loadCart()
  },

  methods: {
    token() {
      return localStorage.getItem('token')
    },

    async fetchProducts() {
      this.loading = true
      try {
        const res = await axios.get('/api/products', {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.products = res.data
        this.filteredProducts = [...this.products]

        // Build category list
        const cats = [...new Set(this.products.map(p => p.category).filter(Boolean))]
        this.categories = ['All', ...cats]
      } catch {
        this.showToast('Failed to load products.', 'error')
      } finally {
        this.loading = false
      }
    },

    filterProducts() {
      let list = [...this.products]
      if (this.activeCategory !== 'All') {
        list = list.filter(p => p.category === this.activeCategory)
      }
      if (this.search.trim()) {
        const q = this.search.toLowerCase()
        list = list.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        )
      }
      this.filteredProducts = list
    },

    setCategory(cat) {
      this.activeCategory = cat
      this.filterProducts()
    },

    // ── Cart ──
    addToCart(product) {
      const existing = this.cartItems.find(i => i._id === product._id)
      if (existing) {
        existing.qty++
      } else {
        this.cartItems.push({ ...product, qty: 1 })
      }
      this.showCart = true
      this.saveCart()
      this.showToast(`${product.name} added to cart!`, 'success')
    },

    increaseQty(item) {
      item.qty++
      this.saveCart()
    },

    decreaseQty(item) {
      if (item.qty <= 1) {
        this.removeFromCart(item)
      } else {
        item.qty--
        this.saveCart()
      }
    },

    removeFromCart(item) {
      this.cartItems = this.cartItems.filter(i => i._id !== item._id)
      this.saveCart()
    },

    clearCart() {
      this.cartItems = []
      this.customerName = ''
      this.saveCart()
    },

    saveCart() {
      localStorage.setItem('sayotea-cart', JSON.stringify(this.cartItems))
    },

    loadCart() {
      const saved = localStorage.getItem('sayotea-cart')
      if (saved) this.cartItems = JSON.parse(saved)
    },

    async placeOrder() {
      if (this.cartItems.length === 0) return
      this.placingOrder = true
      try {
        const payload = {
          customerName: this.customerName || 'Walk-in',
          items: this.cartItems.map(i => ({
            productId: i._id,
            name: i.name,
            quantity: i.qty,
            price: i.price,
          })),
          totalAmount: this.cartTotal,
          status: 'pending',
        }
        await axios.post('/api/orders', payload, {
          headers: { Authorization: `Bearer ${this.token()}` },
        })
        this.clearCart()
        this.showCart = false
        this.showToast('Order placed successfully! 🎉', 'success')
      } catch {
        this.showToast('Failed to place order.', 'error')
      } finally {
        this.placingOrder = false
      }
    },

    // ── Helpers ──
    stockClass(stock) {
      if (stock === 0) return 'out'
      if (stock <= 5) return 'low'
      return 'in'
    },

    stockLabel(stock) {
      if (stock === 0) return 'Out of Stock'
      if (stock <= 5) return `Only ${stock} left`
      return 'In Stock'
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3000)
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Epilogue:wght@400;500&display=swap');

* { box-sizing: border-box; }

.store-page {
  font-family: 'Epilogue', sans-serif;
  padding: 2rem 2.5rem;
  min-height: 100vh;
  background: #f7f5f0;
  color: #1a1a1a;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}
.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: #1a1a2e;
}
.page-sub { margin: 0; font-size: 0.875rem; color: #999; }

.cart-toggle-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0.6rem 1.2rem;
  background: #1a1a2e;
  color: #fff;
  border: none;
  border-radius: 11px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: background 0.2s, transform 0.15s;
}
.cart-toggle-btn:hover { background: #0f3460; transform: translateY(-1px); }
.cart-toggle-btn svg { width: 17px; height: 17px; }

.cart-count {
  background: #e9a84c;
  color: #1a1a2e;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 20px;
  padding: 1px 6px;
}

/* ── Filters ── */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}
.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: #aaa;
}
.search-input {
  width: 100%;
  padding: 0.6rem 1rem 0.6rem 2.1rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  background: #fff;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus { border-color: #0f3460; }
.search-input::placeholder { color: #ccc; }

.category-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cat-tab {
  padding: 6px 14px;
  border: 1.5px solid #e8e8e8;
  border-radius: 20px;
  background: #fff;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #777;
  cursor: pointer;
  transition: all 0.15s;
}
.cat-tab:hover { border-color: #ccc; color: #333; }
.cat-tab.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

/* ── Content Area ── */
.content-area {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.products-section { flex: 1; min-width: 0; }

/* ── Products Grid ── */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 1.1rem;
}

/* Skeleton */
.product-skeleton {
  height: 280px;
  border-radius: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Product Card */
.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  animation: cardIn 0.35s ease both;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.1);
}
.product-card.out-of-stock { opacity: 0.6; }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.product-image {
  height: 150px;
  background: linear-gradient(135deg, #f0ede6, #e8e4db);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-icon-placeholder {
  color: #c8c0b0;
  opacity: 0.6;
}
.product-icon-placeholder svg { width: 48px; height: 48px; }

.stock-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 0.67rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 20px;
}
.stock-badge.in  { background: #e8faf0; color: #16a34a; }
.stock-badge.low { background: #fdf3e1; color: #c47f0a; }
.stock-badge.out { background: #fde8e8; color: #dc2626; }

.product-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.product-category {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #e9a84c;
  font-weight: 600;
  margin: 0 0 4px;
}
.product-name {
  font-family: 'Sora', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 4px;
  line-height: 1.3;
}
.product-desc {
  font-size: 0.78rem;
  color: #aaa;
  margin: 0 0 auto;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.85rem;
}
.product-price {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a2e;
}
.add-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #1a1a2e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
  flex-shrink: 0;
}
.add-btn:hover:not(:disabled) { background: #e9a84c; }
.add-btn:active:not(:disabled) { transform: scale(0.9); }
.add-btn:disabled { background: #ddd; cursor: default; }
.add-btn svg { width: 16px; height: 16px; }

/* Empty */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #ccc;
}
.empty-state svg { width: 52px; height: 52px; margin-bottom: 1rem; opacity: 0.3; }
.empty-state p { font-size: 0.9rem; color: #bbb; }

/* ── Cart Panel ── */
.cart-panel {
  width: 320px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 160px);
  position: sticky;
  top: 1.5rem;
  overflow: hidden;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.25rem 0.75rem;
  border-bottom: 1px solid #f3f3f3;
}
.cart-title {
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
}
.cart-title svg { width: 17px; height: 17px; }

.close-cart {
  background: #f3f3f3;
  border: none;
  border-radius: 50%;
  width: 28px; height: 28px;
  font-size: 0.78rem;
  cursor: pointer;
  color: #888;
  transition: background 0.15s;
}
.close-cart:hover { background: #e8e8e8; }

.cart-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #ccc;
}
.cart-empty svg { width: 44px; height: 44px; margin-bottom: 0.75rem; opacity: 0.3; }
.cart-empty p { font-size: 0.85rem; }

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: 4px 8px;
  padding: 0.75rem;
  background: #fafaf8;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}
.cart-item-info { grid-column: 1; }
.cart-item-name { font-size: 0.83rem; font-weight: 500; color: #1a1a2e; margin: 0 0 2px; }
.cart-item-price { font-size: 0.75rem; color: #aaa; margin: 0; }
.cart-item-controls {
  grid-column: 2;
  grid-row: 1 / 3;
  display: flex;
  align-items: center;
  gap: 5px;
}
.qty-btn {
  width: 24px; height: 24px;
  border: 1.5px solid #e8e8e8;
  border-radius: 6px;
  background: #fff;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #555;
  transition: all 0.15s;
}
.qty-btn:hover { border-color: #1a1a2e; color: #1a1a2e; }
.qty-value {
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #1a1a2e;
  min-width: 18px;
  text-align: center;
}
.remove-btn {
  width: 22px; height: 22px;
  border: none;
  border-radius: 6px;
  background: #fde8e8;
  color: #dc2626;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.remove-btn:hover { background: #fcc; }
.remove-btn svg { width: 12px; height: 12px; }
.cart-item-subtotal {
  grid-column: 1;
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f3460;
  margin: 0;
}

/* Customer Input */
.customer-input {
  padding: 0.75rem 1.1rem 0;
}
.input-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #aaa;
  display: block;
  margin-bottom: 5px;
}
.cust-input {
  width: 100%;
  padding: 0.55rem 0.8rem;
  border: 1.5px solid #e8e8e8;
  border-radius: 9px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}
.cust-input:focus { border-color: #0f3460; }
.cust-input::placeholder { color: #ccc; }

/* Cart Summary */
.cart-summary {
  padding: 1rem 1.1rem 1.25rem;
  border-top: 1px solid #f3f3f3;
  margin-top: 0.75rem;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 6px;
}
.total-row { font-weight: 600; color: #1a1a2e; margin-bottom: 1rem; }
.total-price {
  font-family: 'Sora', sans-serif;
  font-size: 1.1rem;
  color: #1a1a2e;
}
.checkout-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #1a1a2e, #0f3460);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 8px;
  transition: opacity 0.2s, transform 0.15s;
}
.checkout-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.checkout-btn:disabled { opacity: 0.5; cursor: default; }

.clear-cart-btn {
  width: 100%;
  padding: 0.6rem;
  background: transparent;
  color: #aaa;
  border: 1.5px solid #e8e8e8;
  border-radius: 10px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.83rem;
  cursor: pointer;
  transition: all 0.15s;
}
.clear-cart-btn:hover { border-color: #dc2626; color: #dc2626; }

/* Cart slide transition */
.cart-slide-enter-active, .cart-slide-leave-active {
  transition: all 0.3s ease;
}
.cart-slide-enter-from, .cart-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Toast */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-family: 'Epilogue', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 2000;
  white-space: nowrap;
}
.toast.success { background: #1a1a2e; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .content-area { flex-direction: column; }
  .cart-panel {
    width: 100%;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    border-radius: 20px 20px 0 0;
    max-height: 75vh;
    z-index: 300;
    box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
  }
}
@media (max-width: 600px) {
  .store-page { padding: 1.25rem 1rem; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
</style>