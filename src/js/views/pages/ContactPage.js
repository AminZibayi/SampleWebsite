// @ts-check
/**
 * @fileoverview Contact Us Page: Interactive customer support form, FAQ accordion, and store map.
 *
 * Architectural Layer: Presentation / Support & Engagement Page.
 * Pattern: Page Component + Accordion Pattern.
 *
 * Educational Concepts:
 * 1. Accessible Accordion Pattern:
 *    Toggling FAQ sections updates `aria-expanded="true|false"` on the trigger button
 *    and controls the visibility of the corresponding panel with smooth CSS transitions.
 * 2. Visual Placeholders without External Assets:
 *    Interactive SVG map mockup rendered with pure inline SVG, eliminating external Google Maps
 *    API script overhead and tracking cookies.
 */

import { Component } from '../../core/Component.js';
import { isEmail, minLen } from '../../utils/validators.js';

export class ContactPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/FeedbackService.js').FeedbackService} deps.feedbackService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
  }

  render() {
    return `
      <div class="contact-page-container stack gap-xl">
        <!-- Header Hero -->
        <header class="contact-hero card">
          <span class="badge badge-hero">مرکز پشتیبانی و ارتباط</span>
          <h1 class="contact-title">همراه و پاسخگوی پرسش‌های شما هستیم</h1>
          <p class="muted">
            تیم کارشناسی فنی ما آماده راهنمایی شما در انتخاب سخت‌افزار، تجهیز استودیو و پیگیری سفارش‌ها است.
          </p>
        </header>

        <div class="contact-grid">
          <!-- Left Column: Support Contact Form -->
          <section class="contact-form-section card">
            <h3 class="section-title">✉️ ارسال پیام یا درخواست مشاوره</h3>
            <p class="muted text-sm">فرم زیر را تکمیل فرمایید؛ کارشناسان در کمتر از ۲ ساعت کاری پاسخ خواهند داد.</p>

            <form id="contact-support-form" class="stack gap-md">
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-name" class="form-label">نام و نام خانوادگی:</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    class="input-field"
                    placeholder="سهراب سپهری"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="contact-email" class="form-label">پست الکترونیکی:</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    dir="ltr"
                    class="input-field text-left"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="contact-subject" class="form-label">موضوع پیام:</label>
                <select id="contact-subject" name="subject" class="input-field" required>
                  <option value="مشاوره خرید سخت‌افزار">💻 مشاوره پیش از خرید سخت‌افزار</option>
                  <option value="پیگیری سفارش">📦 پیگیری وضعیت ارسال مرسوله</option>
                  <option value="خدمات گارانتی">🛡️ خدمات پس از فروش و گارانتی</option>
                  <option value="همکاری سازمانی">🤝 همکاری تجاری و تامین تجهیزات</option>
                </select>
              </div>

              <div class="form-group">
                <label for="contact-message" class="form-label">متن پیام یا سوال:</label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  class="input-field textarea-field"
                  placeholder="شرح سوال یا جزئیات سفارش..."
                  required
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-submit-contact">
                <span>ارسال پیام به پشتیبانی</span>
                <span>↵</span>
              </button>
            </form>
          </section>

          <!-- Right Column: Location Map & Working Hours -->
          <aside class="contact-info-aside stack gap-md">
            <!-- Map Visualization Card -->
            <div class="card map-card">
              <h3 class="section-title">📍 نشانی استودیوی مرکزی و شوروم</h3>
              <div class="map-placeholder-box">
                <svg viewBox="0 0 400 220" width="100%" height="100%" class="map-svg">
                  <rect width="400" height="220" fill="var(--color-surface-alt)" rx="12" />
                  <!-- Grid streets -->
                  <path d="M0,60 H400 M0,140 H400 M100,0 V220 M260,0 V220" stroke="var(--border-default)" stroke-width="2" />
                  <path d="M40,0 L360,220" stroke="var(--border-default)" stroke-width="3" stroke-dasharray="4 4" />
                  <!-- Location Pin -->
                  <circle cx="260" cy="140" r="14" fill="var(--color-primary)" opacity="0.25" />
                  <circle cx="260" cy="140" r="7" fill="var(--color-primary)" />
                  <text x="260" y="175" fill="var(--color-text)" font-family="system-ui" font-size="12" font-weight="bold" text-anchor="middle">شوروم مرکزی ویستا</text>
                </svg>
              </div>
              <div class="contact-details-list text-sm stack gap-xs muted">
                <div><strong>نشانی:</strong> تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج فناوری، طبقه ۷</div>
                <div><strong>کد پستی:</strong> ۱۹۶۹۸۵۵۴۴۱</div>
              </div>
            </div>

            <!-- Hours and Channels Card -->
            <div class="card hours-card">
              <h3 class="section-title">⏰ ساعات کاری و تماس مستقیم</h3>
              <ul class="hours-list stack gap-xs text-sm muted">
                <li>• شنبه تا چهارشنبه: <strong>۹:۰۰ الی ۱۸:۰۰</strong></li>
                <li>• پنج‌شنبه‌ها: <strong>۹:۰۰ الی ۱۳:۳۰</strong></li>
                <li>• جمعه و تعطیلات رسمی: <strong>پشتیبانی آنلاین تیکت فعال</strong></li>
              </ul>
              <div class="callout-tel">
                <span class="tel-icon">📞</span>
                <strong>۰۲۱-۸۸۹۹۲۲۱۱</strong>
              </div>
            </div>
          </aside>
        </div>

        <!-- Section 3: Interactive FAQ Accordion -->
        <section class="card faq-section" aria-labelledby="faq-title">
          <div class="faq-header">
            <span class="badge badge-accent">راهنمای خریداران</span>
            <h2 id="faq-title">پرسش‌های متداول مشتریان (FAQ)</h2>
          </div>

          <div class="faq-accordion-stack stack gap-sm">
            <div class="faq-item">
              <button class="faq-trigger" aria-expanded="false" data-act="toggle-faq">
                <span class="faq-question">آیا امکان بازگشت کالا و انصراف از خرید وجود دارد؟</span>
                <span class="faq-icon">▾</span>
              </button>
              <div class="faq-content hidden">
                <p class="muted">
                  بله، مطابق قوانین تجارت الکترونیک، تمامی محصولات آکبند تا ۷ روز در صورت باز نشدن پلمپ کارخانه‌ای قابل تعویض یا استرداد وجه هستند.
                </p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-trigger" aria-expanded="false" data-act="toggle-faq">
                <span class="faq-question">مدت زمان ارسال مرسوله‌ها به تهران و شهرستان‌ها چقدر است؟</span>
                <span class="faq-icon">▾</span>
              </button>
              <div class="faq-content hidden">
                <p class="muted">
                  سفارش‌های تهران در صورت ثبت تا ساعت ۱۴، در همان روز کاری توسط پیک اختصاصی تحویل می‌گردند. مرسوله‌های شهرستان‌ها از طریق پست پیشتاز با کد رهگیری ظرف ۲۴ الی ۴۸ ساعت کاری ارسال می‌شوند.
                </p>
              </div>
            </div>

            <div class="faq-item">
              <button class="faq-trigger" aria-expanded="false" data-act="toggle-faq">
                <span class="faq-question">چگونه می‌توانم از اصالت کالا و گارانتی مطمئن شوم؟</span>
                <span class="faq-icon">▾</span>
              </button>
              <div class="faq-content hidden">
                <p class="muted">
                  کلیه کالاهای ارائه شده در فروشگاه دارای ضمانت اصالت فیزیکی و هولوگرام رسمی نماینده قانونی بوده و شماره سریال کالا در فاکتور رسمی ثبت می‌گردد.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  bindEvents() {
    if (!this.root) return;

    // Contact Form Submission
    const form = /** @type {HTMLFormElement|null} */ (this.$('#contact-support-form'));
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const message = String(fd.get('message') || '').trim();

      if (!name || !isEmail(email) || !minLen(message, 8)) {
        this.deps.bus.emit('toast:add', {
          kind: 'error',
          text: 'لطفاً نام، آدرس ایمیل معتبر و پیام خود را کامل وارد نمایید.'
        });
        return;
      }

      this.deps.bus.emit('toast:add', {
        kind: 'success',
        text: 'پیام شما با موفقیت دریافت شد؛ کارشناسان به زودی با شما تماس می‌گیرند.'
      });
      form.reset();
    });

    // FAQ Accordion Toggling
    this.listen(this.root, 'click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const trigger = target.closest('[data-act="toggle-faq"]');
      if (!trigger) return;

      const item = trigger.closest('.faq-item');
      const content = item?.querySelector('.faq-content');
      if (!content) return;

      const isHidden = content.classList.contains('hidden');
      content.classList.toggle('hidden', !isHidden);
      trigger.setAttribute('aria-expanded', String(isHidden));
      trigger.classList.toggle('is-open', isHidden);
    });
  }
}
