// @ts-check
/**
 * @fileoverview Checkout Page: Shipping address validation, item review, and promo code evaluation.
 *
 * Architectural Layer: Presentation / Checkout Process Page.
 * Pattern: Page Component + Form Validation Strategy.
 *
 * Educational Concepts:
 * 1. Form Validation Chain:
 *    Checks required shipping address, Iranian mobile phone pattern (`09xxxxxxxxx`),
 *    and promo coupon logic before packaging state into `sessionStorage` for the gateway.
 * 2. Immutable Price Computation:
 *    Discounts and subtotals are evaluated directly through `OrderService`, preventing
 *    arbitrary client-side price tampering.
 */

import { Component } from '../../core/Component.js';
import { toPersianDigits, toman } from '../../utils/formatters.js';
import { isPhone, minLen } from '../../utils/validators.js';
import { escapeHtml } from '../../utils/dom.js';

export class CheckoutPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.appliedPromoCode = '';
  }

  render() {
    return `<div id="checkout-mount-point" class="checkout-container"></div>`;
  }

  async bindEvents() {
    const mount = this.$('#checkout-mount-point');
    if (!mount) return;

    await this.renderCheckout(mount);

    // Delegated actions inside checkout view
    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;

      const act = actionEl.getAttribute('data-act');

      if (act === 'apply-promo') {
        const promoInput = /** @type {HTMLInputElement|null} */ (this.$('#promo-input'));
        const code = promoInput ? promoInput.value.trim() : '';

        const { subtotal } = await this.deps.orderService.getCartSummary();
        const promoRes = this.deps.orderService.promoDiscount(code, subtotal);

        if (promoRes.valid) {
          this.appliedPromoCode = code;
          this.deps.bus.emit('toast:add', { kind: 'success', text: promoRes.message });
          await this.renderCheckout(mount);
        } else {
          this.deps.bus.emit('toast:add', { kind: 'error', text: promoRes.message });
        }
      }
    });

    // Form submit listener
    this.listen(this.root, 'submit', async (e) => {
      const form = /** @type {HTMLFormElement} */ (e.target);
      if (form.id !== 'checkout-details-form') return;
      e.preventDefault();

      const fd = new FormData(form);
      const address = String(fd.get('address') || '').trim();
      const phone = String(fd.get('phone') || '').trim();

      if (!minLen(address, 10)) {
        this.deps.bus.emit('toast:add', { kind: 'error', text: 'لطفاً نشانی پستی دقیق و معتبر وارد کنید (حداقل ۱۰ حرف).' });
        return;
      }

      if (!isPhone(phone)) {
        this.deps.bus.emit('toast:add', { kind: 'error', text: 'شماره تلفن همراه وارد شده معتبر نیست (مثال: 09123456789).' });
        return;
      }

      const { subtotal } = await this.deps.orderService.getCartSummary();
      const promo = this.deps.orderService.promoDiscount(this.appliedPromoCode, subtotal);
      const payableTotal = Math.max(0, subtotal - promo.discountAmount);

      // Save checkout payload to sessionStorage for payment gateway simulator
      sessionStorage.setItem(
        'gatewayCheckout',
        JSON.stringify({
          address,
          phone,
          promoCode: this.appliedPromoCode,
          subtotal,
          discount: promo.discountAmount,
          total: payableTotal,
          initiatedAt: Date.now()
        })
      );

      location.hash = '#/gateway';
    });
  }

  /**
   * @param {Element} mount
   */
  async renderCheckout(mount) {
    const { items, subtotal, itemCount } = await this.deps.orderService.getCartSummary();

    if (items.length === 0) {
      mount.innerHTML = `
        <div class="card empty-state">
          <div class="empty-icon">🛍️</div>
          <h2>سبد خرید شما خالی است</h2>
          <p class="muted">برای ورود به مرحله تسویه‌حساب، ابتدا کالاهایی را به سبد بیفزایید.</p>
          <a href="#/products" class="btn btn-primary">مشاهده ویترین محصولات</a>
        </div>
      `;
      return;
    }

    const promo = this.deps.orderService.promoDiscount(this.appliedPromoCode, subtotal);
    const finalTotal = Math.max(0, subtotal - promo.discountAmount);

    const itemsSummaryHtml = items
      .map(
        (it) => `
        <div class="checkout-item-row">
          <div class="checkout-item-meta">
            <img src="${it.image}" alt="" width="48" height="36" class="checkout-thumb" />
            <div>
              <strong class="checkout-item-name">${escapeHtml(it.name)}</strong>
              <div class="muted text-sm">${toPersianDigits(it.qty)} عدد × ${toman(Math.round(it.price * (1 - (it.discount || 0) / 100)))}</div>
            </div>
          </div>
          <strong class="checkout-item-total">${toman(it.lineTotal)}</strong>
        </div>`
      )
      .join('');

    mount.innerHTML = `
      <div class="checkout-grid stack gap-xl">
        <!-- Page Title Header -->
        <header class="checkout-header card">
          <span class="badge badge-hero">گام نهایی خرید</span>
          <h1>ثبت اطلاعات ارسال و تسویه‌حساب</h1>
          <p class="muted">نشانی پستی گیرنده و اطلاعات تماس را وارد نموده و به درگاه امن پرداخت متصل شوید.</p>
        </header>

        <div class="checkout-layout">
          <!-- Left Column: Shipping Form & Promo Input -->
          <section class="checkout-form-section card">
            <h3 class="section-title">📍 نشانی پستی و مشخصات تحویل‌گیرنده</h3>

            <form id="checkout-details-form" class="stack gap-md">
              <div class="form-group">
                <label for="shipping-address" class="form-label">نشانی کامل پستی (شامل شهر، خیابان، پلاک و کدپستی):</label>
                <textarea
                  id="shipping-address"
                  name="address"
                  rows="3"
                  class="input-field"
                  placeholder="تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ..."
                  required
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="shipping-phone" class="form-label">شماره تلفن همراه (برای هماهنگی تحویل):</label>
                  <input
                    id="shipping-phone"
                    name="phone"
                    type="tel"
                    dir="ltr"
                    class="input-field text-left"
                    placeholder="09123456789"
                    required
                  />
                </div>
              </div>

              <!-- Promo Code Box -->
              <div class="promo-input-box card">
                <label for="promo-input" class="form-label">کد تخفیف:</label>
                <div class="promo-input-row">
                  <input
                    id="promo-input"
                    type="text"
                    dir="ltr"
                    class="input-field text-left"
                    placeholder="LEARN10"
                    value="${escapeHtml(this.appliedPromoCode)}"
                  />
                  <button type="button" class="btn btn-secondary" data-act="apply-promo">
                    اعمال تخفیف
                  </button>
                </div>
                <small class="muted">کد نمونه: <code>LEARN10</code> برای ۱۰٪ تخفیف یا <code>TECH20</code> برای ۲۰٪</small>
              </div>

              <button type="submit" class="btn btn-primary btn-lg btn-to-gateway">
                <span>اتصال به درگاه امن پرداخت شاپرک</span>
                <span>🔒 ↵</span>
              </button>
            </form>
          </section>

          <!-- Right Column: Order Summary Card -->
          <aside class="checkout-summary-section card stack gap-md">
            <h3 class="section-title">خلاصه سبد سفارش (${toPersianDigits(itemCount)} قلم)</h3>

            <div class="checkout-items-stack">
              ${itemsSummaryHtml}
            </div>

            <div class="summary-breakdown-box">
              <div class="breakdown-row">
                <span class="muted">مجموع بهای کالاها:</span>
                <span>${toman(subtotal)}</span>
              </div>

              ${
                promo.discountAmount > 0
                  ? `
                <div class="breakdown-row discount-row text-success">
                  <span>تخفیف کوپن (${toPersianDigits(promo.percent)}٪):</span>
                  <span>− ${toman(promo.discountAmount)}</span>
                </div>`
                  : ''
              }

              <div class="breakdown-row">
                <span class="muted">هزینه بسته‌بندی و ارسال بیمه:</span>
                <span class="badge badge-success">رایگان</span>
              </div>

              <div class="breakdown-row total-row">
                <strong>مبلغ قابل پرداخت در درگاه:</strong>
                <strong class="total-price-large">${toman(finalTotal)}</strong>
              </div>
            </div>

            <div class="security-guarantee-note muted text-sm">
              🛡️ تمامی پرداخت‌ها در بستر شاپرک پردازش می‌شوند و تا ۷ روز ضمانت بازگشت وجه دارند.
            </div>
          </aside>
        </div>
      </div>
    `;
  }
}
