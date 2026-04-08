<template>
  <div class="checkout-wrapper">
    <div class="checkout-container">

      <!-- Header -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()" aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <h1 class="page-title">Checkout</h1>
      </div>

      <!-- Two-column layout -->
      <div class="checkout-layout">

        <!-- Left: Order Summary -->
        <section class="order-section" aria-labelledby="order-heading">
          <h2 id="order-heading" class="section-heading">Order summary</h2>

          <!-- Empty -->
          <div v-if="!cart || cart.length === 0" class="empty-state">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            <p>Your cart is empty.</p>
            <router-link to="/" class="shop-link">Browse products</router-link>
          </div>

          <!-- Item list -->
          <ul v-else class="item-list" role="list">
            <li
              v-for="item in cart"
              :key="item._id"
              class="cart-item"
            >
              <div class="item-info">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-qty">Qty {{ item.qty }}</span>
              </div>
              <span class="item-price">₱{{ formatPrice(item.price * item.qty) }}</span>
            </li>
          </ul>

          <!-- Totals -->
          <div v-if="cart && cart.length > 0" class="totals">
            <div class="total-row subtotal">
              <span>Subtotal</span>
              <span>₱{{ formatPrice(total) }}</span>
            </div>
            <div class="total-row shipping">
              <span>Shipping</span>
              <span class="free-tag">Free</span>
            </div>
            <div class="total-row grand">
              <span>Total</span>
              <span>₱{{ formatPrice(total) }}</span>
            </div>
          </div>
        </section>

        <!-- Right: Payment -->
        <section class="payment-section" aria-labelledby="payment-heading">
          <h2 id="payment-heading" class="section-heading">Payment</h2>

          <div class="payment-card">
            <div class="payment-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              <span>Card details would go here</span>
            </div>
          </div>

          <!-- Server error -->
          <div v-if="serverError" class="alert-error" role="alert">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ serverError }}
          </div>

          <!-- Place order -->
          <button
            class="btn-place-order"
            :disabled="!cart || cart.length === 0 || loading"
            @click="placeOrder"
          >
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            <span>{{ loading ? 'Placing order…' : `Pay ₱${formatPrice(total)}` }}</span>
          </button>

          <p class="security-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Secured with 256-bit SSL encryption
          </p>
        </section>

      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CheckoutPage",

  data() {
    return {
      cart: [],
      loading: false,
      serverError: ""
    };
  },

  computed: {
    total() {
      if (!this.cart || !this.cart.length) return 0;
      return this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    }
  },

  mounted() {
    this.loadCart();
  },

  methods: {
    loadCart() {
      try {
        const raw = localStorage.getItem("cart");
        this.cart = raw ? JSON.parse(raw) : [];
      } catch {
        this.cart = [];
      }
    },

    formatPrice(value) {
      return Number(value).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    async placeOrder() {
      this.serverError = "";

      if (!this.cart || this.cart.length === 0) return;

      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push({ path: "/login", query: { redirect: "/checkout" } });
        return;
      }

      this.loading = true;
      try {
        await axios.post(
          "http://localhost:5001/api/order/create",
          {
            items: this.cart.map(({ _id, qty, price }) => ({ _id, qty, price })),
            total: this.total
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        localStorage.removeItem("cart");
        this.cart = [];
        this.$router.push("/orders");

      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          this.$router.push({ path: "/login", query: { redirect: "/checkout" } });
        } else if (status === 400) {
          this.serverError = err.response.data?.message || "Some items in your cart are unavailable.";
        } else {
          this.serverError = "We couldn't place your order. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
*, *::before, *::after {
  box-sizing: border-box;
}

.checkout-wrapper {
  min-height: 100vh;
  background: #f5f4f0;
  padding: 2rem 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.checkout-container {
  max-width: 820px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1.75rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  font-size: 13px;
  color: #6b6b6b;
  cursor: pointer;
  padding: 4px 0;
  font-family: inherit;
  transition: color 0.15s;
}

.back-btn:hover {
  color: #1a1a1a;
}

.page-title {
  font-family: 'Georgia', serif;
  font-size: 22px;
  font-weight: normal;
  color: #1a1a1a;
  margin: 0;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  align-items: start;
}

@media (max-width: 640px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

.order-section,
.payment-section {
  background: #ffffff;
  border: 1px solid #e2e0d8;
  border-radius: 12px;
  padding: 1.5rem;
}

.section-heading {
  font-family: 'Georgia', serif;
  font-size: 15px;
  font-weight: normal;
  color: #1a1a1a;
  margin: 0 0 1.25rem;
  letter-spacing: 0.01em;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
}

.empty-state svg {
  margin: 0 auto 0.75rem;
  display: block;
  opacity: 0.4;
}

.empty-state p {
  font-size: 14px;
  margin: 0 0 1rem;
}

.shop-link {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

/* Item list */
.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0eee6;
}

.cart-item:first-child {
  padding-top: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.item-name {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
}

.item-qty {
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  white-space: nowrap;
}

/* Totals */
.totals {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e0d8;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
}

.subtotal,
.shipping {
  color: #6b6b6b;
}

.grand {
  color: #1a1a1a;
  font-weight: 600;
  font-size: 15px;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #e2e0d8;
}

.free-tag {
  color: #2d8a5c;
  font-weight: 500;
}

/* Payment card */
.payment-card {
  border: 1px dashed #d8d6ce;
  border-radius: 8px;
  padding: 1.25rem;
  margin-bottom: 1.25rem;
}

.payment-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #aaa;
  font-size: 13px;
}

/* Error alert */
.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  background: #fff2f2;
  border: 1px solid #f5c6c6;
  color: #9b2020;
  margin-bottom: 1rem;
}

/* Place order button */
.btn-place-order {
  width: 100%;
  height: 44px;
  background: #1a1a1a;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s, opacity 0.15s;
  font-family: inherit;
  letter-spacing: 0.01em;
}

.btn-place-order:hover:not(:disabled) {
  background: #2d2d2d;
}

.btn-place-order:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-place-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 12px;
  color: #aaa;
  margin: 0.75rem 0 0;
  text-align: center;
}
</style>