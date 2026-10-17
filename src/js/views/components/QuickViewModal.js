// @ts-check
/**
 * @fileoverview Quick view dialog with keyboard close support.
 */
import { Component } from '../../core/Component.js';
import { toman } from '../../utils/formatters.js';

export class QuickViewModal extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() { return ''; }
  bindEvents() {
    const close = () => { if (this.root) this.root.innerHTML = ''; this.deps.bus.emit('product:quickView', null); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    this.unsubs.push(this.deps.bus.on('state:quickViewId', async (id) => {
      if (!this.root || !id) { if (this.root) this.root.innerHTML = ''; return; }
      const p = await this.deps.productService.byId(id);
      if (!p) return;
      this.root.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true"><div class="card"><h3>${p.name}</h3><p>${p.description}</p><p>${toman(p.price)}</p><div class="cluster"><button class="btn btn-primary" data-act="add" data-id="${p.id}">افزودن به سبد</button><button class="btn" data-act="close">بستن</button></div></div></div>`;
      this.root.querySelector('.modal-backdrop')?.addEventListener('click', (e) => {
        const t = /** @type {HTMLElement} */(e.target);
        const btn = t.closest('[data-act]');
        if (btn?.getAttribute('data-act') === 'add') this.deps.bus.emit('product:addToCart', { id: p.id, qty: 1 });
        if (t.classList.contains('modal-backdrop') || btn?.getAttribute('data-act') === 'close') close();
      });
    }));
  }
}
