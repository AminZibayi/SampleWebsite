// @ts-check
/**
 * @fileoverview Administrator Control Panel: Product CRUD, Order Inspector, and Feedback Triage.
 *
 * Architectural Layer: Presentation / Role-Guarded Backoffice View.
 * Pattern: Composite Page Component + Data Management Facade.
 *
 * Educational Concepts:
 * 1. Role-Based Route Protection (RBAC):
 *    Protected by `Router.guards` where `guard.check = () => authService.isAdmin()`.
 *    Unauthorized customers attempting to access `#/admin` are intercepted and redirected.
 * 2. Real-Time Cross-View Reactivity:
 *    When an admin adds, edits, or deletes a product, `storageService` updates, and the
 *    `EventBus` broadcasts events, keeping the public storefront instantly in sync.
 */

import { Component } from '../../core/Component.js';
import { jalali, toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';

export class AdminPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/ProductService.js').ProductService} deps.productService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/FeedbackService.js').FeedbackService} deps.feedbackService
   * @param {import('../../services/AuthService.js').AuthService} deps.authService
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.activeSection = 'products'; // 'products' | 'orders' | 'feedback'
    this.editingProductId = null;
  }

  render() {
    const user = this.deps.authService.currentUser();
    return `
      <div class="admin-panel stack gap-xl">
        <!-- Admin Header -->
        <header class="admin-header card">
          <div class="admin-identity">
            <span class="admin-badge-icon">🛡️</span>
            <div>
              <div class="admin-title-row">
                <h1 class="admin-title">پنل مدیریت و راهبری سیستم</h1>
                <span class="badge badge-hero">سطح دسترسی: مدیر ارشد</span>
              </div>
              <p class="muted text-sm">
                مدیریت زنده کاتالوگ محصولات، بررسی سفارش‌های مشتریان و پاسخگویی به صندوق پیشنهادات.
              </p>
            </div>
          </div>

          <div class="admin-user-pill">
            <span class="muted text-sm">کاربر وارد شده: <strong>${escapeHtml(user?.name || 'مدیر')}</strong></span>
            <a href="#/products" class="btn btn-ghost btn-sm">مشاهده ویترین عمومی</a>
          </div>
        </header>

        <!-- Admin Navigation Tabs -->
        <div class="admin-nav-tabs" role="tablist">
          <button
            class="admin-tab-btn ${this.activeSection === 'products' ? 'is-active' : ''}"
            data-act="nav-products"
            role="tab"
          >
            <span>📦 مدیریت کاتالوگ و موجودی محصولات</span>
          </button>
          <button
            class="admin-tab-btn ${this.activeSection === 'orders' ? 'is-active' : ''}"
            data-act="nav-orders"
            role="tab"
          >
            <span>📋 بازرسی سفارش‌های مشتریان</span>
          </button>
          <button
            class="admin-tab-btn ${this.activeSection === 'feedback' ? 'is-active' : ''}"
            data-act="nav-feedback"
            role="tab"
          >
            <span>📬 صندوق دیدگاه‌ها و پیشنهادات</span>
          </button>
        </div>

        <!-- Dynamic Main Content Section -->
        <main id="admin-main-section"></main>
      </div>
    `;
  }

  async renderActiveSection() {
    const mount = this.$('#admin-main-section');
    if (!mount) return;

    if (this.activeSection === 'products') {
      await this.renderProductsSection(mount);
    } else if (this.activeSection === 'orders') {
      await this.renderOrdersSection(mount);
    } else {
      await this.renderFeedbackSection(mount);
    }
  }

  /**
   * @param {Element} mount
   */
  async renderProductsSection(mount) {
    const products = await this.deps.productService.all();

    mount.innerHTML = `
      <section class="stack gap-lg">
        <!-- Add New Product Form Card -->
        <div class="card product-form-card">
          <div class="card-header-row">
            <h3 class="card-section-title">
              ${this.editingProductId ? '✏️ ویرایش محصول انتخاب‌شده' : '➕ افزودن محصول جدید به کاتالوگ'}
            </h3>
            ${
              this.editingProductId
                ? `<button class="btn btn-ghost btn-sm" data-act="cancel-edit">انصراف از ویرایش</button>`
                : ''
            }
          </div>

          <form id="admin-product-form" class="admin-form-grid">
            <div class="form-group">
              <label class="form-label">نام محصول:</label>
              <input name="name" class="input-field" placeholder="مثال: اولترابوک مهندسی استودیو" required />
            </div>

            <div class="form-group">
              <label class="form-label">دسته‌بندی:</label>
              <select name="category" class="input-field" required>
                <option value="دیجیتال">دیجیتال و لپ‌تاپ</option>
                <option value="صوتی">صوتی و مانیتورینگ</option>
                <option value="محیط کار">محیط کار و ارگونومی</option>
                <option value="نمایشگر">نمایشگر و تصویر</option>
                <option value="پوشیدنی">پوشیدنی‌های هوشمند</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">قیمت پایه (تومان):</label>
              <input name="price" type="number" min="100000" step="50000" class="input-field" placeholder="15000000" required />
            </div>

            <div class="form-group">
              <label class="form-label">درصد تخفیف (۰ تا ۱۰۰):</label>
              <input name="discount" type="number" min="0" max="90" value="0" class="input-field" />
            </div>

            <div class="form-group">
              <label class="form-label">موجودی انبار:</label>
              <input name="stock" type="number" min="0" max="999" value="10" class="input-field" required />
            </div>

            <div class="form-group">
              <label class="form-label">نشان یا برچسب بصری:</label>
              <input name="badge" class="input-field" placeholder="مثال: پرچمدار، تولید محدود" />
            </div>

            <div class="form-group span-full">
              <label class="form-label">توضیحات و مشخصات کاربردی:</label>
              <textarea name="description" rows="2" class="input-field" placeholder="توضیحات فنی پیرامون متریال، پورت‌ها و کاربرد..." required></textarea>
            </div>

            <div class="form-actions span-full">
              <button type="submit" class="btn btn-primary">
                <span>${this.editingProductId ? 'بروزرسانی محصول' : 'ثبت و انتشار محصول'}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Products Table -->
        <div class="card table-card">
          <div class="card-header-row">
            <h3 class="card-section-title">فهرست کل محصولات (${toPersianDigits(products.length)} کالا)</h3>
          </div>

          <div class="responsive-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>دسته</th>
                  <th>قیمت</th>
                  <th>تخفیف</th>
                  <th>موجودی</th>
                  <th>امتیاز</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                ${products
                  .map(
                    (p) => `
                  <tr>
                    <td>
                      <div class="table-prod-cell">
                        <img src="${p.image}" alt="" width="36" height="28" class="table-thumb" />
                        <strong>${escapeHtml(p.name)}</strong>
                      </div>
                    </td>
                    <td><span class="badge badge-tag">${escapeHtml(p.category)}</span></td>
                    <td>${toman(p.price)}</td>
                    <td>${p.discount > 0 ? `<span class="badge badge-discount">${toPersianDigits(p.discount)}٪</span>` : '—'}</td>
                    <td>
                      <span class="${p.stock > 0 ? 'text-success' : 'text-danger font-bold'}">
                        ${toPersianDigits(p.stock)} عدد
                      </span>
                    </td>
                    <td>★ ${toPersianDigits(p.rating.toFixed(1))}</td>
                    <td>
                      <div class="table-actions">
                        <button class="btn btn-secondary btn-xs" data-act="edit-product" data-id="${p.id}">ویرایش</button>
                        <button class="btn btn-ghost btn-xs text-danger" data-act="delete-product" data-id="${p.id}">حذف</button>
                      </div>
                    </td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * @param {Element} mount
   */
  async renderOrdersSection(mount) {
    const orders = this.deps.orderService.allOrders();

    mount.innerHTML = `
      <section class="card table-card stack gap-md">
        <div class="card-header-row">
          <h3 class="card-section-title">مدیریت سفارش‌های ثبت‌شده (${toPersianDigits(orders.length)} سفارش)</h3>
        </div>

        ${
          orders.length === 0
            ? '<p class="muted">تاکنون سفارشی در سامانه ثبت نشده است.</p>'
            : `
          <div class="responsive-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>کد رهگیری</th>
                  <th>تاریخ</th>
                  <th>مشتری</th>
                  <th>تعداد اقلام</th>
                  <th>مبلغ نهایی</th>
                  <th>وضعیت سفارش</th>
                  <th>تغییر وضعیت</th>
                </tr>
              </thead>
              <tbody>
                ${orders
                  .map(
                    (o) => `
                  <tr>
                    <td><code>${toPersianDigits(o.trackingCode)}</code></td>
                    <td>${jalali(o.createdAt)}</td>
                    <td>${escapeHtml(o.phone || o.userId.slice(0, 8))}</td>
                    <td>${toPersianDigits(o.items.length)} قلم</td>
                    <td><strong>${toman(o.total)}</strong></td>
                    <td>
                      <span class="badge ${o.status === 'delivered' ? 'badge-success' : o.status === 'shipped' ? 'badge-warning' : 'badge-info'}">
                        ${o.status === 'delivered' ? 'تحویل شده' : o.status === 'shipped' ? 'ارسال‌شده' : 'پرداخت‌شده'}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions">
                        ${
                          o.status !== 'shipped'
                            ? `<button class="btn btn-secondary btn-xs" data-act="set-status" data-id="${o.id}" data-status="shipped">ارسال به پست</button>`
                            : ''
                        }
                        ${
                          o.status !== 'delivered'
                            ? `<button class="btn btn-primary btn-xs" data-act="set-status" data-id="${o.id}" data-status="delivered">تحویل نهایی</button>`
                            : ''
                        }
                      </div>
                    </td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>`
        }
      </section>
    `;
  }

  /**
   * @param {Element} mount
   */
  async renderFeedbackSection(mount) {
    const feedbackList = this.deps.feedbackService.all();

    mount.innerHTML = `
      <section class="card table-card stack gap-md">
        <div class="card-header-row">
          <h3 class="card-section-title">صندوق بازخوردها و پیشنهادات کاربران (${toPersianDigits(feedbackList.length)} پیام)</h3>
        </div>

        ${
          feedbackList.length === 0
            ? '<p class="muted">صندوق بازخوردها خالی است.</p>'
            : `
          <div class="feedback-grid">
            ${feedbackList
              .map(
                (f) => `
              <article class="feedback-card card stack gap-sm ${f.status === 'unread' ? 'border-highlight' : ''}">
                <div class="feedback-header">
                  <div class="feedback-author-meta">
                    <strong>${escapeHtml(f.name)}</strong>
                    <span class="badge ${f.category === 'شکایت' ? 'badge-danger' : f.category === 'انتقاد' ? 'badge-warning' : 'badge-accent'}">
                      ${f.category}
                    </span>
                  </div>
                  <div class="feedback-rating">
                    ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                  </div>
                </div>

                <p class="feedback-message">${escapeHtml(f.message)}</p>

                <div class="feedback-footer text-sm muted">
                  <time>${jalali(f.createdAt)}</time>
                  <div class="table-actions">
                    ${
                      f.status === 'unread'
                        ? `<button class="btn btn-secondary btn-xs" data-act="mark-feedback-read" data-id="${f.id}">علامت‌گذاری به عنوان خوانده‌شده</button>`
                        : '<span class="badge badge-success">بررسی‌شده</span>'
                    }
                    <button class="btn btn-ghost btn-xs text-danger" data-act="delete-feedback" data-id="${f.id}">حذف</button>
                  </div>
                </div>
              </article>`
              )
              .join('')}
          </div>`
        }
      </section>
    `;
  }

  async bindEvents() {
    await this.renderActiveSection();

    const form = /** @type {HTMLFormElement|null} */ (this.$('#admin-product-form'));
    form?.addEventListener('submit', (e) => this.handleProductFormSubmit(e, form));

    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;
      const act = actionEl.getAttribute('data-act');
      const id = actionEl.getAttribute('data-id');
      if (act) await this.handleAdminClick(act, id, actionEl);
    });

    this.unsubs.push(
      this.deps.bus.on('feedback:changed', async () => {
        if (this.activeSection === 'feedback') {
          await this.renderActiveSection();
        }
      })
    );
  }

  /**
   * @param {Event} e
   * @param {HTMLFormElement} form
   */
  async handleProductFormSubmit(e, form) {
    e.preventDefault();
    const fd = new FormData(form);
    const existingProd = this.editingProductId ? await this.deps.productService.byId(this.editingProductId) : null;
    const payload = this.extractProductPayload(fd, existingProd);

    await this.deps.productService.upsert(payload);
    this.deps.bus.emit('toast:add', {
      kind: 'success',
      text: `محصول «${payload.name}» با موفقیت ${this.editingProductId ? 'بروزرسانی' : 'ثبت'} شد.`
    });
    this.editingProductId = null;
    await this.renderActiveSection();
  }

  /**
   * @param {FormData} fd
   * @param {import('../../types/typedefs.js').Product|null} existingProd
   * @returns {import('../../types/typedefs.js').Product}
   */
  extractProductPayload(fd, existingProd) {
    return {
      id: this.editingProductId || `prod-custom-${Date.now().toString(36)}`,
      name: String(fd.get('name') || '').trim(),
      category: String(fd.get('category') || 'دیجیتال'),
      price: Number(fd.get('price') || 0),
      discount: Number(fd.get('discount') || 0),
      stock: Number(fd.get('stock') || 0),
      rating: existingProd ? existingProd.rating : 5.0,
      popularity: existingProd ? existingProd.popularity : 80,
      badge: String(fd.get('badge') || '').trim() || undefined,
      description: String(fd.get('description') || '').trim(),
      image: existingProd ? existingProd.image : '',
      createdAt: existingProd ? existingProd.createdAt : new Date().toISOString()
    };
  }
  /**
   * @param {string} act
   * @param {string|null} id
   * @param {Element} actionEl
   */
  async handleAdminClick(act, id, actionEl) {
    if (act.startsWith('nav-')) {
      this.activeSection = act.replace('nav-', '');
      this.$$('.admin-tab-btn').forEach((b) => b.classList.remove('is-active'));
      actionEl.classList.add('is-active');
      await this.renderActiveSection();
    } else if (act === 'delete-product' && id) {
      if (confirm('آیا از حذف دائمی این محصول از کاتالوگ اطمینان دارید؟')) {
        await this.deps.productService.remove(id);
        this.deps.bus.emit('toast:add', { kind: 'info', text: 'محصول از کاتالوگ حذف گردید.' });
        await this.renderActiveSection();
      }
    } else if (act === 'edit-product' && id) {
      await this.startEditProduct(id);
    } else if (act === 'cancel-edit') {
      this.editingProductId = null;
      await this.renderActiveSection();
    } else if (act === 'set-status' && id) {
      const newStatus = /** @type {'shipped'|'delivered'} */ (actionEl.getAttribute('data-status'));
      await this.deps.orderService.setStatus(id, newStatus);
      this.deps.bus.emit('toast:add', { kind: 'success', text: 'وضعیت سفارش بروزرسانی شد.' });
      await this.renderActiveSection();
    } else if (act === 'mark-feedback-read' && id) {
      await this.deps.feedbackService.updateStatus(id, 'reviewed');
      this.deps.bus.emit('toast:add', { kind: 'success', text: 'بازخورد به وضعیت بررسی‌شده منتقل شد.' });
      await this.renderActiveSection();
    } else if (act === 'delete-feedback' && id) {
      await this.deps.feedbackService.remove(id);
      this.deps.bus.emit('toast:add', { kind: 'info', text: 'بازخورد حذف شد.' });
      await this.renderActiveSection();
    }
  }

  /**
   * @param {string} id
   */
  async startEditProduct(id) {
    const prod = await this.deps.productService.byId(id);
    if (!prod) return;
    this.editingProductId = prod.id;
    await this.renderActiveSection();
    const f = /** @type {HTMLFormElement|null} */ (this.$('#admin-product-form'));
    if (f) {
      const el = /** @type {any} */ (f.elements);
      el.name.value = prod.name;
      el.category.value = prod.category;
      el.price.value = String(prod.price);
      el.discount.value = String(prod.discount || 0);
      el.stock.value = String(prod.stock);
      el.badge.value = prod.badge || '';
      el.description.value = prod.description;
      f.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
