// @ts-check
/**
 * @fileoverview Main storefront page.
 * Pattern: Page component with delegated toolbar/card actions.
 */
import { Component } from '../../core/Component.js';
import { toman } from '../../utils/formatters.js';

export class StorefrontPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    return `<section class="stack"><article class="card"><h1>ویترین تکنولوژی و سرمقاله</h1><p class="muted">پیشنهادهای ویژه و فلش‌دیل‌های امروز</p></article><section class="toolbar card"><select id="category"><option>همه</option><option>دیجیتال</option><option>صوتی</option></select><select id="sort"><option value="newest">جدیدترین</option><option value="priceAsc">ارزان‌ترین</option><option value="priceDesc">گران‌ترین</option><option value="popular">محبوب‌ترین</option></select><label><input id="stock" type="checkbox"/> فقط موجود</label><input id="price" type="range" min="1000000" max="100000000" value="100000000" /></section><section id="products" class="bento-grid"></section></section>`;
  }
  async redraw() {
    if (!this.root) return;
    const products = await this.deps.productService.query({
      search: this.deps.store.state.search,
      category: this.deps.store.state.category,
      stockOnly: this.deps.store.state.stockOnly,
      sortBy: this.deps.store.state.sortBy,
      priceMax: this.deps.store.state.priceMax
    });
    const box = this.root.querySelector('#products');
    if (!box) return;
    box.innerHTML = products.map((p) => `<article class="card"><strong>${p.name}</strong><p class="muted">${p.category}</p><p>${toman(Math.round(p.price * (1 - p.discount / 100)))}</p><div class="cluster"><button class="btn" data-act="quick" data-id="${p.id}">مشاهده سریع</button><button class="btn btn-primary" data-act="add" data-id="${p.id}">افزودن</button></div></article>`).join('');
  }
  async bindEvents() {
    await this.redraw();
    if (!this.root) return;
    this.root.addEventListener('change', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      if (t.id === 'category') this.deps.store.set('category', /** @type {HTMLSelectElement} */(t).value);
      if (t.id === 'sort') this.deps.store.set('sortBy', /** @type {HTMLSelectElement} */(t).value);
      if (t.id === 'stock') this.deps.store.set('stockOnly', /** @type {HTMLInputElement} */(t).checked);
      if (t.id === 'price') this.deps.store.set('priceMax', Number((/** @type {HTMLInputElement} */(t)).value));
      this.redraw();
    });
    this.root.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const btn = t.closest('[data-act]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (!id) return;
      if (btn.getAttribute('data-act') === 'quick') this.deps.bus.emit('product:quickView', id);
      if (btn.getAttribute('data-act') === 'add') this.deps.bus.emit('product:addToCart', { id, qty: 1 });
    });
    this.unsubs.push(this.deps.bus.on('search:changed', async () => this.redraw()));
  }
}
