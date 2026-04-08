<template>
  <div class="auth-wrapper">
    <div class="auth-card">

      <div class="auth-brand">
        <div class="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span class="brand-name">Storefront</span>
      </div>

      <h1 class="auth-title">Welcome back</h1>
      <p class="auth-subtitle">Sign in to your account to continue</p>

      <div class="form-group" :class="{ 'has-error': errors.email }">
        <label class="form-label" for="email">Email address</label>
        <input
          id="email"
          v-model.trim="form.email"
          type="email"
          class="form-input"
          placeholder="you@example.com"
          autocomplete="email"
          :disabled="loading"
          @blur="validateEmail"
          @input="clearError('email')"
          @keyup.enter="focusPassword"
        />
        <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
      </div>

      <div class="form-group" :class="{ 'has-error': errors.password }">
        <div class="label-row">
          <label class="form-label" for="password">Password</label>
          <a href="#" class="forgot-link" tabindex="-1">Forgot password?</a>
        </div>
        <div class="input-wrapper">
          <input
            id="password"
            ref="passwordInput"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Enter your password"
            autocomplete="current-password"
            :disabled="loading"
            @blur="validatePassword"
            @input="clearError('password')"
            @keyup.enter="login"
          />
          <button
            type="button"
            class="toggle-password"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        </div>
        <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
      </div>

      <div v-if="serverError" class="alert alert-error" role="alert">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ serverError }}
      </div>

      <button
        class="btn-primary"
        :disabled="loading"
        @click="login"
      >
        <span v-if="loading" class="spinner" aria-hidden="true"></span>
        <span>{{ loading ? 'Signing in…' : 'Sign in' }}</span>
      </button>

      <p class="auth-footer">
        Don't have an account?
        <router-link to="/register" class="auth-link">Create one</router-link>
      </p>

    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",

  data() {
    return {
      form: {
        email: "",
        password: ""
      },
      errors: {
        email: "",
        password: ""
      },
      serverError: "",
      loading: false,
      showPassword: false
    };
  },

  mounted() {
    const token = localStorage.getItem("token");
    if (token) {
      this.$router.push("/");
    }
  },

  methods: {
    focusPassword() {
      this.$refs.passwordInput?.focus();
    },

    clearError(field) {
      this.errors[field] = "";
      this.serverError = "";
    },

    validateEmail() {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email) {
        this.errors.email = "Email is required.";
      } else if (!emailRe.test(this.form.email)) {
        this.errors.email = "Enter a valid email address.";
      } else {
        this.errors.email = "";
      }
    },

    validatePassword() {
      if (!this.form.password) {
        this.errors.password = "Password is required.";
      } else {
        this.errors.password = "";
      }
    },

    validate() {
      this.validateEmail();
      this.validatePassword();
      return !this.errors.email && !this.errors.password;
    },

    async login() {
      this.serverError = "";
      if (!this.validate()) return;

      this.loading = true;
      try {
        const res = await axios.post(
          "http://localhost:5001/api/auth/login",
          {
            email: this.form.email,
            password: this.form.password
          }
        );

        localStorage.setItem("token", res.data.token);
        this.$router.push("/");

      } catch (error) {
        const status = error.response?.status;
        if (status === 401 || status === 400) {
          this.serverError = "Incorrect email or password. Please try again.";
        } else if (status === 429) {
          this.serverError = "Too many attempts. Please wait a moment and try again.";
        } else {
          this.serverError = "Something went wrong. Please try again later.";
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

.auth-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f4f0;
  padding: 1.5rem;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.auth-card {
  background: #ffffff;
  border: 1px solid #e2e0d8;
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
}

.auth-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-family: 'Georgia', serif;
  font-size: 15px;
  font-weight: normal;
  color: #1a1a1a;
  letter-spacing: 0.02em;
}

.auth-title {
  font-family: 'Georgia', serif;
  font-size: 22px;
  font-weight: normal;
  color: #1a1a1a;
  margin: 0 0 0.35rem;
  letter-spacing: -0.01em;
}

.auth-subtitle {
  font-size: 14px;
  color: #6b6b6b;
  margin: 0 0 1.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.form-group {
  margin-bottom: 1.25rem;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.label-row .form-label {
  margin-bottom: 0;
}

.forgot-link {
  font-size: 12px;
  color: #6b6b6b;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.forgot-link:hover {
  color: #1a1a1a;
  text-decoration: underline;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d8d6ce;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  background: #fafaf8;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  appearance: none;
  -webkit-appearance: none;
}

.form-input::placeholder {
  color: #b0aea6;
}

.form-input:focus {
  border-color: #1a1a1a;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(26, 26, 26, 0.07);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.has-error .form-input {
  border-color: #c0392b;
  background: #fff8f8;
}

.has-error .form-input:focus {
  box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.1);
}

.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s;
}

.toggle-password:hover {
  color: #333;
}

.field-error {
  display: block;
  font-size: 12px;
  color: #c0392b;
  margin-top: 5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 1.25rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.alert-error {
  background: #fff2f2;
  border: 1px solid #f5c6c6;
  color: #9b2020;
}

.btn-primary {
  width: 100%;
  height: 42px;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: 0.01em;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #2d2d2d;
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.99);
}

.btn-primary:disabled {
  opacity: 0.6;
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

.auth-footer {
  text-align: center;
  font-size: 13px;
  color: #6b6b6b;
  margin: 1.25rem 0 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.auth-link {
  color: #1a1a1a;
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}
</style>