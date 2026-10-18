// @ts-check
/**
 * @fileoverview Unified Authentication Page for Customer and Administrator with 1-Click Demo Logins.
 *
 * Architectural Layer: Presentation / Authentication Page.
 * Pattern: Page Component + Strategy Pattern.
 *
 * Educational Concept: Mock Authentication & RBAC Handshake:
 * In modern frontend architectures, login does not perform arbitrary DOM mutations;
 * instead, it invokes `authService.login()`, which issues a simulated session token.
 * Upon success, the `EventBus` emits `auth:changed`, allowing the Header, Router guards,
 * and profile dashboard to synchronize their state automatically.
 */

import { Component } from '../../core/Component.js';

export class AuthPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.selectedRole = 'customer';
  }

  render() {
    return `
      <div class="auth-page-container">
        <div class="auth-card card">
          <!-- Header and Badge -->
          <div class="auth-card-header">
            <span class="badge badge-hero">ورود امن به سامانه</span>
            <h1 class="auth-title">ورود به حساب کاربری</h1>
            <p class="muted text-sm">
              برای دسترسی به پنل مدیریت یا تکمیل خرید و مشاهده سوابق، وارد حساب خود شوید.
            </p>
          </div>

          <!-- Account Security Callout Box -->
          <div class="auth-educational-callout">
            <span class="callout-icon">🔒</span>
            <div class="callout-body">
              <strong>امنیت و حفظ حریم خصوصی:</strong>
              <p class="text-sm muted">
                اطلاعات کاربری و سوابق سفارش‌های شما با پروتکل‌های امنیتی روز محافظت می‌شوند.
              </p>
            </div>
          </div>

          <!-- Fast 1-Click Demo Buttons -->
          <div class="demo-login-group">
            <span class="demo-label text-sm muted">ورود سریع با حساب‌های پیش‌فرض:</span>
            <div class="demo-buttons-grid">
              <button class="btn btn-secondary btn-demo" data-act="demo-admin">
                <span class="demo-icon">🛡️</span>
                <span>ورود به عنوان مدیر سیستم</span>
              </button>
              <button class="btn btn-secondary btn-demo" data-act="demo-customer">
                <span class="demo-icon">👤</span>
                <span>ورود به عنوان مشتری</span>
              </button>
            </div>
          </div>

          <!-- Role Selector Tabs -->
          <div class="auth-tabs-row" role="tablist">
            <button
              class="auth-tab-btn ${this.selectedRole === 'customer' ? 'is-active' : ''}"
              data-act="switch-tab"
              data-role="customer"
              role="tab"
            >
              حساب کاربری مشتری
            </button>
            <button
              class="auth-tab-btn ${this.selectedRole === 'admin' ? 'is-active' : ''}"
              data-act="switch-tab"
              data-role="admin"
              role="tab"
            >
              حساب مدیریت سیستم
            </button>
          </div>

          <!-- Standard Credentials Form -->
          <form id="auth-credentials-form" class="stack gap-md">
            <div class="form-group">
              <label for="auth-email" class="form-label">آدرس ایمیل:</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                class="input-field"
                placeholder="name@example.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label for="auth-password" class="form-label">رمز عبور:</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                class="input-field"
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="btn btn-primary btn-submit-auth" id="btn-login-submit">
              <span>ورود به حساب کاربری</span>
              <span>↵</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.root) return;

    const form = /** @type {HTMLFormElement|null} */ (this.$('#auth-credentials-form'));
    const emailInput = /** @type {HTMLInputElement|null} */ (this.$('#auth-email'));
    const passwordInput = /** @type {HTMLInputElement|null} */ (this.$('#auth-password'));

    // Handle Form Submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = this.$('#btn-login-submit');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');

      try {
        const fd = new FormData(form);
        const email = String(fd.get('email') || '').trim();
        const password = String(fd.get('password') || '');

        const user = await this.deps.authService.login(email, password);
        this.deps.bus.emit('auth:changed');
        this.deps.bus.emit('toast:add', {
          kind: 'success',
          text: `خوش آمدید، ${user.name}! با موفقیت وارد شدید.`
        });

        // Navigate based on user role
        if (user.role === 'admin') {
          location.hash = '#/admin';
        } else {
          location.hash = '#/profile';
        }
      } catch (err) {
        this.deps.bus.emit('toast:add', { kind: 'error', text: /** @type {Error} */ (err).message });
      } finally {
        if (submitBtn) submitBtn.removeAttribute('disabled');
      }
    });

    // Delegated Clicks: Demo Login and Role Tabs
    this.listen(this.root, 'click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;

      const act = actionEl.getAttribute('data-act');

      if (act === 'demo-admin') {
        if (emailInput && passwordInput) {
          emailInput.value = 'admin@example.com';
          passwordInput.value = 'admin123';
          form?.requestSubmit();
        }
      } else if (act === 'demo-customer') {
        if (emailInput && passwordInput) {
          emailInput.value = 'user@example.com';
          passwordInput.value = 'user123';
          form?.requestSubmit();
        }
      } else if (act === 'switch-tab') {
        this.selectedRole = actionEl.getAttribute('data-role') || 'customer';
        this.$$('.auth-tab-btn').forEach((btn) => {
          btn.classList.toggle('is-active', btn.getAttribute('data-role') === this.selectedRole);
        });

        if (emailInput && passwordInput) {
          if (this.selectedRole === 'admin') {
            emailInput.value = 'admin@example.com';
            passwordInput.value = 'admin123';
          } else {
            emailInput.value = 'user@example.com';
            passwordInput.value = 'user123';
          }
        }
      }
    });
  }
}
