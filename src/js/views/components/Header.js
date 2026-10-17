// @ts-check
/**
 * @fileoverview Header component.
 * Pattern: Component + Event Delegation for actions/search/menu.
 */
import { Component } from '../../core/Component.js';
import { debounce } from '../../utils/debounce.js';

export class Header extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    const user = this.deps.authService.currentUser();
    const cartCount = (this.deps.orderService.getCart() || []).reduce((a, b) => a + b.qty, 0);
    return `<div class="header glass"><div class="cluster"><strong>فروشگاه آموزشی</strong><a href="#/products">محصولات</a><a href="#/articles">مقالات</a><a href="#/contact">ارتباط با ما</a></div><div class="cluster"><input id="q" placeholder="جستجو در محصولات و مقالات" aria-label="جستجو" /><button class="btn" data-act="theme">🌓</button><button class="btn" data-act="cart">سبد <span class="badge">${cartCount}</span></button>${user ? `<a class="btn" href="#/${user.role === 'admin' ? 'admin' : 'profile'}">${user.name}</a>` : '<a class="btn" href="#/login">ورود / ثبت‌نام</a>'}</div></div>`;
  }
  bindEvents() {
    if (!this.root) return;
    this.root.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const btn = t.closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'theme') this.deps.bus.emit('theme:toggle');
      if (act === 'cart') this.deps.bus.emit('cart:toggle');
    });
    const input = this.root.querySelector('#q');
    input?.addEventListener('input', debounce((ev) => {
      this.deps.store.set('search', /** @type {HTMLInputElement} */(ev.target).value);
      this.deps.bus.emit('search:changed');
    }, 300));
    this.unsubs.push(this.deps.bus.on('cart:changed', () => this.mount()));
    this.unsubs.push(this.deps.bus.on('state:theme', () => this.mount()));
    this.unsubs.push(this.deps.bus.on('auth:changed', () => this.mount()));
  }
}
