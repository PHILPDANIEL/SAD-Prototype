<template>
  <transition name="modal-fade">
    <div v-if="product" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="'modal-title-' + product._id">

        <!-- Header image strip -->
        <div class="modal-img-wrap">
          <img v-if="product.image" :src="product.image" :alt="product.name" class="modal-img" />
          <div v-else class="modal-img-placeholder">🧋</div>
          <button class="modal-close" @click="$emit('close')" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Product info -->
        <div class="modal-body">
          <div class="modal-product-meta">
            <h2 :id="'modal-title-' + product._id" class="modal-product-name">{{ product.name }}</h2>
            <span class="modal-product-price">₱{{ basePrice.toFixed(2) }}</span>
          </div>
          <p v-if="product.description" class="modal-product-desc">{{ product.description }}</p>

          <!-- Addons -->
          <div v-if="addons && addons.length" class="addon-section">
            <p class="addon-heading">
              Add-ons
              <span class="addon-hint">optional</span>
            </p>
            <div class="addon-list">
              <label
                v-for="addon in addons"
                :key="addon._id"
                class="addon-row"
                :class="{ selected: isSelected(addon) }"
              >
                <input
                  type="checkbox"
                  class="addon-checkbox"
                  :checked="isSelected(addon)"
                  @change="toggleAddon(addon)"
                />
                <span class="addon-name">{{ addon.name }}</span>
                <span class="addon-price">+₱{{ (addon.price || 0).toFixed(2) }}</span>
              </label>
            </div>
          </div>

          <!-- Notes -->
          <div class="notes-section">
            <label class="addon-heading" :for="'notes-' + product._id">
              Special instructions
              <span class="addon-hint">optional</span>
            </label>
            <textarea
              :id="'notes-' + product._id"
              v-model="notes"
              class="notes-input"
              placeholder="e.g. less ice, extra sweet…"
              rows="2"
            ></textarea>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="qty-control" role="group" aria-label="Quantity">
              <button class="qty-btn" @click="decreaseQty" :disabled="qty <= 1" aria-label="Decrease">−</button>
              <span class="qty-display">{{ qty }}</span>
              <button class="qty-btn" @click="qty++" aria-label="Increase">+</button>
            </div>

            <button class="btn-add" @click="confirm">
              Add to order · ₱{{ lineTotal.toFixed(2) }}
            </button>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "AddToCartModal",

  props: {
    product: { type: Object, default: null },
    addons:  { type: Array,  default: () => [] }
  },

  emits: ["close", "confirm"],

  data() {
    return {
      selectedAddons: [],
      notes: "",
      qty: 1
    };
  },

  watch: {
    product(val) {
      if (val) {
        this.selectedAddons = [];
        this.notes = "";
        this.qty = 1;
      }
    }
  },

  computed: {
    basePrice() {
      return this.product?.price || 0;
    },

    addonTotal() {
      return this.selectedAddons.reduce((s, a) => s + (a.price || 0), 0);
    },

    lineTotal() {
      return (this.basePrice + this.addonTotal) * this.qty;
    }
  },

  methods: {
    isSelected(addon) {
      return this.selectedAddons.some(a => a._id === addon._id);
    },

    toggleAddon(addon) {
      const idx = this.selectedAddons.findIndex(a => a._id === addon._id);
      if (idx >= 0) {
        this.selectedAddons.splice(idx, 1);
      } else {
        this.selectedAddons.push(addon);
      }
    },

    decreaseQty() {
      if (this.qty > 1) this.qty--;
    },

    confirm() {
      this.$emit("confirm", {
        product: this.product,
        addons: [...this.selectedAddons],
        notes: this.notes.trim(),
        qty: this.qty
      });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

/* Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(30, 18, 6, 0.55);
  backdrop-filter: blur(2px);
  z-index: 400;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 520px) {
  .modal-backdrop {
    align-items: center;
    padding: 1.5rem;
  }
}

/* Modal card */
.modal {
  background: #faf8f5;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 460px;
  max-height: 92vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
}

@media (min-width: 520px) {
  .modal {
    border-radius: 20px;
    max-height: 88vh;
  }
}

/* Image strip */
.modal-img-wrap {
  position: relative;
  height: 180px;
  background: #f0ebe4;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
  flex-shrink: 0;
}

.modal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.85);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d1f0e;
  transition: background 0.15s;
}

.modal-close:hover { background: #fff; }

/* Body */
.modal-body {
  padding: 20px 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-product-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.modal-product-name {
  font-family: 'Sora', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #2d1f0e;
  margin: 0;
  line-height: 1.2;
}

.modal-product-price {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #e85d04;
  white-space: nowrap;
}

.modal-product-desc {
  font-size: 13px;
  color: #8a7060;
  margin: -8px 0 0;
  line-height: 1.5;
}

/* Addons */
.addon-section,
.notes-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addon-heading {
  font-size: 12px;
  font-weight: 600;
  color: #6b5c4e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.addon-hint {
  font-size: 11px;
  color: #b09880;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
}

.addon-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.addon-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: white;
  border: 1.5px solid #ede8e2;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
}

.addon-row.selected {
  border-color: #2d1f0e;
  background: #fdf7f0;
}

.addon-checkbox {
  accent-color: #2d1f0e;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  cursor: pointer;
}

.addon-name {
  flex: 1;
  font-size: 14px;
  color: #2d1f0e;
}

.addon-price {
  font-size: 13px;
  font-weight: 600;
  color: #8a7060;
}

/* Notes */
.notes-input {
  width: 100%;
  border: 1.5px solid #e2d9d0;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  resize: none;
  color: #2d1f0e;
  background: white;
  outline: none;
  transition: border-color 0.15s;
  line-height: 1.5;
}

.notes-input::placeholder { color: #c0b0a0; }
.notes-input:focus { border-color: #2d1f0e; }

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
}

.qty-control {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1.5px solid #e2d9d0;
  border-radius: 10px;
  padding: 6px 10px;
  flex-shrink: 0;
}

.qty-btn {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: 700;
  color: #2d1f0e;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.12s;
  line-height: 1;
}

.qty-btn:hover:not(:disabled) { background: #f0ebe4; }
.qty-btn:disabled { opacity: 0.3; cursor: default; }

.qty-display {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: #2d1f0e;
  min-width: 20px;
  text-align: center;
}

.btn-add {
  flex: 1;
  height: 46px;
  background: #2d1f0e;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: 0.01em;
}

.btn-add:hover { background: #3d2a12; }
.btn-add:active { transform: scale(0.98); }

/* Animation */
.modal-fade-enter-active { transition: opacity 0.2s; }
.modal-fade-leave-active { transition: opacity 0.18s; }
.modal-fade-enter-active .modal { transition: transform 0.25s cubic-bezier(0.34,1.28,0.64,1); }
.modal-fade-leave-active .modal  { transition: transform 0.18s ease-in; }
.modal-fade-enter,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter .modal { transform: translateY(40px) scale(0.97); }
.modal-fade-leave-to .modal { transform: translateY(20px) scale(0.98); }
</style>