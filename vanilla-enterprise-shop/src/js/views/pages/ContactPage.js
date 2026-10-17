// @ts-check
/**
 * @fileoverview Contact page with FAQ accordion and custom validation.
 */
import { Component } from '../../core/Component.js';
import { isEmail, minLen } from '../../utils/validators.js';

export class ContactPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    return `<section class="stack"><h1>ارتباط با ما</h1><form id="contact-form" class="card stack"><input name="name" placeholder="نام" required/><input name="email" type="email" placeholder="ایمیل" required/><textarea name="message" placeholder="پیام" required></textarea><button class="btn btn-primary">ارسال پیام</button></form><article class="card"><h3>ساعات کاری</h3><p>شنبه تا چهارشنبه - ۹ تا ۱۸</p><h3>نقشه</h3><div class="card">[جایگاه نقشه]</div></article><article class="card"><button class="btn" aria-expanded="false" data-faq>سوالات متداول</button><p class="hidden" id="faq-content">پاسخ نمونه: پشتیبانی ۲۴ ساعته در تیکت.</p></article></section>`;
  }
  bindEvents() {
    if (!this.root) return;
    this.root.querySelector('#contact-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(/** @type {HTMLFormElement} */(e.currentTarget));
      const email = String(fd.get('email'));
      const message = String(fd.get('message'));
      if (!isEmail(email) || !minLen(message, 10)) {
        this.deps.bus.emit('toast:add', { kind: 'error', text: 'ایمیل یا متن پیام معتبر نیست.' });
        return;
      }
      this.deps.bus.emit('toast:add', { kind: 'success', text: 'پیام شما دریافت شد.' });
      /** @type {HTMLFormElement} */(e.currentTarget).reset();
    });
    this.root.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      if (!t.closest('[data-faq]')) return;
      const c = this.root?.querySelector('#faq-content');
      if (!c) return;
      c.classList.toggle('hidden');
      const expanded = !c.classList.contains('hidden');
      t.setAttribute('aria-expanded', String(expanded));
    });
  }
}
