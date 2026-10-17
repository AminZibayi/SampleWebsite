// @ts-check
/**
 * @fileoverview Cart drawer with delegated quantity actions.
 */
import { Component } from '../../core/Component.js';
import { toman } from '../../utils/formatters.js';

export class CartDrawer extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() { return `<aside class="drawer" id="cart-drawer" aria-label="سبد خرید" aria-hidden="true"></aside>`; }
  async redraw() {
    const drawer = document.querySelector('#cart-drawer');
    if (!drawer) return;
    const cart = this.deps.orderService.getCart();
    const products = await this.deps.productService.all();
    const rows = cart.map((i) => {
      const p = products.find((x) => x.id === i.productId);
      return p ? { ...p, qty: i.qty } : null;
    }).filter(Boolean);
    const total = rows.reduce((sum, r) => sum + (r.price * r.qty), 0);
    drawer.innerHTML = `<h3>سبد خرید</h3>${rows.map((r) => `<div class="card"><strong>${r.name}</strong><div>${toman(r.price)}</div><div class="cluster"><button class="btn" data-act="dec" data-id="${r.id}">-</button><span>${r.qty}</span><button class="btn" data-act="inc" data-id="${r.id}">+</button><button class="btn" data-act="rm" data-id="${r.id}">حذف</button></div></div>`).join('') || '<p class="muted">سبد خالی است.</p>'}<p><strong>${toman(total)}</strong></p><a href="#/checkout" class="btn btn-primary">تسویه‌حساب</a>`;
  }
  async bindEvents() {
    await this.redraw();
    const drawer = document.querySelector('#cart-drawer');
    if (!drawer) return;
    this.root.addEventListener('click', async (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const b = t.closest('[data-act]');
      if (!b) return;
      const id = b.getAttribute('data-id');
      if (!id) return;
      const act = b.getAttribute('data-act');
      const found = this.deps.orderService.getCart().find((x) => x.productId === id);
      if (!found) return;
      if (act === 'inc') await this.deps.orderService.updateQty(id, found.qty + 1);
      if (act === 'dec') await this.deps.orderService.updateQty(id, Math.max(1, found.qty - 1));
      if (act === 'rm') await this.deps.orderService.removeFromCart(id);
      this.deps.bus.emit('cart:changed');
      await this.redraw();
    });
    this.unsubs.push(this.deps.bus.on('state:cartOpen', (open) => { /** @type {HTMLElement} */(drawer).dataset.open = String(open); drawer.setAttribute('aria-hidden', String(!open)); }));
    this.unsubs.push(this.deps.bus.on('cart:changed', async () => { await this.redraw(); }));
  }
}
