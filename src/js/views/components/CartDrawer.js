// @ts-check
/**
 * @fileoverview Slide-over shopping cart drawer with reactive quantity steppers and accessibility.
 *
 * Architectural Layer: Presentation / Interactive Overlay Component.
 * Pattern: Component Pattern + Event Delegation + Observer Subscriber.
 *
 * Accessibility (a11y) & UX Architecture:
 *  - WAI-ARIA Dialog semantics: `role="dialog"`, `aria-modal="true"`, `aria-label="سبد خرید"`.
 *  - Backdrop blur overlay that closes the drawer upon outside click.
 *  - Keyboard trap and Escape key listener to dismiss the slide-over gracefully.
 *  - Reactive updates without unmounting the drawer: only the inner items container is redrawn.
 */

import { Component } from '../../core/Component.js';
import { toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';

export class CartDrawer extends Component {
  /**
   * @param {Element|null} root - Host container (#drawer-root).
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../core/Store.js').Store<any>} deps.store
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.isOpen = false;
  }

  render() {
    return `
      <div class="drawer-backdrop ${this.isOpen ? 'is-active' : ''}" data-act="close-drawer" aria-hidden="${!this.isOpen}"></div>
      <aside
        class="drawer-panel ${this.isOpen ? 'is-open' : ''}"
        id="cart-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="سبد خرید"
        aria-hidden="${!this.isOpen}"
      >
        <div class="drawer-header">
          <div class="drawer-title-wrap">
            <span class="drawer-icon">🛒</span>
            <h2 class="drawer-title">سبد خرید شما</h2>
          </div>
          <button class="btn btn-icon btn-close" data-act="close-drawer" aria-label="بستن سبد خرید">✕</button>
        </div>

        <div class="drawer-body" id="cart-drawer-items">
          <div class="drawer-loading muted">در حال بارگذاری اقلام سبد...</div>
        </div>

        <div class="drawer-footer" id="cart-drawer-footer"></div>
      </aside>
    `;
  }

  async redrawItems() {
    const itemsContainer = this.$('#cart-drawer-items');
    const footerContainer = this.$('#cart-drawer-footer');
    if (!itemsContainer || !footerContainer) return;

    const { items, subtotal, itemCount } = await this.deps.orderService.getCartSummary();

    if (items.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-state">
          <div class="empty-icon">🛍️</div>
          <h3>سبد خرید شما خالی است</h3>
          <p class="muted">محصولات منتخب تکنولوژی را بررسی کنید و به سبد بیفزایید.</p>
          <a href="#/products" class="btn btn-primary" data-act="close-drawer">مشاهده محصولات</a>
        </div>
      `;
      footerContainer.innerHTML = '';
      return;
    }

    const rowsHtml = items
      .map(
        (item) => `
        <article class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-thumb">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" width="64" height="48" loading="lazy" />
          </div>
          <div class="cart-item-details">
            <h4 class="cart-item-name">${escapeHtml(item.name)}</h4>
            <div class="cart-item-price-unit">
              ${toman(Math.round(item.price * (1 - (item.discount || 0) / 100)))}
            </div>
            <div class="cart-item-stepper">
              <button class="stepper-btn" data-act="dec" data-id="${item.id}" aria-label="کاهش تعداد" ${item.qty <= 1 ? 'disabled' : ''}>−</button>
              <span class="stepper-val">${toPersianDigits(item.qty)}</span>
              <button class="stepper-btn" data-act="inc" data-id="${item.id}" aria-label="افزایش تعداد" ${item.qty >= item.stock ? 'disabled' : ''}>+</button>
              <button class="btn-text-danger" data-act="rm" data-id="${item.id}" title="حذف از سبد">حذف</button>
            </div>
          </div>
          <div class="cart-item-subtotal">
            ${toman(item.lineTotal)}
          </div>
        </article>`
      )
      .join('');

    itemsContainer.innerHTML = rowsHtml;

    footerContainer.innerHTML = `
      <div class="promo-teaser-box">
        <span class="promo-tag">تخفیف ویژه</span>
        <span>کد تخفیف دانشجویی: <code>LEARN10</code> (۱۰٪ کسر در تسویه‌حساب)</span>
      </div>
      <div class="drawer-summary-row">
        <span>مجموع اقلام (${toPersianDigits(itemCount)} کالا):</span>
        <strong class="drawer-subtotal-val">${toman(subtotal)}</strong>
      </div>
      <div class="drawer-actions-grid">
        <a href="#/checkout" class="btn btn-primary btn-checkout-drawer" data-act="close-drawer">
          <span>ادامه فرایند خرید و تسویه‌حساب ↵</span>
        </a>
      </div>
    `;
  }

  async bindEvents() {
    await this.redrawItems();

    // Delegated click handler on the drawer root
    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionBtn = target.closest('[data-act]');
      if (!actionBtn) return;

      const act = actionBtn.getAttribute('data-act');
      const id = actionBtn.getAttribute('data-id');

      if (act === 'close-drawer') {
        this.deps.store.set('cartOpen', false);
        return;
      }

      if (!id) return;

      const cart = this.deps.orderService.getCart();
      const currentItem = cart.find((x) => x.productId === id);

      if (act === 'inc') {
        const qty = currentItem ? currentItem.qty + 1 : 1;
        await this.deps.orderService.updateQty(id, qty);
        this.deps.bus.emit('cart:changed');
      } else if (act === 'dec') {
        if (currentItem && currentItem.qty > 1) {
          await this.deps.orderService.updateQty(id, currentItem.qty - 1);
          this.deps.bus.emit('cart:changed');
        }
      } else if (act === 'rm') {
        await this.deps.orderService.removeFromCart(id);
        this.deps.bus.emit('cart:changed');
        this.deps.bus.emit('toast:add', { kind: 'info', text: 'محصول از سبد حذف شد.' });
      }
    });

    // Keyboard listener: Escape closes drawer
    this.listen(document, 'keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Escape' && this.isOpen) {
        this.deps.store.set('cartOpen', false);
      }
    });

    // State listener: cartOpen changes
    this.unsubs.push(
      this.deps.bus.on('state:cartOpen', async (open) => {
        this.isOpen = Boolean(open);
        const backdrop = this.$('.drawer-backdrop');
        const panel = this.$('#cart-drawer-panel');

        if (backdrop && panel) {
          backdrop.classList.toggle('is-active', this.isOpen);
          backdrop.setAttribute('aria-hidden', String(!this.isOpen));
          panel.classList.toggle('is-open', this.isOpen);
          panel.setAttribute('aria-hidden', String(!this.isOpen));

          if (this.isOpen) {
            document.body.classList.add('overflow-hidden');
            await this.redrawItems();
          } else {
            document.body.classList.remove('overflow-hidden');
          }
        }
      })
    );

    // Refresh contents when cart items mutate
    this.unsubs.push(
      this.deps.bus.on('cart:changed', async () => {
        if (this.isOpen) {
          await this.redrawItems();
        }
      })
    );
  }
}
