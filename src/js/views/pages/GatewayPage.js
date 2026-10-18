// @ts-check
/**
 * @fileoverview High-Fidelity Interactive Shaparak Payment Gateway Simulator.
 *
 * Architectural Layer: Presentation / Payment Gateway Simulation.
 * Pattern: State Machine / Interactive Transaction Simulator.
 *
 * Educational Importance:
 * Simulates the Iranian national electronic payment infrastructure (شاپرک / Shaparak):
 *  1. Dual-Currency Display: Shows payable amounts in both Tomans and statutory Rials (×10).
 *  2. 16-Digit Card Auto-Formatting: Automatically inserts hyphens as the user types.
 *  3. Dynamic OTP Simulation (رمز پویا): Generates a realistic 6-digit OTP dispatched via Toast
 *     with an enforced 120-second cooldown timer.
 *  4. Deterministic Dual-Branch Testing: Explicit "Simulate Success" and "Simulate Failure" buttons
 *     let students verify both checkout success receipts and failure recovery states.
 */

import { Component } from '../../core/Component.js';
import { jalali, rial, toPersianDigits, toman } from '../../utils/formatters.js';
import { isCard, isCvv2, isExpDate } from '../../utils/validators.js';

export class GatewayPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../core/Store.js').Store<any>} deps.store
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.sessionTimer = 600; // 10 minutes in seconds
    this.otpCooldown = 0; // 120s cooldown
    this.generatedOtp = '';
    this.captchaCode = this.generateCaptcha();
    this.sessionInterval = 0;
    this.otpInterval = 0;
  }

  generateCaptcha() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  render() {
    const rawData = sessionStorage.getItem('gatewayCheckout');
    const checkout = rawData ? JSON.parse(rawData) : null;
    const total = checkout ? checkout.total : 0;

    return `
      <div class="gateway-wrapper">
        <div class="gateway-container card" id="gateway-card">
          <!-- Gateway Official Header -->
          <header class="gateway-header">
            <div class="gateway-branding">
              <div class="shaparak-logo-mock">
                <span class="logo-shield">🛡️</span>
                <div class="logo-text">
                  <strong>سامانه پرداخت الکترونیکی شاپرک</strong>
                  <small class="muted">شبکه الکترونیکی پرداخت کارت — درگاه به پرداخت</small>
                </div>
              </div>
            </div>

            <div class="gateway-session-timer">
              <span class="timer-lbl muted text-sm">زمان باقی‌مانده تراکنش:</span>
              <strong class="timer-counter" id="session-countdown">۱۰:۰۰</strong>
            </div>
          </header>

          <!-- Transaction Summary Banner -->
          <div class="gateway-summary-banner">
            <div class="merchant-info">
              <span class="muted text-sm">پذیرنده اینترنتی:</span>
              <strong>فروشگاه تخصصی سخت‌افزار ویستا</strong>
            </div>
            <div class="payable-amounts">
              <div class="amount-rial">
                <span class="muted text-sm">مبلغ به ریال:</span>
                <strong class="rial-val">${rial(total)}</strong>
              </div>
              <div class="amount-toman">
                <span class="muted text-sm">معادل به تومان:</span>
                <strong class="toman-val">${toman(total)}</strong>
              </div>
            </div>
          </div>

          <!-- Main Payment Form -->
          <form id="gateway-form" class="gateway-form stack gap-md">
            <!-- Card Number Input -->
            <div class="form-group">
              <label for="card-number" class="form-label">شماره ۱۶ رقمی کارت بانکی:</label>
              <div class="input-with-icon">
                <input
                  id="card-number"
                  name="cardNumber"
                  type="text"
                  dir="ltr"
                  maxlength="19"
                  class="input-field card-input text-left"
                  placeholder="6037-9918-1234-5678"
                  value="6037-9918-7241-8854"
                  required
                />
                <span class="card-bank-icon" id="card-bank-icon">💳</span>
              </div>
              <small class="muted text-sm">شماره کارت آزمایشی برای تکمیل فرایند خرید وارد شده است.</small>
            </div>

            <!-- CVV2 and Expiration Date -->
            <div class="form-row">
              <div class="form-group">
                <label for="card-cvv2" class="form-label">کد شناسایی دوم (CVV2):</label>
                <input
                  id="card-cvv2"
                  name="cvv2"
                  type="password"
                  dir="ltr"
                  maxlength="4"
                  class="input-field text-left"
                  placeholder="•••"
                  value="482"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">تاریخ انقضای کارت:</label>
                <div class="exp-date-row">
                  <input
                    id="card-exp-month"
                    name="expMonth"
                    type="text"
                    dir="ltr"
                    maxlength="2"
                    class="input-field text-center"
                    placeholder="ماه (۰۸)"
                    value="08"
                    required
                  />
                  <span class="slash">/</span>
                  <input
                    id="card-exp-year"
                    name="expYear"
                    type="text"
                    dir="ltr"
                    maxlength="2"
                    class="input-field text-center"
                    placeholder="سال (۰۶)"
                    value="06"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Dynamic OTP (رمز پویا) -->
            <div class="form-group">
              <label for="card-otp" class="form-label">رمز دوم پویا (OTP):</label>
              <div class="otp-input-row">
                <input
                  id="card-otp"
                  name="otp"
                  type="text"
                  dir="ltr"
                  maxlength="6"
                  class="input-field text-left"
                  placeholder="کد ۶ رقمی پیامک‌شده"
                  required
                />
                <button
                  type="button"
                  class="btn btn-secondary btn-request-otp"
                  id="btn-request-otp"
                  data-act="request-otp"
                >
                  <span>دریافت رمز پویا</span>
                </button>
              </div>
            </div>

            <!-- Captcha Security Code -->
            <div class="form-group">
              <label for="captcha-input" class="form-label">کد امنیتی داخل تصویر:</label>
              <div class="captcha-row">
                <input
                  id="captcha-input"
                  name="captcha"
                  type="text"
                  dir="ltr"
                  maxlength="4"
                  class="input-field text-center"
                  placeholder="کد تصویر"
                  value="${this.captchaCode}"
                  required
                />
                <div class="captcha-badge" id="captcha-display" title="کد امنیتی شبیه‌سازی‌شده">
                  ${this.captchaCode}
                </div>
                <button type="button" class="btn btn-icon" data-act="refresh-captcha" title="تغییر کد امنیتی">🔄</button>
              </div>
            </div>

            <!-- Action Buttons: Success vs Failure Simulator -->
            <div class="gateway-actions-row">
              <button type="button" class="btn btn-primary btn-pay-success" data-act="simulate-success">
                <span>✓ پرداخت موفق (Simulate Success)</span>
              </button>
              <button type="button" class="btn btn-ghost text-danger btn-pay-fail" data-act="simulate-failure">
                <span>✕ انصراف / خطای تراکنش</span>
              </button>
            </div>
          </form>

          <!-- Printable Digital Receipt Container -->
          <div id="gateway-receipt-area"></div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    if (!this.root) return;

    // Start 10-Minute Session Countdown
    const countdownEl = this.$('#session-countdown');
    this.sessionInterval = setInterval(() => {
      this.sessionTimer -= 1;
      const mins = Math.max(0, Math.floor(this.sessionTimer / 60));
      const secs = Math.max(0, this.sessionTimer % 60);

      if (countdownEl) {
        countdownEl.textContent = `${toPersianDigits(String(mins).padStart(2, '0'))}:${toPersianDigits(String(secs).padStart(2, '0'))}`;
      }

      if (this.sessionTimer <= 0) {
        clearInterval(this.sessionInterval);
        this.deps.bus.emit('toast:add', { kind: 'error', text: 'مهلت تراکنش بانکی به پایان رسید.' });
        location.hash = '#/checkout';
      }
    }, 1000);

    this.unsubs.push(() => {
      clearInterval(this.sessionInterval);
      clearInterval(this.otpInterval);
    });

    // Auto-Format Card Number Input with Hyphens
    const cardInput = /** @type {HTMLInputElement|null} */ (this.$('#card-number'));
    cardInput?.addEventListener('input', () => {
      const raw = cardInput.value.replace(/\D/g, '').slice(0, 16);
      cardInput.value = raw.replace(/(\d{4})(?=\d)/g, '$1-');
    });

    // Delegated click listeners
    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;

      const act = actionEl.getAttribute('data-act');

      if (act === 'refresh-captcha') {
        this.captchaCode = this.generateCaptcha();
        const display = this.$('#captcha-display');
        const input = /** @type {HTMLInputElement|null} */ (this.$('#captcha-input'));
        if (display) display.textContent = this.captchaCode;
        if (input) input.value = this.captchaCode;
      } else if (act === 'request-otp') {
        if (this.otpCooldown > 0) return;

        // Generate 6-digit random code
        this.generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
        const otpInput = /** @type {HTMLInputElement|null} */ (this.$('#card-otp'));
        if (otpInput) otpInput.value = this.generatedOtp;

        this.deps.bus.emit('toast:add', {
          kind: 'info',
          duration: 8000,
          text: `📩 پیامک بانکی: رمز دوم پویای شما ${toPersianDigits(this.generatedOtp)} است. کد برای شما درج شد.`
        });

        // Start 120s cooldown
        this.otpCooldown = 120;
        const otpBtn = this.$('#btn-request-otp');
        clearInterval(this.otpInterval);

        this.otpInterval = setInterval(() => {
          this.otpCooldown -= 1;
          if (otpBtn) {
            if (this.otpCooldown > 0) {
              otpBtn.setAttribute('disabled', 'true');
              otpBtn.textContent = `ارسال مجدد (${toPersianDigits(this.otpCooldown)} ثانیه)`;
            } else {
              otpBtn.removeAttribute('disabled');
              otpBtn.textContent = 'دریافت رمز پویا';
              clearInterval(this.otpInterval);
            }
          }
        }, 1000);
      } else if (act === 'simulate-failure') {
        clearInterval(this.sessionInterval);
        clearInterval(this.otpInterval);
        this.deps.bus.emit('toast:add', {
          kind: 'error',
          text: 'تراکنش توسط کاربر لغو شد یا موجودی حساب کافی نبود.'
        });
        location.hash = '#/checkout';
      } else if (act === 'simulate-success') {
        await this.handlePaymentSuccess();
      }
    });
  }

  async handlePaymentSuccess() {
    const rawData = sessionStorage.getItem('gatewayCheckout');
    if (!rawData) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: 'اطلاعات پرداخت معتبر نیست.' });
      location.hash = '#/checkout';
      return;
    }

    const checkout = JSON.parse(rawData);

    // Validate Card Number and CVV2
    const cardInput = /** @type {HTMLInputElement|null} */ (this.$('#card-number'));
    const cvv2Input = /** @type {HTMLInputElement|null} */ (this.$('#card-cvv2'));
    const expM = /** @type {HTMLInputElement|null} */ (this.$('#card-exp-month'));
    const expY = /** @type {HTMLInputElement|null} */ (this.$('#card-exp-year'));

    const cardNumber = cardInput ? cardInput.value.trim() : '';
    const cvv2 = cvv2Input ? cvv2Input.value.trim() : '';
    const expDate = `${expM ? expM.value.trim() : ''}/${expY ? expY.value.trim() : ''}`;

    if (!isCard(cardNumber)) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: 'شماره کارت وارد شده ۱۶ رقم معتبر نیست.' });
      return;
    }

    if (!isCvv2(cvv2)) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: 'کد CVV2 باید ۳ یا ۴ رقم باشد.' });
      return;
    }

    if (!isExpDate(expDate)) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: 'تاریخ انقضای کارت نامعتبر است.' });
      return;
    }

    try {
      // Place official order in OrderRepository
      const order = await this.deps.orderService.placeOrder({
        total: checkout.total,
        address: checkout.address,
        phone: checkout.phone,
        promoCode: checkout.promoCode
      });

      clearInterval(this.sessionInterval);
      clearInterval(this.otpInterval);
      sessionStorage.removeItem('gatewayCheckout');
      this.deps.bus.emit('cart:changed');

      // Hide payment form and render printable digital receipt
      const formEl = this.$('#gateway-form');
      if (formEl) formEl.classList.add('hidden');

      const receiptMount = this.$('#gateway-receipt-area');
      if (receiptMount) {
        receiptMount.innerHTML = `
          <article class="receipt-card card stack gap-md" id="printable-receipt">
            <div class="receipt-header">
              <div class="receipt-success-icon">✓</div>
              <h2 class="receipt-title">تراکنش با موفقیت انجام شد</h2>
              <p class="muted text-sm">رسید الکترونیکی پرداخت شاپرک — فروشگاه تخصصی سخت‌افزار ویستا</p>
            </div>

            <div class="receipt-details-grid">
              <div class="receipt-row">
                <span class="receipt-label">شماره پیگیری بانکی (RRN):</span>
                <strong class="receipt-val tracking-code">${toPersianDigits(order.trackingCode)}</strong>
              </div>

              <div class="receipt-row">
                <span class="receipt-label">مبلغ پرداختی:</span>
                <strong class="receipt-val text-success">${toman(order.total)} (${rial(order.total)})</strong>
              </div>

              <div class="receipt-row">
                <span class="receipt-label">کارت مبدا:</span>
                <span class="receipt-val">${toPersianDigits(cardNumber.slice(0, 4))}-****-****-${toPersianDigits(cardNumber.slice(-4))}</span>
              </div>

              <div class="receipt-row">
                <span class="receipt-label">تاریخ و زمان تراکنش:</span>
                <span class="receipt-val">${jalali(order.createdAt)}</span>
              </div>

              <div class="receipt-row">
                <span class="receipt-label">وضعیت سفارش:</span>
                <span class="badge badge-success">پرداخت موفق — در صف آماده‌سازی</span>
              </div>
            </div>

            <div class="receipt-actions no-print">
              <button class="btn btn-secondary btn-print-receipt" onclick="window.print()">
                <span>🖨️ چاپ فاکتور / ذخیره PDF</span>
              </button>
              <a href="#/profile" class="btn btn-primary">
                <span>مشاهده سفارش در پنل کاربری ↵</span>
              </a>
            </div>
          </article>
        `;
      }

      this.deps.bus.emit('toast:add', {
        kind: 'success',
        duration: 5000,
        text: `پرداخت با موفقیت ثبت شد. کد رهگیری شما: ${order.trackingCode}`
      });
    } catch (err) {
      this.deps.bus.emit('toast:add', { kind: 'error', text: /** @type {Error} */ (err).message });
    }
  }
}
