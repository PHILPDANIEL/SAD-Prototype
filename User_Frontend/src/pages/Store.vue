<template>
  <div class="store">
    <div class="store-header">
      <div>
        <h1 class="page-title">☕ SayoTea</h1>
        <p class="subtitle">What are you craving today?</p>
      </div>

      <div class="category-tabs">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['tab-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search drinks..."
        class="search-input"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading menu...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <p>😔 No drinks found. Try another search!</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="product-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product._id"
        :product="product"
        @open-modal="openModal"
      />
    </div>

    <!-- Floating Cart Button -->
    <button class="cart-btn" @click="openCart" aria-label="Open cart">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19a2 2 0 001.99-1.61L23 6H6"/>
      </svg>
      <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
    </button>

    <!-- Cart Side Drawer -->
    <transition name="slide">
      <div v-if="cartOpen" class="cart-overlay" @click.self="closeCart">
        <div class="cart-drawer">
          <div class="cart-header">
            <h2>Your Order</h2>
            <button class="close-btn" @click="closeCart" aria-label="Close cart">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div v-if="cart.length === 0" class="cart-empty">
            <span class="cart-empty-icon">🍵</span>
            <p>Your cart is empty</p>
            <p class="cart-empty-sub">Add some drinks to get started</p>
          </div>

          <div v-else class="cart-items">
            <div v-for="(item, index) in cart" :key="index" class="cart-item">
              <img v-if="item.image" :src="item.image" class="cart-item-img" :alt="item.name" />
              <div v-else class="cart-item-img placeholder">🧋</div>

              <div class="cart-item-info">
                <p class="cart-item-name">{{ item.name }}</p>
                <p v-if="item.addons && item.addons.length" class="cart-item-addons">
                  + {{ item.addons.map(a => a.name).join(', ') }}
                </p>
                <p v-if="item.notes" class="cart-item-notes">{{ item.notes }}</p>
                <p class="cart-item-price">₱{{ itemTotal(item).toFixed(2) }}</p>
              </div>

              <div class="cart-item-controls">
                <button class="qty-btn" @click="decreaseQty(index)" aria-label="Decrease quantity">−</button>
                <span class="qty-num">{{ item.qty }}</span>
                <button class="qty-btn" @click="increaseQty(index)" aria-label="Increase quantity">+</button>
                <button class="remove-btn" @click="removeItem(index)" aria-label="Remove item">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Order Notes -->
          <div v-if="cart.length > 0" class="order-notes">
            <label>Order notes</label>
            <textarea
              v-model="orderNotes"
              placeholder="Any special instructions for the whole order?"
              rows="2"
            ></textarea>
          </div>

          <!-- Cart Summary -->
          <div v-if="cart.length > 0" class="cart-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>₱{{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>₱{{ subtotal.toFixed(2) }}</span>
            </div>

            <div class="cart-actions">
              <button class="btn-clear" @click="clearCart">Clear all</button>
              <router-link to="/checkout" class="btn-checkout" @click.native="closeCart">
                Checkout →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Add-to-cart Modal -->
    <AddToCartModal
      :product="modalProduct"
      :addons="addons"
      @close="closeModal"
      @confirm="handleModalConfirm"
    />

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast" role="status">{{ toast }}</div>
    </transition>
  </div>
</template>

<script>
import axios from "axios";
import ProductCard from "../components/ProductCard.vue";
import AddToCartModal from "../components/AddToCartModal.vue";

export default {
  name: "StorePage",
  components: { ProductCard, AddToCartModal },

  data() {
    return {
      products: [],
      addons: [],
      loading: true,
      cartOpen: false,
      cart: [],
      searchQuery: "",
      selectedCategory: "All",
      orderNotes: "",
      toast: null,
      toastTimer: null,
      modalProduct: null
    };
  },

  computed: {
    categories() {
      return ["All", ...new Set(this.products.map(p => p.category).filter(Boolean))];
    },

    filteredProducts() {
      return this.products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesCategory = this.selectedCategory === "All" || p.category === this.selectedCategory;
        return matchesSearch && matchesCategory;
      });
    },

    cartCount() {
      return this.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    subtotal() {
      return this.cart.reduce((sum, item) => sum + this.itemTotal(item), 0);
    }
  },

  async mounted() {
    this.loadCart();
    await Promise.all([this.fetchProducts(), this.fetchAddons()]);
  },

  methods: {
    /* ── Modal ── */
    openModal(product) {
      this.modalProduct = product;
    },

    closeModal() {
      this.modalProduct = null;
    },

    handleModalConfirm({ product, addons, notes, qty }) {
      const addonIds = (addons || []).map(a => a._id).sort().join(",");
      const existing = this.cart.find(item => {
        const itemAddonIds = (item.addons || []).map(a => a._id).sort().join(",");
        return item._id === product._id && itemAddonIds === addonIds && item.notes === notes;
      });

      if (existing) {
        existing.qty += qty;
      } else {
        this.cart.push({ ...product, addons: addons || [], notes: notes || "", qty });
      }

      this.saveCart();
      this.closeModal();
      this.showToast(`${product.name} added to order`);
    },

    /* ── API ── */
    async fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5001/api/product");
        this.products = res.data;
      } catch {
        this.showToast("Failed to load menu");
      } finally {
        this.loading = false;
      }
    },

    async fetchAddons() {
      try {
        const res = await axios.get("http://localhost:5001/api/addons");
        this.addons = res.data;
      } catch (err) {
        console.error("Failed to load addons:", err);
      }
    },

    /* ── Cart ── */
    increaseQty(index) {
      this.cart[index].qty++;
      this.saveCart();
    },

    decreaseQty(index) {
      if (this.cart[index].qty > 1) {
        this.cart[index].qty--;
        this.saveCart();
      } else {
        this.removeItem(index);
      }
    },

    removeItem(index) {
      const name = this.cart[index].name;
      this.cart.splice(index, 1);
      this.saveCart();
      this.showToast(`${name} removed`);
    },

    clearCart() {
      if (confirm("Clear all items from cart?")) {
        this.cart = [];
        this.saveCart();
        this.showToast("Cart cleared");
      }
    },

    itemTotal(item) {
      const addonTotal = (item.addons || []).reduce((s, a) => s + (a.price || 0), 0);
      return (item.price + addonTotal) * item.qty;
    },

    saveCart() {
      localStorage.setItem("cart", JSON.stringify(this.cart));
      if (this.orderNotes) localStorage.setItem("orderNotes", this.orderNotes);
    },

    loadCart() {
      try {
        this.cart = JSON.parse(localStorage.getItem("cart")) || [];
        this.orderNotes = localStorage.getItem("orderNotes") || "";
      } catch {
        this.cart = [];
      }
    },

    openCart()  { this.cartOpen = true; },
    closeCart() { this.cartOpen = false; },

    showToast(msg) {
      this.toast = msg;
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast = null; }, 2500);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.store {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'DM Sans', sans-serif;
  min-height: 100vh;
  background: #f8f5f0;
}

