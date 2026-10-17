// @ts-check
/**
 * @fileoverview Customer Profile Dashboard: Order history, digital receipts, and wishlist management.
 *
 * Architectural Layer: Presentation / Authenticated User Dashboard.
 * Pattern: Page Component + Repository Aggregation.
 *
 * Educational Concepts:
 * 1. Role-Protected Views:
 *    This view is guarded by the SPA Router middleware (`Router.guards`). Unauthenticated
 *    visitors are automatically redirected to `#/login` with an informational toast.
 * 2. Cross-Repository Joins:
 *    The profile queries `orderService.userOrders()` and joins wishlist product IDs
 *    against `productService.all()`.
 */

import { Component } from '../../core/Component.js';
import { jalali, toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';

export class ProfilePage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.activeTab = 'orders'; // 'orders' | 'wishlist'
  }

  render() {
    const user = this.deps.authService.currentUser();
    if (!user) {
      return `
        <div class="card empty-state">
          <h2>ابتدا وارد حساب کاربری شوید</h2>
          <p class="muted">برای مشاهده مشخصات و سوابق سفارش وارد شوید.</p>
          <a href="#/login" class="btn btn-primary">ورود به حساب</a>
        </div>
      `;
    }

    const orders = this.deps.orderService.userOrders();
    const wishlistCount = (user.wishlist || []).length;

    return `
      <div class="profile-dashboard stack gap-xl">
        <!-- User Profile Identity Banner -->
        <header class="profile-banner card">
          <div class="profile-identity">
            <div class="profile-avatar">👤</div>
            <div class="profile-meta">
              <div class="profile-title-row">
                <h1 class="profile-name">${escapeHtml(user.name)}</h1>
                <span class="badge badge-accent">مشتری تاییدشده</span>
              </div>
              <div class="profile-email muted">${escapeHtml(user.email)}</div>
            </div>
          </div>

          <div class="profile-stats-cluster">
            <div class="stat-box">
              <span class="stat-val">${toPersianDigits(orders.length)}</span>
              <span class="stat-lbl muted text-sm">سفارش ثبت‌شده</span>
            </div>
            <div class="stat-box">
              <span class="stat-val">${toPersianDigits(wishlistCount)}</span>
              <span class="stat-lbl muted text-sm">علاقه‌مندی‌ها</span>
            </div>
            <button class="btn btn-secondary btn-sm" data-act="logout">خروج از حساب</button>
          </div>
        </header>

        <!-- Profile Tabs -->
        <div class="profile-tabs-row" role="tablist">
          <button
            class="profile-tab-btn ${this.activeTab === 'orders' ? 'is-active' : ''}"
            data-act="tab-orders"
            role="tab"
          >
            <span>سوابق سفارش‌ها (${toPersianDigits(orders.length)})</span>
          </button>
          <button
            class="profile-tab-btn ${this.activeTab === 'wishlist' ? 'is-active' : ''}"
            data-act="tab-wishlist"
            role="tab"
          >
            <span>لیست علاقه‌مندی‌ها (${toPersianDigits(wishlistCount)})</span>
          </button>
        </div>

        <!-- Tab Content Area -->
        <main id="profile-tab-content"></main>
      </div>
    `;
  }

  async renderTabContent() {
    const mount = this.$('#profile-tab-content');
    if (!mount) return;

    if (this.activeTab === 'orders') {
      await this.renderOrdersTab(mount);
    } else {
      await this.renderWishlistTab(mount);
    }
  }

  /**
   * @param {Element} mount
   */
  async renderOrdersTab(mount) {
    const orders = this.deps.orderService.userOrders();

    if (orders.length === 0) {
      mount.innerHTML = `
        <div class="card empty-state">
          <div class="empty-icon">📦</div>
          <h3>هیچ سفارشی ثبت نشده است</h3>
          <p class="muted">شما هنوز خریدی در فروشگاه انجام نداده‌اید.</p>
          <a href="#/products" class="btn btn-primary">مشاهده ویترین محصولات</a>
        </div>
      `;
      return;
    }

    const statusMap = {
      paid: { text: 'پرداخت‌شده / در حال پردازش', class: 'badge-info' },
      shipped: { text: 'تحویل شرکت پست / ارسال‌شده', class: 'badge-warning' },
      delivered: { text: 'تحویل داده شده به گیرنده', class: 'badge-success' },
      cancelled: { text: 'لغو شده', class: 'badge-danger' }
    };

    mount.innerHTML = orders
      .map((ord) => {
        const st = statusMap[ord.status] || { text: ord.status, class: 'badge-info' };
        const itemsHtml = ord.items
          .map(
            (it) => `
            <div class="order-item-chip">
              <span class="chip-name">${escapeHtml(it.name)}</span>
              <span class="chip-qty muted">× ${toPersianDigits(it.qty)}</span>
              <span class="chip-price">${toman(it.price * it.qty)}</span>
            </div>`
          )
          .join('');

        return `
        <article class="order-receipt-card card stack gap-sm">
          <div class="order-card-header">
            <div class="order-id-group">
              <span class="badge ${st.class}">${st.text}</span>
              <strong>کد رهگیری: ${toPersianDigits(ord.trackingCode)}</strong>
            </div>
            <time class="order-date muted text-sm">${jalali(ord.createdAt)}</time>
          </div>

          <div class="order-items-wrap">
            ${itemsHtml}
          </div>

          <div class="order-card-footer">
            <div class="order-address muted text-sm">
              ${ord.address ? `📍 نشانی تحویل: ${escapeHtml(ord.address)}` : ''}
            </div>
            <div class="order-total-block">
              <span class="muted text-sm">مبلغ پرداختی:</span>
              <strong class="order-total-price">${toman(ord.total)}</strong>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  /**
   * @param {Element} mount
   */
  async renderWishlistTab(mount) {
    const user = this.deps.authService.currentUser();
    const wishlistIds = user?.wishlist || [];

    if (wishlistIds.length === 0) {
      mount.innerHTML = `
        <div class="card empty-state">
          <div class="empty-icon">🤍</div>
          <h3>فهرست علاقه‌مندی‌های شما خالی است</h3>
          <p class="muted">با کلیک روی آیکون قلب روی هر محصول، آن را برای بررسی‌های آینده ذخیره کنید.</p>
          <a href="#/products" class="btn btn-primary">رفتن به کاتالوگ</a>
        </div>
      `;
      return;
    }

    const allProducts = await this.deps.productService.all();
    const products = allProducts.filter((p) => wishlistIds.includes(p.id));

    mount.innerHTML = `
      <div class="products-grid">
        ${products
          .map((p) => {
            const price = Math.round(p.price * (1 - (p.discount || 0) / 100));
            return `
            <article class="product-card card" data-id="${p.id}">
              <div class="product-card-top">
                <img src="${p.image}" alt="${escapeHtml(p.name)}" class="product-card-img" loading="lazy" />
              </div>
              <div class="product-card-body">
                <h3 class="product-card-title">${escapeHtml(p.name)}</h3>
                <div class="card-final-price">${toman(price)}</div>
                <div class="product-card-actions">
                  <button class="btn btn-primary btn-sm" data-act="add-wished-cart" data-id="${p.id}">+ افزودن به سبد</button>
                  <button class="btn btn-ghost btn-sm text-danger" data-act="remove-wishlist" data-id="${p.id}">حذف</button>
                </div>
              </div>
            </article>`;
          })
          .join('')}
      </div>
    `;
  }

  async bindEvents() {
    await this.renderTabContent();

    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;

      const act = actionEl.getAttribute('data-act');
      const id = actionEl.getAttribute('data-id');

      if (act === 'logout') {
        this.deps.authService.logout();
        this.deps.bus.emit('auth:changed');
        this.deps.bus.emit('toast:add', { kind: 'info', text: 'از حساب کاربری خارج شدید.' });
        location.hash = '#/';
      } else if (act === 'tab-orders') {
        this.activeTab = 'orders';
        this.$$('.profile-tab-btn').forEach((btn) => btn.classList.remove('is-active'));
        actionEl.classList.add('is-active');
        await this.renderTabContent();
      } else if (act === 'tab-wishlist') {
        this.activeTab = 'wishlist';
        this.$$('.profile-tab-btn').forEach((btn) => btn.classList.remove('is-active'));
        actionEl.classList.add('is-active');
        await this.renderTabContent();
      } else if (act === 'add-wished-cart' && id) {
        await this.deps.orderService.addToCart(id, 1);
        this.deps.bus.emit('cart:changed');
        this.deps.bus.emit('toast:add', { kind: 'success', text: 'محصول با موفقیت به سبد خرید افزوده شد.' });
      } else if (act === 'remove-wishlist' && id) {
        await this.deps.authService.toggleWishlist(id);
        this.deps.bus.emit('toast:add', { kind: 'info', text: 'محصول از علاقه‌مندی‌ها حذف شد.' });
        this.mount();
      }
    });
  }
}
