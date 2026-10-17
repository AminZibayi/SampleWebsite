// @ts-check
/**
 * @fileoverview Articles list + reader page with related products.
 */
import { Component } from '../../core/Component.js';
import { jalali } from '../../utils/formatters.js';

export class ArticlesPage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() { return `<section id="articles-area" class="stack"></section>`; }
  async bindEvents() {
    if (!this.root) return;
    const box = this.root.querySelector('#articles-area');
    if (!box) return;
    if (!this.deps.articleId) {
      const rows = await this.deps.articleService.all();
      box.innerHTML = `<h1>مقالات</h1><div class="bento-grid">${rows.map((a) => `<article class="card"><a href="#/article/${a.id}"><h3>${a.title}</h3></a><p>${a.author} - ${jalali(a.createdAt)} - ${this.deps.articleService.estimateRead(a.body)} دقیقه</p><p>${a.tags.join('، ')}</p></article>`).join('')}</div>`;
      return;
    }
    const a = await this.deps.articleService.byId(this.deps.articleId);
    if (!a) { box.innerHTML = '<p>مقاله پیدا نشد.</p>'; return; }
    const related = await this.deps.articleService.relatedProducts(a);
    const toc = a.body.split('\\n').filter((l) => l.startsWith('## ')).map((l) => l.replace('## ', ''));
    box.innerHTML = `<article class="card"><h1>${a.title}</h1><p>${a.author} - ${jalali(a.createdAt)}</p><h3>فهرست مطالب</h3><ul>${toc.map((t) => `<li>${t}</li>`).join('')}</ul><pre>${a.body}</pre><h3>محصولات مرتبط با این مقاله</h3><div class="cluster">${related.map((p) => `<button class="btn" data-id="${p.id}">${p.name}</button>`).join('')}</div></article>`;
    box.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      const id = t.closest('[data-id]')?.getAttribute('data-id');
      if (id) this.deps.orderService.addToCart(id, 1).then(() => this.deps.bus.emit('toast:add', { kind: 'success', text: 'محصول مرتبط اضافه شد.' }));
    });
  }
}
