// @ts-check
/**
 * @fileoverview Main Sticky Header with Mega-Menu, Live Debounced Search, and Action Controls.
 *
 * Architectural Layer: Presentation / Composite View Component.
 * Pattern: Component Pattern + Event Delegation + Debounce Decorator.
 *
 * Educational Concepts:
 * 1. Event Delegation:
 *    Instead of attaching individual click listeners to every menu item, category pill,
 *    and search result, a single delegated listener sits on `this.root`. When an event
 *    bubbles up, `e.target.closest('[data-act]')` identifies the intended action.
 *
 * 2. Debounced Dual Search:
 *    Typing in the search input triggers `debounce((e) => searchBoth(e), 300)`.
 *    This queries both `productService` and `articleService` concurrently (`Promise.all`),
 *    rendering a categorized live preview dropdown without freezing the UI thread.
 */

import { Component } from '../../core/Component.js';
import { debounce } from '../../utils/debounce.js';
import { toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';
import { seedCategories } from '../../data/seed.js';

export class Header extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../core/Store.js').Store<any>} deps.store
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   * @param {import('../../services/ArticleService.js').ArticleService} deps.articleService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.categoriesOpen = false;
  }

  render() {
    const user = this.deps.authService.currentUser();
    const cart = this.deps.orderService.getCart();
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const theme = document.documentElement.dataset.theme || 'dark';

    const categoryListHtml = seedCategories
      .map(
        (cat) => `
        <a href="#/products?category=${encodeURIComponent(cat.slug)}" class="mega-item" data-act="close-mega">
          <span class="mega-icon">${cat.icon}</span>
          <div class="mega-text">
            <strong>${cat.name}</strong>
            <small class="muted">${cat.description}</small>
          </div>
        </a>`
      )
      .join('');

    return `
      <div class="navbar glass">
        <!-- Brand & Main Nav Links -->
        <div class="nav-start">
          <a href="#/" class="brand">
            <span class="brand-badge">ویستا</span>
            <span class="brand-title">فروشگاه سخت‌افزار و تحریریه</span>
          </a>

          <nav class="nav-links" aria-label="ناوبری اصلی">
            <div class="dropdown-wrap">
              <button class="nav-link btn-ghost" data-act="toggle-mega" aria-expanded="${this.categoriesOpen}">
                <span>دسته‌بندی‌ها</span>
                <span class="chevron">▾</span>
              </button>
              <div class="mega-menu ${this.categoriesOpen ? 'is-open' : ''}" id="mega-dropdown">
                <div class="mega-grid">
                  ${categoryListHtml}
                </div>
              </div>
            </div>

            <a href="#/products" class="nav-link">محصولات</a>
            <a href="#/articles" class="nav-link">مقالات و بررسی</a>
            <a href="#/contact" class="nav-link">ارتباط با ما</a>
          </nav>
        </div>

        <!-- Live Debounced Search Bar -->
        <div class="search-container">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input
              id="global-search"
              type="search"
              placeholder="جستجو در محصولات و مقالات..."
              aria-label="جستجوی همزمان در فروشگاه و مقالات"
              autocomplete="off"
            />
          </div>
          <div id="search-results-dropdown" class="search-dropdown hidden" role="listbox"></div>
        </div>

        <!-- Action Controls: Theme, Cart Drawer, User Auth -->
        <div class="nav-actions">
          <button class="btn btn-icon" data-act="theme-toggle" title="تغییر حالت روز و شب" aria-label="تغییر تم">
            <span class="theme-icon">${theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          <button class="btn btn-cart" data-act="cart-toggle" aria-label="مشاهده سبد خرید">
            <span class="cart-icon">🛒</span>
            <span class="cart-label">سبد</span>
            <span class="badge ${cartCount > 0 ? 'badge-pulse' : ''}" id="cart-counter-badge">${toPersianDigits(cartCount)}</span>
          </button>

          ${
            user
              ? `
            <div class="auth-pill">
              <a href="#/${user.role === 'admin' ? 'admin' : 'profile'}" class="btn btn-user">
                <span class="user-role-dot ${user.role}"></span>
                <span class="user-name">${escapeHtml(user.name)}</span>
                <span class="badge badge-subtle">${user.role === 'admin' ? 'مدیر' : 'مشتری'}</span>
              </a>
              <button class="btn btn-icon btn-logout" data-act="logout" title="خروج از حساب">⏻</button>
            </div>
            `
              : `
            <a href="#/login" class="btn btn-primary btn-auth">
              <span>ورود / ثبت‌نام</span>
            </a>
            `
          }
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.root) return;

    // Delegated click handler on header container
    this.listen(this.root, 'click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) {
        // If clicked outside mega menu, close it
        if (!target.closest('.dropdown-wrap') && this.categoriesOpen) {
          this.categoriesOpen = false;
          this.mount();
        }
        return;
      }

      const act = actionEl.getAttribute('data-act');
      if (act === 'toggle-mega') {
        this.categoriesOpen = !this.categoriesOpen;
        const mega = this.$('#mega-dropdown');
        if (mega) {
          mega.classList.toggle('is-open', this.categoriesOpen);
          actionEl.setAttribute('aria-expanded', String(this.categoriesOpen));
        }
      } else if (act === 'close-mega') {
        this.categoriesOpen = false;
        const mega = this.$('#mega-dropdown');
        if (mega) mega.classList.remove('is-open');
      } else if (act === 'theme-toggle') {
        this.deps.bus.emit('theme:toggle');
      } else if (act === 'cart-toggle') {
        this.deps.bus.emit('cart:toggle');
      } else if (act === 'logout') {
        this.deps.authService.logout();
        this.deps.bus.emit('auth:changed');
        this.deps.bus.emit('toast:add', { kind: 'info', text: 'با موفقیت از حساب کاربری خارج شدید.' });
      }
    });

    // Close mega-menu or search dropdown on click outside
    this.listen(document, 'click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (!target.closest('.search-container')) {
        const searchDropdown = this.$('#search-results-dropdown');
        if (searchDropdown) searchDropdown.classList.add('hidden');
      }
      if (!target.closest('.dropdown-wrap') && this.categoriesOpen) {
        this.categoriesOpen = false;
        const mega = this.$('#mega-dropdown');
        if (mega) mega.classList.remove('is-open');
      }
    });

    // Setup Live Debounced Search
    const searchInput = /** @type {HTMLInputElement|null} */ (this.$('#global-search'));
    const searchDropdown = this.$('#search-results-dropdown');

    if (searchInput && searchDropdown) {
      const runSearch = debounce(async (query) => {
        const q = (query || '').trim();
        if (q.length < 2) {
          searchDropdown.classList.add('hidden');
          searchDropdown.innerHTML = '';
          return;
        }

        // Query both products and articles concurrently (Promise.all)
        const [products, articles] = await Promise.all([
          this.deps.productService.query({ search: q }),
          this.deps.articleService.query({ search: q })
        ]);

        if (products.length === 0 && articles.length === 0) {
          searchDropdown.innerHTML = `<div class="search-empty muted">موردی برای «${escapeHtml(q)}» یافت نشد.</div>`;
          searchDropdown.classList.remove('hidden');
          return;
        }

        const productRows = products
          .slice(0, 4)
          .map(
            (p) => `
            <a href="#/products" class="search-item" data-id="${p.id}" data-type="product">
              <span class="search-badge">محصول</span>
              <span class="search-title">${escapeHtml(p.name)}</span>
              <span class="search-price">${toman(p.price)}</span>
            </a>`
          )
          .join('');

        const articleRows = articles
          .slice(0, 3)
          .map(
            (a) => `
            <a href="#/article/${a.id}" class="search-item" data-type="article">
              <span class="search-badge badge-article">مقاله</span>
              <span class="search-title">${escapeHtml(a.title)}</span>
              <span class="search-author muted">${escapeHtml(a.author)}</span>
            </a>`
          )
          .join('');

        searchDropdown.innerHTML = `
          ${products.length > 0 ? `<div class="search-group-title">محصولات مرتبط</div>${productRows}` : ''}
          ${articles.length > 0 ? `<div class="search-group-title">مقالات و یادداشت‌ها</div>${articleRows}` : ''}
          <div class="search-footer">
            <a href="#/products?search=${encodeURIComponent(q)}" class="search-all-link">مشاهده همه نتایج جستجو ↵</a>
          </div>
        `;
        searchDropdown.classList.remove('hidden');
      }, 300);

      this.listen(searchInput, 'input', (e) => {
        const value = /** @type {HTMLInputElement} */ (e.target).value;
        runSearch(value);
      });

      this.listen(searchInput, 'focus', () => {
        if (searchInput.value.trim().length >= 2) {
          searchDropdown.classList.remove('hidden');
        }
      });
    }

    // Reactive subscriptions from EventBus
    this.unsubs.push(
      this.deps.bus.on('cart:changed', () => {
        const badge = this.$('#cart-counter-badge');
        if (badge) {
          const cart = this.deps.orderService.getCart();
          const count = cart.reduce((s, i) => s + i.qty, 0);
          badge.textContent = toPersianDigits(count);
          badge.classList.remove('badge-pulse');
          void /** @type {HTMLElement} */ (badge).offsetWidth; // Trigger DOM reflow to replay CSS pulse animation
          if (count > 0) badge.classList.add('badge-pulse');
        }
      })
    );

    this.unsubs.push(
      this.deps.bus.on('auth:changed', () => {
        this.mount();
      })
    );

    this.unsubs.push(
      this.deps.bus.on('state:theme', () => {
        this.mount();
      })
    );
  }
}