/* Header */
.store-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.page-title {
  font-family: 'Sora', sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: #2d1f0e;
  margin: 0 0 4px;
}

.subtitle {
  color: #8a7060;
  margin: 0;
  font-size: 14px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: 1.5px solid #d9cec4;
  background: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  cursor: pointer;
  color: #6b5c4e;
  transition: all 0.2s;
}

.tab-btn.active {
  background: #2d1f0e;
  border-color: #2d1f0e;
  color: white;
}

/* Search */
.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1.5px solid #e2d9d0;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 20px;
  gap: 10px;
}

.search-icon { color: #b09880; flex-shrink: 0; }

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  background: transparent;
  color: #2d1f0e;
}

.search-input::placeholder { color: #c0b0a0; }

/* Loading */
.loading {
  text-align: center;
  padding: 60px;
  color: #8a7060;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2d9d0;
  border-top-color: #2d1f0e;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  text-align: center;
  padding: 60px;
  color: #8a7060;
  font-size: 16px;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

/* Floating Cart */
.cart-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: #2d1f0e;
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(45,31,14,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.2s;
}

.cart-btn:hover { transform: scale(1.08); }

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #e85d04;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 6px;
  border-radius: 999px;
  font-family: 'Sora', sans-serif;
  min-width: 20px;
  text-align: center;
}

/* Cart Overlay */
.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}

