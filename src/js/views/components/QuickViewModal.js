// @ts-check
/**
 * @fileoverview Accessible Quick-View Product Modal Dialog.
 *
 * Architectural Layer: Presentation / Overlay Modal Component.
 * Pattern: Component Pattern + WAI-ARIA Dialog Modal.
 *
 * Educational Concepts:
 * 1. Accessibility (a11y) Modal Contract:
 *    - Uses `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="modal-prod-title"`.
 *    - Listens for the `Escape` keyboard event to dismiss the dialog.
 *    - Traps keyboard focus inside the dialog while active (`trapFocus`).
 *    - Prevents background page scrolling via `document.body.classList.toggle('overflow-hidden')`.
 * 2. Event-Driven Invocation:
 *    Instead of page components manually constructing modals, they simply emit
 *    `bus.emit('product:quickView', productId)`. The QuickViewModal observes this
 *    event, queries the service, and manages its own DOM lifecycle.
 */

import { Component } from '../../core/Component.js';
import { toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml, trapFocus } from '../../utils/dom.js';

export class QuickViewModal extends Component {
  /**
   * @param {Element|null} root - Host container (#modal-root).
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    /** @type {(() => void)|null} */
    this.releaseFocusTrap = null;
    this.currentQty = 1;
  }

  render() {
    return `<div id="quick-view-container"></div>`;
  }

  close() {
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
    document.body.classList.remove('overflow-hidden');
    const container = this.$('#quick-view-container');
    if (container) container.innerHTML = '';
    this.deps.bus.emit('product:quickView', null);
  }

  /**
   * @param {import('../../types/typedefs.js').Product} product
   * @param {boolean} inWishlist
   * @param {number} effectivePrice
   * @param {string} specsHtml
   * @returns {string}
   */
  buildModalHtml(product, inWishlist, effectivePrice, specsHtml) {
    return `
      <div class="modal-backdrop is-active" data-act="backdrop">
        <div
          class="modal-dialog bento-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-prod-title"
        >
          <button class="btn btn-icon btn-modal-close" data-act="close" aria-label="بستن پنجره">✕</button>

          <div class="modal-grid">
            <div class="modal-visual-wrap">
              <img src="${product.image}" alt="${escapeHtml(product.name)}" class="modal-img" />
              ${product.badge ? `<span class="badge badge-hero">${escapeHtml(product.badge)}</span>` : ''}
            </div>

            <div class="modal-info-wrap">
              <div class="modal-header-badges">
                <span class="badge badge-category">${escapeHtml(product.category)}</span>
                <span class="modal-rating">★ ${toPersianDigits(product.rating.toFixed(1))}</span>
                <span class="modal-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                  ${product.stock > 0 ? `موجود در انبار (${toPersianDigits(product.stock)} عدد)` : 'ناموجود'}
                </span>
              </div>

              <h2 id="modal-prod-title" class="modal-title">${escapeHtml(product.name)}</h2>
              <p class="modal-desc muted">${escapeHtml(product.description)}</p>

              ${specsHtml ? `<div class="modal-specs-box"><h4>مشخصات فنی مهندسی</h4>${specsHtml}</div>` : ''}

              <div class="modal-pricing-box">
                ${
                  product.discount > 0
                    ? `
                  <div class="price-discount-row">
                    <span class="original-price">${toman(product.price)}</span>
                    <span class="discount-pill">${toPersianDigits(product.discount)}٪ تخفیف</span>
                  </div>`
                    : ''
                }
                <div class="final-price-row">
                  <span class="price-label">قیمت نهایی:</span>
                  <strong class="final-price-val">${toman(effectivePrice)}</strong>
                </div>
              </div>

              <div class="modal-actions-row">
                <div class="modal-stepper">
                  <button class="stepper-btn" data-act="qty-dec" ${this.currentQty <= 1 ? 'disabled' : ''}>−</button>
                  <span class="stepper-val" id="modal-qty-val">${toPersianDigits(this.currentQty)}</span>
                  <button class="stepper-btn" data-act="qty-inc" ${this.currentQty >= product.stock ? 'disabled' : ''}>+</button>
                </div>

                <button
                  class="btn btn-primary btn-modal-cart"
                  data-act="add-to-cart"
                  data-id="${product.id}"
                  ${product.stock === 0 ? 'disabled' : ''}
                >
                  <span>${product.stock > 0 ? 'افزودن به سبد خرید' : 'اتمام موجودی'}</span>
                </button>

                <button
                  class="btn btn-icon btn-wishlist ${inWishlist ? 'is-wished' : ''}"
                  data-act="toggle-wishlist"
                  data-id="${product.id}"
                  title="${inWishlist ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}"
                  aria-label="علاقه‌مندی"
                >
                  ${inWishlist ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * @param {import('../../types/typedefs.js').Product} product
   */
  openModal(product) {
    const container = /** @type {HTMLElement|null} */ (this.$('#quick-view-container'));
    if (!container) return;

    this.currentQty = 1;
    const inWishlist = this.deps.authService.isInWishlist(product.id);
    const effectivePrice = Math.round(product.price * (1 - (product.discount || 0) / 100));

    const specsHtml = product.specs
      ? Object.entries(product.specs)
          .map(([key, val]) => `<div class="spec-row"><span class="spec-label">${escapeHtml(key)}:</span><span class="spec-value">${escapeHtml(val)}</span></div>`)
          .join('')
      : '';

    container.innerHTML = this.buildModalHtml(product, inWishlist, effectivePrice, specsHtml);
    document.body.classList.add('overflow-hidden');

    const dialogEl = /** @type {HTMLElement|null} */ (container.querySelector('.modal-dialog'));
    if (dialogEl) {
      this.releaseFocusTrap = trapFocus(dialogEl);
    }

    container.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
      this.handleBackdropClick(e, product, container);
    });
  }

  /**
   * @param {Event} e
   * @param {import('../../types/typedefs.js').Product} product
   * @param {HTMLElement} container
   */
  async handleBackdropClick(e, product, container) {
    const target = /** @type {HTMLElement} */ (e.target);
    const actEl = target.closest('[data-act]');
    if (!actEl) return;

    const act = actEl.getAttribute('data-act');
    if (act === 'close' || act === 'backdrop') {
      this.close();
    } else if (act === 'qty-inc' || act === 'qty-dec') {
      this.handleQtyStep(act, product, container);
    } else if (act === 'add-to-cart') {
      await this.handleAddToCart(product);
    } else if (act === 'toggle-wishlist') {
      await this.handleWishlistToggle(actEl, product);
    }
  }

  /**
   * @param {string} act
   * @param {import('../../types/typedefs.js').Product} product
   * @param {HTMLElement} container
   */
  handleQtyStep(act, product, container) {
    if (act === 'qty-inc' && this.currentQty < product.stock) {
      this.currentQty += 1;
    } else if (act === 'qty-dec' && this.currentQty > 1) {
      this.currentQty -= 1;
    }
    const valEl = container.querySelector('#modal-qty-val');
    if (valEl) valEl.textContent = toPersianDigits(this.currentQty);
  }

  /**
   * @param {import('../../types/typedefs.js').Product} product
   */
  async handleAddToCart(product) {
    await this.deps.orderService.addToCart(product.id, this.currentQty);
    this.deps.bus.emit('cart:changed');
    this.deps.bus.emit('toast:add', {
      kind: 'success',
      text: `${this.currentQty > 1 ? toPersianDigits(this.currentQty) + ' عدد از ' : ''}«${product.name}» به سبد خرید اضافه شد.`
    });
    this.close();
  }

  /**
   * @param {Element} actEl
   * @param {import('../../types/typedefs.js').Product} product
   */
  async handleWishlistToggle(actEl, product) {
    try {
      const res = await this.deps.authService.toggleWishlist(product.id);
      actEl.classList.toggle('is-wished', res.inWishlist);
      actEl.textContent = res.inWishlist ? '❤️' : '🤍';
      this.deps.bus.emit('toast:add', {
        kind: res.inWishlist ? 'success' : 'info',
        text: res.inWishlist ? 'محصول به فهرست علاقه‌مندی‌ها افزوده شد.' : 'محصول از علاقه‌مندی‌ها حذف شد.'
      });
    } catch (err) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: /** @type {Error} */ (err).message });
    }
  }

  bindEvents() {
    this.listen(document, 'keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Escape') {
        this.close();
      }
    });

    this.unsubs.push(
      this.deps.bus.on('product:quickView', async (productId) => {
        if (!productId) {
          const container = this.$('#quick-view-container');
          if (container) container.innerHTML = '';
          return;
        }

        const product = await this.deps.productService.byId(productId);
        if (product) {
          this.openModal(product);
        }
      })
    );
  }
}
