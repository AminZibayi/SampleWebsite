// @ts-check
/**
 * @fileoverview Admin panel for product CRUD, order status, and feedback inbox.
 */
import { Component } from '../../core/Component.js';

export class AdminPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    return `<section class="stack"><h1>پنل مدیر</h1><form id="product-form" class="card cluster"><input name="name" placeholder="نام محصول" required/><input name="price" type="number" placeholder="قیمت" required/><input name="stock" type="number" placeholder="موجودی" required/><input name="category" placeholder="دسته" required/><button class="btn btn-primary">ذخیره</button></form><section id="admin-products" class="bento-grid"></section><section id="orders" class="card"></section><section id="feedback" class="card"></section></section>`;
  }
  async redraw() {
    if (!this.root) return;
    const products = await this.deps.productService.all();
    this.root.querySelector('#admin-products').innerHTML = products.map((p) => `<article class="card"><strong>${p.name}</strong><p>${p.price}</p><p>موجودی: ${p.stock}</p><div class="cluster"><button class="btn" data-act="edit" data-id="${p.id}">ویرایش</button><button class="btn" data-act="del" data-id="${p.id}">حذف</button></div></article>`).join('');
    const orders = this.deps.orderService.allOrders();
    this.root.querySelector('#orders').innerHTML = `<h3>سفارش‌ها</h3>${orders.map((o) => `<div class="cluster"><span>${o.id.slice(0,6)} - ${o.status}</span><button class="btn" data-act="status" data-id="${o.id}">ارسال شد</button></div>`).join('') || '<p>سفارشی نیست.</p>'}`;
    const feedback = this.deps.feedbackService.all();
    this.root.querySelector('#feedback').innerHTML = `<h3>بازخوردها</h3>${feedback.map((f) => `<article class="card"><strong>${f.name}</strong><p>${f.category} | ${f.rating}/5</p><p>${f.message}</p></article>`).join('') || '<p>بازخوردی ثبت نشده است.</p>'}`;
  }
  async bindEvents() {
    await this.redraw();
    if (!this.root) return;
    this.root.querySelector('#product-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(/** @type {HTMLFormElement} */(e.currentTarget));
      await this.deps.productService.upsert({ id: crypto.randomUUID(), name: String(fd.get('name')), price: Number(fd.get('price')), stock: Number(fd.get('stock')), category: String(fd.get('category')), discount: 0, rating: 4, popularity: 1, description: 'محصول مدیریتی', image: '', createdAt: new Date().toISOString() });
      this.deps.bus.emit('toast:add', { kind: 'success', text: 'محصول ذخیره شد.' });
      this.deps.bus.emit('cart:changed');
      await this.redraw();
    });
    this.root.addEventListener('click', async (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const b = t.closest('[data-act]');
      if (!b) return;
      const id = b.getAttribute('data-id');
      const act = b.getAttribute('data-act');
      if (!id) return;
      if (act === 'del') await this.deps.productService.remove(id);
      if (act === 'status') await this.deps.orderService.setStatus(id, 'shipped');
      if (act === 'edit') {
        const rows = await this.deps.productService.all();
        const row = rows.find((p) => p.id === id);
        if (row) await this.deps.productService.upsert({ ...row, price: row.price + 100000 });
      }
      await this.redraw();
    });
    this.unsubs.push(this.deps.bus.on('feedback:changed', () => this.redraw()));
  }
}
