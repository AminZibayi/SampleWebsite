// @ts-check
/**
 * @fileoverview Login page for customer/admin with demo-login actions.
 */
import { Component } from '../../core/Component.js';

export class AuthPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    return `<section class="card stack"><h1>ورود / ثبت‌نام</h1><p class="muted">در این پروژه، نشست کاربر شبیه JWT در localStorage نگه‌داری می‌شود (نسخهٔ آموزشی).</p><form id="login-form" class="stack"><input name="email" type="email" placeholder="ایمیل" required/><input name="password" type="password" placeholder="رمز عبور" required/><button class="btn btn-primary">ورود</button></form><div class="cluster"><button class="btn" data-demo="admin">ورود سریع به عنوان ادمین</button><button class="btn" data-demo="customer">ورود سریع به عنوان مشتری</button></div></section>`;
  }
  bindEvents() {
    if (!this.root) return;
    this.root.querySelector('#login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(/** @type {HTMLFormElement} */(e.currentTarget));
      try {
        await this.deps.authService.login(String(fd.get('email')), String(fd.get('password')));
        this.deps.bus.emit('auth:changed');
        location.hash = '#/products';
      } catch (error) {
        this.deps.bus.emit('toast:add', { kind: 'error', text: /** @type {Error} */ (error).message });
      }
    });
    this.root.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const demo = t.closest('[data-demo]')?.getAttribute('data-demo');
      if (!demo) return;
      const form = /** @type {HTMLFormElement|null} */(this.root?.querySelector('#login-form'));
      if (!form) return;
      form.email.value = demo === 'admin' ? 'admin@example.com' : 'user@example.com';
      form.password.value = demo === 'admin' ? 'admin123' : 'user123';
    });
  }
}
