// @ts-check
/**
 * @fileoverview Rich architectural footer with built-in feedback system and trust badges modal.
 *
 * Architectural Layer: Presentation / Architectural Footer Component.
 * Pattern: Component Pattern + Repository Integration.
 *
 * Educational Concepts:
 * 1. Immediate Feedback Loop:
 *    When a customer fills out the "Criticism & Suggestions" form in the footer,
 *    the submission goes directly through `FeedbackService.add()`. An event `feedback:changed`
 *    is emitted over the `EventBus`, allowing any active Admin view to update in real-time.
 * 2. Trust Badge Verification Simulation:
 *    Iranian e-commerce sites display e-Namad and Samandehi emblems. Clicking these badges
 *    launches an informative verification modal detailing the SSL encryption status and
 *    business entity credentials.
 */

import { Component } from '../../core/Component.js';
import { jalali, toPersianDigits } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';

export class Footer extends Component {
  /**
   * @param {Element|null} root - Host container (#footer-root).
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/FeedbackService.js').FeedbackService} deps.feedbackService
   * @param {import('../../services/ArticleService.js').ArticleService} deps.articleService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.trustModalOpen = false;
  }

  render() {
    return `
      <div class="footer-wrap">
        <div class="footer-bento-grid">
          <!-- Column 1: Criticism & Suggestions Form -->
          <section class="footer-card footer-feedback-card" aria-labelledby="footer-feedback-title">
            <div class="footer-card-header">
              <span class="card-badge">صدای مخاطب</span>
              <h3 id="footer-feedback-title">ثبت نقد، انتقاد و پیشنهادات</h3>
            </div>
            <p class="muted text-sm">دیدگاه‌ها مستقیماً برای مدیر سیستم ارسال و در پنل مدیریت بررسی می‌شوند.</p>

            <form id="footer-feedback-form" class="stack gap-sm">
              <div class="form-row">
                <input
                  name="name"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  required
                  class="input-field"
                  aria-label="نام"
                />
                <select name="category" class="input-field" aria-label="موضوع بازخورد">
                  <option value="پیشنهاد">💡 پیشنهاد ارتقای سامانه</option>
                  <option value="انتقاد">⚖️ انتقاد سازنده</option>
                  <option value="شکایت">⚠️ شکایت یا گزارش خطا</option>
                </select>
              </div>

              <div class="rating-picker-row">
                <span class="rating-label muted text-sm">میزان رضایت:</span>
                <div class="star-rating-inputs" id="star-rating-group">
                  <label><input type="radio" name="rating" value="5" checked /> <span>۵ ستاره</span></label>
                  <label><input type="radio" name="rating" value="4" /> <span>۴</span></label>
                  <label><input type="radio" name="rating" value="3" /> <span>۳</span></label>
                  <label><input type="radio" name="rating" value="2" /> <span>۲</span></label>
                  <label><input type="radio" name="rating" value="1" /> <span>۱</span></label>
                </div>
              </div>

              <textarea
                name="message"
                placeholder="متن پیشنهاد، انتقاد یا شکایت خود را با جزئیات بنویسید..."
                required
                rows="3"
                class="input-field textarea-field"
                aria-label="متن پیام"
              ></textarea>

              <button type="submit" class="btn btn-primary btn-submit-feedback">
                <span>ارسال مستقیم به مدیریت</span>
                <span>↵</span>
              </button>
            </form>
          </section>

          <!-- Column 2: Latest Magazine Articles -->
          <section class="footer-card" aria-labelledby="footer-articles-title">
            <div class="footer-card-header">
              <span class="card-badge badge-editorial">سرمقاله</span>
              <h3 id="footer-articles-title">تازه‌ترین یادداشت‌های تحریریه</h3>
            </div>
            <div id="footer-articles-list" class="footer-articles-stack">
              <div class="muted text-sm">در حال بارگذاری مقالات...</div>
            </div>
            <a href="#/articles" class="footer-more-link">مشاهده آرشیو کامل مقالات ↵</a>
          </section>

          <!-- Column 3: Trust Badges & Organizational Info -->
          <section class="footer-card" aria-labelledby="footer-trust-title">
            <div class="footer-card-header">
              <span class="card-badge badge-trust">اصالت و اعتبار</span>
              <h3 id="footer-trust-title">مجوزها و نمادهای الکترونیکی</h3>
            </div>
            <p class="muted text-sm">دارای نماد اعتماد الکترونیکی و متصل به درگاه امن شاپرک با پروتکل SSL.</p>

            <div class="trust-emblems-grid">
              <button class="trust-badge-btn" data-act="open-trust" data-badge="enamad" title="مشاهده شناسنامه نماد اعتماد">
                <div class="badge-icon">🛡️</div>
                <div class="badge-label">
                  <strong>اینماد ۵ ستاره</strong>
                  <small class="muted">اعتبارسنجی شده</small>
                </div>
              </button>

              <button class="trust-badge-btn" data-act="open-trust" data-badge="samandehi" title="ساماندهی رسانه‌های دیجیتال">
                <div class="badge-icon">🏛️</div>
                <div class="badge-label">
                  <strong>نشان ملی ثبت</strong>
                  <small class="muted">رسانه‌های برخط</small>
                </div>
              </button>
            </div>

            <div class="footer-contact-summary text-sm muted">
              <div>📍 تهران، خیابان ولیعصر، برج فناوری پارک، واحد ۷۰۲</div>
              <div>📞 پشتیبانی: ۰۲۱-۸۸۹۹۲۲۱۱ (شنبه تا چهارشنبه ۹ الی ۱۸)</div>
            </div>
          </section>
        </div>

        <!-- Bottom Copyright & Educational Credits -->
        <div class="footer-bottom-bar">
          <p>
            تمامی حقوق مادی و معنوی این وب‌سایت برای <strong>فروشگاه تخصصی و تحریریه سخت‌افزار ویستا</strong> محفوظ است.
          </p>
          <p class="muted">
            تضمین اصالت کالا، هفت روز ضمانت بازگشت وجه و ارسال مطمئن به سراسر ایران — سال ${toPersianDigits('1405')}
          </p>
        </div>
      </div>

      <!-- Trust Badges Verification Dialog Modal -->
      <div id="trust-modal-box"></div>
    `;
  }

  async bindEvents() {
    if (!this.root) return;

    // Fetch and populate latest 4 articles
    const articlesListEl = this.$('#footer-articles-list');
    if (articlesListEl) {
      const articles = (await this.deps.articleService.all()).slice(0, 4);
      articlesListEl.innerHTML = articles
        .map(
          (a) => `
          <a href="#/article/${a.id}" class="footer-article-item">
            <span class="article-bullet">✦</span>
            <div class="article-meta-wrap">
              <strong class="article-headline">${escapeHtml(a.title)}</strong>
              <small class="muted">${escapeHtml(a.author)} — ${jalali(a.createdAt)}</small>
            </div>
          </a>`
        )
        .join('');
    }

    // Handle Feedback Form Submission
    const feedbackForm = /** @type {HTMLFormElement|null} */ (this.$('#footer-feedback-form'));
    feedbackForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(feedbackForm);
      const name = String(fd.get('name') || '').trim();
      const category = /** @type {'شکایت'|'انتقاد'|'پیشنهاد'} */ (String(fd.get('category')));
      const rating = Number(fd.get('rating') || 5);
      const message = String(fd.get('message') || '').trim();

