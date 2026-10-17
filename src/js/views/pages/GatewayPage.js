// @ts-check
/**
 * @fileoverview Mock Shaparak gateway simulator page.
 */
import { Component } from '../../core/Component.js';
import { rial, toman } from '../../utils/formatters.js';
import { isCard } from '../../utils/validators.js';

export class GatewayPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; this.timer = 600; this.otp = null; }
  render() {
    const total = Number(sessionStorage.getItem('gatewayTotal') || 0);
    return `<section class="card stack"><h1>درگاه پرداخت شاپرک (شبیه‌ساز)</h1><p>پذیرنده: فروشگاه آموزشی</p><p>${toman(total)} | ${rial(total)}</p><p id="count">10:00</p><form id="pay-form" class="stack"><input name="card" placeholder="XXXX-XXXX-XXXX-XXXX" maxlength="19" required/><input name="cvv2" placeholder="CVV2" required/><input name="exp" placeholder="MM/YY" required/><div class="cluster"><input name="otp" placeholder="رمز پویا"/><button class="btn" data-act="otp" type="button">دریافت رمز پویا</button></div><div class="cluster"><button class="btn btn-primary" data-act="ok" type="button">پرداخت موفق (Simulate Success)</button><button class="btn" data-act="fail" type="button">انصراف / خطای تراکنش</button></div></form><div id="receipt"></div></section>`;
  }
  bindEvents() {
    if (!this.root) return;
    const interval = setInterval(() => {
      this.timer -= 1;
      const m = String(Math.max(0, Math.floor(this.timer / 60))).padStart(2, '0');
      const s = String(Math.max(0, this.timer % 60)).padStart(2, '0');
      const c = this.root?.querySelector('#count');
      if (c) c.textContent = `${m}:${s}`;
      if (this.timer <= 0) clearInterval(interval);
    }, 1000);
    this.unsubs.push(() => clearInterval(interval));

    const cardInput = /** @type {HTMLInputElement|null} */(this.root.querySelector('[name="card"]'));
    cardInput?.addEventListener('input', () => {
      const digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
      cardInput.value = digits.replace(/(.{4})/g, '$1-').replace(/-$/, '');
    });

    this.root.addEventListener('click', async (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const act = t.closest('[data-act]')?.getAttribute('data-act');
      if (!act) return;
      if (act === 'otp') {
        this.otp = String(Math.floor(100000 + Math.random() * 900000));
        this.deps.bus.emit('toast:add', { kind: 'info', text: `OTP آزمایشی: ${this.otp}` });
      }
      if (act === 'fail') {
        this.deps.bus.emit('toast:add', { kind: 'error', text: 'تراکنش ناموفق بود.' });
        location.hash = '#/checkout';
      }
      if (act === 'ok') {
        const form = /** @type {HTMLFormElement} */(this.root.querySelector('#pay-form'));
        const fd = new FormData(form);
        if (!isCard(String(fd.get('card')))) {
          this.deps.bus.emit('toast:add', { kind: 'error', text: 'شماره کارت معتبر نیست.' });
          return;
        }
        const total = Number(sessionStorage.getItem('gatewayTotal') || 0);
        const order = await this.deps.orderService.placeOrder(total);
        this.deps.bus.emit('cart:changed');
        this.root.querySelector('#receipt').innerHTML = `<article class="card"><h3>رسید دیجیتال</h3><p>پرداخت با موفقیت انجام شد.</p><p>کد رهگیری: <strong>${order.trackingCode}</strong></p><p>مبلغ: ${toman(order.total)}</p><button class="btn" onclick="window.print()">چاپ رسید</button></article>`;
      }
    });
  }
}
