// @ts-check
/**
 * @fileoverview Footer with criticism/suggestions form and latest articles.
 */
import { Component } from '../../core/Component.js';

export class Footer extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    return `<div class="card"><div class="bento-grid"><section><h3>ثبت نقد و پیشنهاد</h3><form id="feedback-form" class="stack"><input name="name" placeholder="نام" required/><select name="category"><option>شکایت</option><option>انتقاد</option><option>پیشنهاد</option></select><input name="rating" type="number" min="1" max="5" value="5" /><textarea name="message" required></textarea><button class="btn btn-primary">ارسال</button></form></section><section><h3>آخرین مقالات</h3><ul id="latest-articles"></ul></section><section><h3>نماد اعتماد</h3><button class="btn" data-act="trust">اعتبارسنجی</button></section></div></div>`;
  }
  async bindEvents() {
    if (!this.root) return;
    const list = this.root.querySelector('#latest-articles');
    const articles = (await this.deps.articleService.all()).slice(0, 4);
    list.innerHTML = articles.map((a) => `<li><a href="#/article/${a.id}">${a.title}</a></li>`).join('');
    this.root.querySelector('#feedback-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(/** @type {HTMLFormElement} */(e.currentTarget));
      this.deps.feedbackService.add({ name: String(fd.get('name')), category: String(fd.get('category')), rating: Number(fd.get('rating')), message: String(fd.get('message')) });
      this.deps.bus.emit('toast:add', { kind: 'success', text: 'بازخورد شما ثبت شد.' });
      this.deps.bus.emit('feedback:changed');
      /** @type {HTMLFormElement} */(e.currentTarget).reset();
    });
    this.root.addEventListener('click', (e) => {
      const t = /** @type {HTMLElement} */(e.target);
      if (t.closest('[data-act="trust"]')) this.deps.bus.emit('toast:add', { kind: 'info', text: 'نماد اعتماد در حالت نمایشی است.' });
    });
  }
}