      if (!name || !message) {
        this.deps.bus.emit('toast:add', { kind: 'warning', text: 'لطفاً نام و متن پیام را کامل وارد کنید.' });
        return;
      }

      await this.deps.feedbackService.add({ name, category, rating, message });
      this.deps.bus.emit('toast:add', {
        kind: 'success',
        text: 'دیدگاه شما با موفقیت ثبت شد و در پنل مدیریت قابل پیگیری است.'
      });
      this.deps.bus.emit('feedback:changed');
      feedbackForm.reset();
    });

    // Keyboard listener: Escape closes trust modal
    this.listen(document, 'keydown', (e) => {
      const keyboardEvent = /** @type {KeyboardEvent} */ (e);
      if (keyboardEvent.key === 'Escape') {
        this.closeTrustModal();
      }
    });

    // Close modal on route navigation
    this.unsubs.push(
      this.deps.bus.on('router:navigate', () => {
        this.closeTrustModal();
      })
    );

    // Delegated click handler for trust badge modal
    this.listen(this.root, 'click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const trustBtn = target.closest('[data-act="open-trust"]');
      if (trustBtn) {
        const badgeType = trustBtn.getAttribute('data-badge');
        this.openTrustModal(badgeType);
        return;
      }

      if (target.id === 'trust-modal-backdrop' || target.closest('[data-act="close-trust-modal"]')) {
        this.closeTrustModal();
      }
    });
  }

  /**
   * @param {string|null} badgeType
   */
  openTrustModal(badgeType) {
    const box = this.$('#trust-modal-box');
    if (!box) return;

    const isEnamad = badgeType === 'enamad';
    box.innerHTML = `
      <div class="modal-backdrop is-active" id="trust-modal-backdrop">
        <div class="modal-dialog trust-dialog" role="dialog" aria-modal="true" aria-labelledby="trust-dialog-title">
          <button class="btn btn-icon btn-modal-close" data-act="close-trust-modal" aria-label="بستن پنجره">✕</button>
          <div class="trust-dialog-header">
            <span class="trust-icon-large">${isEnamad ? '🛡️' : '🏛️'}</span>
            <h3 id="trust-dialog-title">
              ${isEnamad ? 'شناسنامه نماد اعتماد الکترونیکی (اینماد)' : 'شناسنامه نشان ملی ثبت رسانه‌های دیجیتال'}
            </h3>
          </div>
          <div class="trust-dialog-body">
            <div class="trust-detail-row">
              <span class="trust-k">صاحب امتیاز:</span>
              <strong class="trust-v">شرکت توسعه فناوری و تجارت الکترونیک ویستا (سهامی خاص)</strong>
            <div class="trust-detail-row">
              <span class="trust-k">شناسه ملی:</span>
              <span class="trust-v">۱۰۱۰۳۴۹۸۲۱</span>
            </div>
            <div class="trust-detail-row">
              <span class="trust-k">وضعیت پروتکل:</span>
              <span class="trust-v badge badge-success">رمزنگاری امن TLS 1.3 فعال</span>
            </div>
            <div class="trust-detail-row">
              <span class="trust-k">تاریخ اعتبارسنجی:</span>
              <span class="trust-v">${jalali(new Date())}</span>
            </div>
            <div class="trust-callout muted text-sm">
              مجوز فعالیت و گواهی پرداخت شاپرک به صورت برخط و تحت نظارت مرکز توسعه تجارت الکترونیکی صادر شده است.
            </div>
          </div>
          <div class="trust-dialog-footer">
            <button class="btn btn-primary" data-act="close-trust-modal">تایید و بازگشت به سایت</button>
          </div>
        </div>
      </div>
    `;
    document.body.classList.add('overflow-hidden');
  }

  closeTrustModal() {
    const box = this.$('#trust-modal-box');
    if (box) box.innerHTML = '';
    document.body.classList.remove('overflow-hidden');
  }
}
