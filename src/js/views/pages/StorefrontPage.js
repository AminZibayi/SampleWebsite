// @ts-check
/**
 * @fileoverview Main Storefront Page with Bento Hero, multi-criteria filtering, and product grid.
 *
 * Architectural Layer: Presentation / SPA Page View.
 * Pattern: Page Component + Event Delegation + State Synchronization.
 *
 * Educational Architecture:
 * 1. Event Delegation over Card Sprawl:
 *    A naive frontend attaches listeners to every button inside every product card
 *    (e.g., 50 cards * 3 buttons = 150 event listeners).
 *    In this architecture, a single click listener is bound to `#products-grid`.
 *    When any card button is clicked, the event bubbles up, and `target.closest('[data-act]')`
 *    identifies the action ('quick-view', 'add-to-cart', 'toggle-wishlist') and the target product ID.
 *
 * 2. Asynchronous Skeleton Loading:
 *    While `productService.query()` simulates network latency (150-300ms), placeholder skeleton
 *    cards with CSS shimmer gradients prevent Cumulative Layout Shift (CLS).
 */

import { Component } from '../../core/Component.js';
import { toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';
import { seedCategories } from '../../data/seed.js';

export class StorefrontPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../core/Store.js').Store<any>} deps.store
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   * @param {Record<string, string>} [deps.query]
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.query = deps.query || {};

    // Synchronize initial filter state from URL query params if present
    if (this.query.category) {
      this.deps.store.set('category', decodeURIComponent(this.query.category));
    }
    if (this.query.search) {
      this.deps.store.set('search', decodeURIComponent(this.query.search));
    }
  }

  render() {
    const activeCategory = this.deps.store.state.category || 'همه';
    const activeSort = this.deps.store.state.sortBy || 'newest';
    const stockOnly = Boolean(this.deps.store.state.stockOnly);
    const priceMax = this.deps.store.state.priceMax || 100000000;

    const categoryPillsHtml = seedCategories
      .map(
        (cat) => `
        <button
          class="filter-pill ${activeCategory === cat.slug ? 'is-active' : ''}"
          data-act="set-category"
          data-slug="${cat.slug}"
        >
          <span class="pill-icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </button>`
      )
      .join('');

    return `
      <div class="storefront-container stack gap-xl">
        <!-- Section 1: Featured Bento Hero -->
        <section class="bento-hero" aria-label="ویترین ویژه محصولات منتخب">
          <div class="bento-hero-grid" id="hero-bento-cards">
            <div class="bento-cell bento-hero-main hero-skeleton">
              <div class="skeleton-shimmer"></div>
            </div>
            <div class="bento-cell bento-hero-secondary hero-skeleton">
              <div class="skeleton-shimmer"></div>
            </div>
          </div>
        </section>

        <!-- Section 2: Interactive Filtering & Sorting Toolbar -->
        <section class="toolbar-section card" aria-label="ابزارهای فیلتر و مرتب‌سازی">
          <div class="toolbar-header">
            <div class="toolbar-title-wrap">
              <span class="toolbar-icon">⚙️</span>
              <h2 class="toolbar-title">فیلتر و چیدمان محصولات</h2>
            </div>
            <span class="product-count-badge muted text-sm" id="product-count-display">در حال جستجو...</span>
          </div>

          <!-- Category Pills Row -->
          <div class="category-pills-row">
            ${categoryPillsHtml}
          </div>

          <!-- Secondary Filter Controls: Price Range, Stock Toggle, Sorter -->
          <div class="toolbar-controls-grid">
            <!-- Price Slider -->
            <div class="control-group price-slider-group">
              <div class="slider-header">
                <label for="price-range-slider" class="control-label">حداکثر قیمت:</label>
                <span class="slider-readout" id="price-readout">${toman(priceMax)}</span>
              </div>
              <input
                id="price-range-slider"
                type="range"
                min="5000000"
                max="100000000"
                step="2000000"
                value="${priceMax}"
                class="range-slider"
              />
            </div>

            <!-- In-Stock Toggle Checkbox -->
            <div class="control-group stock-toggle-group">
              <label class="toggle-switch-label">
                <input
                  id="stock-toggle"
                  type="checkbox"
                  class="toggle-checkbox"
                  ${stockOnly ? 'checked' : ''}
                />
                <span class="toggle-slider"></span>
                <span class="toggle-text">فقط کالاهای موجود در انبار</span>
              </label>
            </div>

            <!-- Sorting Dropdown -->
            <div class="control-group sort-dropdown-group">
              <label for="sort-select" class="control-label">مرتب‌سازی:</label>
              <select id="sort-select" class="select-field">
                <option value="newest" ${activeSort === 'newest' ? 'selected' : ''}>✨ جدیدترین محصولات</option>
                <option value="popular" ${activeSort === 'popular' ? 'selected' : ''}>🔥 محبوب‌ترین و پرفروش</option>
                <option value="priceAsc" ${activeSort === 'priceAsc' ? 'selected' : ''}>📉 قیمت: ارزان به گران</option>
                <option value="priceDesc" ${activeSort === 'priceDesc' ? 'selected' : ''}>📈 قیمت: گران به ارزان</option>
                <option value="rating" ${activeSort === 'rating' ? 'selected' : ''}>★ بالاترین امتیاز رضایت</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Section 3: Products Grid -->
        <section class="products-section" aria-label="فهرست کاتالوگ محصولات">
          <div class="products-grid" id="products-grid">
            ${this.renderSkeletons(6)}
          </div>
        </section>
      </div>
    `;
  }

  /**
   * Generates animated skeleton placeholder cards while async data loads.
   *
   * @param {number} count
   * @returns {string} Skeleton markup.
   */
  renderSkeletons(count) {
    return Array.from({ length: count })
      .map(
        () => `
        <div class="product-card skeleton-card">
          <div class="skeleton-img skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-title skeleton-shimmer"></div>
          <div class="skeleton-line skeleton-price skeleton-shimmer"></div>
          <div class="skeleton-actions skeleton-shimmer"></div>
        </div>`
      )
      .join('');
  }

  /**
   * Fetches and renders the Bento Hero flagship items.
   */
  async loadHero() {
    const heroContainer = this.$('#hero-bento-cards');
    if (!heroContainer) return;

    const flagships = await this.deps.productService.flagshipProducts(2);
    if (flagships.length < 2) return;

    const [main, secondary] = flagships;

    heroContainer.innerHTML = `
      <!-- Main Flagship Hero Card -->
      <article class="bento-cell bento-hero-main card">
        <div class="hero-content">
          <span class="badge badge-hero">پرچمدار مهندسی</span>
          <h2 class="hero-title">${escapeHtml(main.name)}</h2>
          <p class="hero-description muted">${escapeHtml(main.description)}</p>
          <div class="hero-price-wrap">
            <span class="hero-price">${toman(Math.round(main.price * (1 - (main.discount || 0) / 100)))}</span>
            ${main.discount > 0 ? `<span class="discount-pill">${toPersianDigits(main.discount)}٪ تخفیف</span>` : ''}
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary" data-act="quick-view" data-id="${main.id}">بررسی تخصصی و خرید</button>
            <button class="btn btn-ghost" data-act="add-to-cart" data-id="${main.id}">+ افزودن مستقیم</button>
          </div>
        </div>
        <div class="hero-visual">
          <img src="${main.image}" alt="${escapeHtml(main.name)}" class="hero-img" loading="eager" />
        </div>
      </article>

      <!-- Secondary Deal Bento Card -->
      <article class="bento-cell bento-hero-secondary card">
        <div class="hero-secondary-content">
          <span class="badge badge-accent">پیشنهاد ویژه روز</span>
          <h3 class="hero-secondary-title">${escapeHtml(secondary.name)}</h3>
          <div class="hero-price-wrap">
            <strong class="hero-secondary-price">${toman(Math.round(secondary.price * (1 - (secondary.discount || 0) / 100)))}</strong>
          </div>
          <button class="btn btn-secondary btn-sm" data-act="quick-view" data-id="${secondary.id}">مشاهده مشخصات</button>
        </div>
        <div class="hero-secondary-visual">
          <img src="${secondary.image}" alt="${escapeHtml(secondary.name)}" class="hero-secondary-img" loading="lazy" />
        </div>
      </article>
    `;
  }

  /**
   * Queries and paints the product catalog grid based on store state filters.
   */
  async redrawProducts() {
    const grid = this.$('#products-grid');
    const countDisplay = this.$('#product-count-display');
    if (!grid) return;

    const products = await this.deps.productService.query({
      search: this.deps.store.state.search || '',
      category: this.deps.store.state.category || 'همه',
      stockOnly: Boolean(this.deps.store.state.stockOnly),
      sortBy: this.deps.store.state.sortBy || 'newest',
      priceMax: this.deps.store.state.priceMax || Number.MAX_SAFE_INTEGER
    });

    if (countDisplay) {
      countDisplay.textContent = `نمایش ${toPersianDigits(products.length)} کالا`;
    }

    if (products.length === 0) {
      grid.innerHTML = `
        <div class="empty-catalog card">
          <div class="empty-icon">🔍</div>
          <h3>هیچ محصولی با معیارهای انتخاب‌شده پیدا نشد</h3>
          <p class="muted">محدوده قیمت، دسته‌بندی یا عبارت جستجوی خود را تغییر دهید.</p>
          <button class="btn btn-primary" data-act="reset-filters">تنظیم مجدد فیلترها</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = products
      .map((p) => {
        const effectivePrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
        const inWishlist = this.deps.authService.isInWishlist(p.id);

        return `
        <article class="product-card card" data-id="${p.id}">
          <!-- Card Image & Floating Badges -->
          <div class="product-card-top">
            <img src="${p.image}" alt="${escapeHtml(p.name)}" class="product-card-img" loading="lazy" />
            <button
              class="btn-card-wishlist ${inWishlist ? 'is-wished' : ''}"
              data-act="toggle-wishlist"
              data-id="${p.id}"
              aria-label="علاقه‌مندی"
              title="${inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}"
            >
              ${inWishlist ? '❤️' : '🤍'}
            </button>
            <div class="card-badges-stack">
              ${p.discount > 0 ? `<span class="badge badge-discount">${toPersianDigits(p.discount)}٪</span>` : ''}
              ${p.badge ? `<span class="badge badge-tag">${escapeHtml(p.badge)}</span>` : ''}
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="product-card-body">
            <div class="card-meta-row">
              <span class="card-category muted">${escapeHtml(p.category)}</span>
              <span class="card-rating">★ ${toPersianDigits(p.rating.toFixed(1))}</span>
            </div>

            <h3 class="product-card-title">
              <button class="title-btn" data-act="quick-view" data-id="${p.id}">${escapeHtml(p.name)}</button>
            </h3>

            <p class="product-card-desc muted">${escapeHtml(p.description)}</p>

            <!-- Price Block -->
            <div class="product-card-pricing">
              ${
                p.discount > 0
                  ? `<div class="card-strike-price">${toman(p.price)}</div>`
                  : '<div class="card-price-spacer"></div>'
              }
              <div class="card-final-price">${toman(effectivePrice)}</div>
            </div>

            <!-- Action Buttons -->
            <div class="product-card-actions">
              <button class="btn btn-secondary btn-quickview" data-act="quick-view" data-id="${p.id}">
                <span>مشاهده سریع</span>
              </button>
              <button
                class="btn btn-primary btn-add-cart"
                data-act="add-to-cart"
                data-id="${p.id}"
                ${p.stock === 0 ? 'disabled' : ''}
              >
                <span>${p.stock > 0 ? '+ سبد' : 'ناموجود'}</span>
              </button>
            </div>
          </div>
        </article>`;
      })
      .join('');
  }

  async bindEvents() {
    await this.loadHero();
    await this.redrawProducts();

    // Price Slider Input Listener
    const slider = /** @type {HTMLInputElement|null} */ (this.$('#price-range-slider'));
    const readout = this.$('#price-readout');
    if (slider && readout) {
      this.listen(slider, 'input', () => {
        const val = Number(slider.value);
        readout.textContent = toman(val);
        this.deps.store.set('priceMax', val);
        this.redrawProducts();
      });
    }

    // Stock Toggle Listener
    const stockCheckbox = /** @type {HTMLInputElement|null} */ (this.$('#stock-toggle'));
    if (stockCheckbox) {
      this.listen(stockCheckbox, 'change', () => {
        this.deps.store.set('stockOnly', stockCheckbox.checked);
        this.redrawProducts();
      });
    }

    // Sort Dropdown Listener
    const sortSelect = /** @type {HTMLSelectElement|null} */ (this.$('#sort-select'));
    if (sortSelect) {
      this.listen(sortSelect, 'change', () => {
        this.deps.store.set('sortBy', sortSelect.value);
        this.redrawProducts();
      });
    }
    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;
      const act = actionEl.getAttribute('data-act');
      const id = actionEl.getAttribute('data-id');
      if (act) await this.handleStorefrontAction(act, id, actionEl);
    });

    this.unsubs.push(
      this.deps.bus.on('search:changed', async () => {
        await this.redrawProducts();
      })
    );
  }

  /**
   * @param {string} act
   * @param {string|null} id
   * @param {Element} actionEl
   */
  async handleStorefrontAction(act, id, actionEl) {
    if (act === 'set-category') {
      const slug = actionEl.getAttribute('data-slug') || 'همه';
      this.deps.store.set('category', slug);
      this.$$('.filter-pill').forEach((pill) => {
        pill.classList.toggle('is-active', pill.getAttribute('data-slug') === slug);
      });
      await this.redrawProducts();
    } else if (act === 'reset-filters') {
      this.deps.store.set('category', 'همه');
      this.deps.store.set('search', '');
      this.deps.store.set('stockOnly', false);
      this.deps.store.set('priceMax', 100000000);
      this.mount();
    } else if (act === 'quick-view' && id) {
      this.deps.bus.emit('product:quickView', id);
    } else if (act === 'add-to-cart' && id) {
      await this.deps.orderService.addToCart(id, 1);
      this.deps.bus.emit('cart:changed');
      const prod = await this.deps.productService.byId(id);
      this.deps.bus.emit('toast:add', {
        kind: 'success',
        text: `«${prod ? prod.name : 'محصول'}» به سبد خرید اضافه شد.`
      });
    } else if (act === 'toggle-wishlist' && id) {
      await this.handleWishlistToggle(id, actionEl);
    }
  }

  /**
   * @param {string} id
   * @param {Element} actionEl
   */
  async handleWishlistToggle(id, actionEl) {
    try {
      const res = await this.deps.authService.toggleWishlist(id);
      actionEl.classList.toggle('is-wished', res.inWishlist);
      actionEl.textContent = res.inWishlist ? '❤️' : '🤍';
      this.deps.bus.emit('toast:add', {
        kind: res.inWishlist ? 'success' : 'info',
        text: res.inWishlist ? 'به علاقه‌مندی‌ها افزوده شد.' : 'از علاقه‌مندی‌ها حذف شد.'
      });
    } catch (err) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: /** @type {Error} */ (err).message });
    }
  }
}
