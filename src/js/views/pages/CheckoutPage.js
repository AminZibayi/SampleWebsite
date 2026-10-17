// @ts-check
/**
 * @fileoverview Checkout page with promo validation and address fields.
 */
import { Component } from '../../core/Component.js';
import { toman } from '../../utils/formatters.js';

export class CheckoutPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; this.off = 0; }
  render() {
    const cart = this.deps.orderService.getCart();
    return `<section class="stack"><h1>تسویه‌حساب</h1><div class="card">${cart.length} آیتم در سبد دارید.</div><form id="checkout-form" class="card stack"><input name="address" placeholder="آدرس ارسال" required/><input name="phone" placeholder="شماره تماس" required/><div class="cluster"><input name="promo" placeholder="کد تخفیف"/><button class="btn" type="button" data-act="promo">اعمال</button></div><p id="final-price" class="muted">برای ادامه به درگاه بروید.</p><button class="btn btn-primary">ورود به درگاه</button></form></section>`;
  }
  async bindEvents() {
    if (!this.root) return;
    const recalc = async () => {
      const products = await this.deps.orderService.storage.get('products');
      const base = this.deps.orderService.getCart().reduce((sum, i) => {
        const p = products.find((x) => x.id === i.productId);
        return sum + (p ? p.price * i.qty : 0);
      }, 0);
      const final = Math.round(base * (1 - this.off));
      const p = this.root?.querySelector('#final-price');
      if (p) p.textContent = `مبلغ قابل پرداخت: ${toman(final)}`;
      return final;
    };
    await recalc();
    this.root.addEventListener('click', async (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      if (t.closest('[data-act="promo"]')) {
        const code = String((/** @type {HTMLInputElement} */(this.root.querySelector('[name="promo"]'))).value || '');
        this.off = this.deps.orderService.promoOff(code);
        this.deps.bus.emit('toast:add', { kind: this.off ? 'success' : 'warning', text: this.off ? 'تخفیف اعمال شد.' : 'کد معتبر نیست.' });
        await recalc();
      }
    });
    this.root.querySelector('#checkout-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const final = await recalc();
      sessionStorage.setItem('gatewayTotal', String(final));
      location.hash = '#/gateway';
    });
  }
}