.cart-drawer {
  background: #faf8f5;
  width: 380px;
  max-width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 30px rgba(0,0,0,0.15);
  overflow-y: auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 16px;
  border-bottom: 1.5px solid #e8e0d8;
  background: #2d1f0e;
  color: white;
  flex-shrink: 0;
}

.cart-header h2 {
  margin: 0;
  font-family: 'Sora', sans-serif;
  font-size: 18px;
}

.close-btn {
  background: rgba(255,255,255,0.15);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.close-btn:hover { background: rgba(255,255,255,0.25); }

/* Cart Empty */
.cart-empty {
  text-align: center;
  padding: 60px 20px;
  color: #8a7060;
}

.cart-empty-icon { font-size: 36px; display: block; margin-bottom: 12px; }
.cart-empty p { margin: 0 0 4px; font-size: 15px; font-weight: 500; color: #5a4535; }
.cart-empty-sub { font-size: 13px !important; color: #8a7060 !important; font-weight: 400 !important; }

/* Cart Items */
.cart-items {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1.5px solid #ede8e2;
}

.cart-item-img {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.cart-item-img.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f0ebe4;
}

.cart-item-info {
  flex: 1;
  min-width: 0;
}

.cart-item-name {
  font-weight: 600;
  font-size: 14px;
  color: #2d1f0e;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-addons {
  font-size: 11px;
  color: #8a7060;
  margin: 0 0 2px;
}

.cart-item-notes {
  font-size: 11px;
  color: #a08060;
  margin: 0 0 2px;
  font-style: italic;
}

.cart-item-price {
  font-size: 13px;
  font-weight: 700;
  color: #e85d04;
  margin: 0;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.qty-btn {
  background: #f0ebe4;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  color: #2d1f0e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  transition: background 0.12s;
  line-height: 1;
}

.qty-btn:hover { background: #e2d9ce; }

.qty-num {
  font-size: 14px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
  color: #2d1f0e;
}

.remove-btn {
  background: #fff0ee;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0392b;
  margin-left: 2px;
  transition: background 0.12s;
}

.remove-btn:hover { background: #ffd9d3; }

/* Order Notes */
.order-notes {
  padding: 12px 16px;
  border-top: 1.5px solid #e8e0d8;
}

.order-notes label {
  font-size: 12px;
  font-weight: 600;
  color: #6b5c4e;
  display: block;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.order-notes textarea {
  width: 100%;
  border: 1.5px solid #e2d9d0;
  border-radius: 8px;
  padding: 8px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  resize: none;
  color: #2d1f0e;
  background: white;
  outline: none;
  transition: border-color 0.15s;
}

.order-notes textarea:focus { border-color: #2d1f0e; }

/* Cart Summary */
.cart-summary {
  padding: 16px;
  border-top: 1.5px solid #e8e0d8;
  background: white;
  flex-shrink: 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #6b5c4e;
  margin-bottom: 6px;
}

.summary-row.total {
  font-size: 16px;
  font-weight: 700;
  color: #2d1f0e;
  margin-bottom: 14px;
  padding-top: 8px;
  border-top: 1px dashed #e2d9d0;
}

.cart-actions { display: flex; gap: 10px; }

.btn-clear {
  flex: 1;
  padding: 12px;
  border: 1.5px solid #d9cec4;
  background: white;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  cursor: pointer;
  color: #8a7060;
  transition: background 0.15s;
}

.btn-clear:hover { background: #f5f0ea; }

.btn-checkout {
  flex: 2;
  padding: 12px;
  background: #2d1f0e;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  font-family: 'Sora', sans-serif;
  transition: background 0.15s;
}

.btn-checkout:hover { background: #3d2a12; }

/* Slide animation */
.slide-enter-active, .slide-leave-active { transition: opacity 0.25s; }
.slide-enter-active .cart-drawer, .slide-leave-active .cart-drawer {
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.slide-enter .cart-drawer, .slide-leave-to .cart-drawer { transform: translateX(100%); }
.slide-enter, .slide-leave-to { opacity: 0; }

/* Toast */
.toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: #2d1f0e;
  color: white;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  z-index: 500;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,0,0,0.25);
  font-family: 'DM Sans', sans-serif;
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>