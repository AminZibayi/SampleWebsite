// @ts-check
/**
 * @fileoverview Editorial Magazine Hub & Article Reader with auto TOC and related products.
 *
 * Architectural Layer: Presentation / Editorial Magazine Page.
 * Pattern: Composite Page View + Content Parser Pattern.
 *
 * Educational Concepts:
 * 1. Content-Driven Commerce:
 *    Editorial reviews recommend physical hardware. The reader view parses `relatedProductIds`
 *    and embeds interactive product micro-cards allowing readers to add mentioned products
 *    to their cart without leaving the article.
 * 2. Automated Table of Contents (TOC):
 *    Instead of hardcoding links, the reader automatically extracts markdown `## ` headers,
 *    assigns unique DOM IDs, and builds a navigable hierarchical index.
 */

import { Component } from '../../core/Component.js';
import { jalali, toPersianDigits, toman } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/dom.js';

export class ArticlesPage extends Component {
  /**
   * @param {Element|null} root
   * @param {Object} deps
   * @param {import('../../core/EventBus.js').EventBus} deps.bus
   * @param {import('../../services/ArticleService.js').ArticleService} deps.articleService
   * @param {import('../../services/OrderService.js').OrderService} deps.orderService
   * @param {import('../../services/ProductService.js').ProductService} [deps.productService]
   * @param {string} [deps.articleId]
   * @param {Record<string, string>} [deps.query]
   */
  constructor(root, deps) {
    super(root);
    this.deps = deps;
    this.activeTag = 'همه';
  }

  render() {
    return `<div id="editorial-mount-point" class="editorial-container"></div>`;
  }

  async bindEvents() {
    const mount = this.$('#editorial-mount-point');
    if (!mount) return;

    if (this.deps.articleId) {
      await this.renderReaderView(mount, this.deps.articleId);
    } else {
      await this.renderMagazineGrid(mount);
    }

    // Delegated click handler on the page
    this.listen(this.root, 'click', async (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      const actionEl = target.closest('[data-act]');
      if (!actionEl) return;

      const act = actionEl.getAttribute('data-act');
      const id = actionEl.getAttribute('data-id');

      if (act === 'filter-tag') {
        this.activeTag = actionEl.getAttribute('data-tag') || 'همه';
        await this.renderMagazineGrid(mount);
      } else if (act === 'add-related-cart' && id) {
        await this.deps.orderService.addToCart(id, 1);
        this.deps.bus.emit('cart:changed');
        this.deps.bus.emit('toast:add', { kind: 'success', text: 'محصول مرتبط با مقاله به سبد خرید اضافه شد.' });
      }
    });
  }

  /**
   * Renders the magazine article listing grid with topic filter pills.
   *
   * @param {Element} mount
   */
  async renderMagazineGrid(mount) {
    const tags = await this.deps.articleService.allTags();
    const articles = await this.deps.articleService.query({
      tag: this.activeTag === 'همه' ? '' : this.activeTag
    });

    const tagPillsHtml = ['همه', ...tags]
      .map(
        (t) => `
        <button
          class="filter-pill ${this.activeTag === t ? 'is-active' : ''}"
          data-act="filter-tag"
          data-tag="${escapeHtml(t)}"
        >
          <span>${escapeHtml(t)}</span>
        </button>`
      )
      .join('');

    const cardsHtml = articles
      .map((a) => {
        const readTime = this.deps.articleService.estimateRead(a.body);
        return `
        <article class="article-card card" data-id="${a.id}">
          <div class="article-card-header">
            <div class="article-tags-wrap">
              ${a.tags.map((tag) => `<span class="badge badge-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <span class="read-time-pill">⏱ ${toPersianDigits(readTime)} دقیقه مطالعه</span>
          </div>

          <h3 class="article-card-title">
            <a href="#/article/${a.id}" class="article-link">${escapeHtml(a.title)}</a>
          </h3>

          <p class="article-card-excerpt muted">${escapeHtml(a.excerpt)}</p>

          <div class="article-card-footer">
            <div class="author-meta">
              <span class="author-avatar">✍️</span>
              <span class="author-name">${escapeHtml(a.author)}</span>
            </div>
            <time class="article-date muted text-sm">${jalali(a.createdAt)}</time>
          </div>
        </article>`;
      })
      .join('');

    mount.innerHTML = `
      <section class="stack gap-xl">
        <header class="editorial-hero card">
          <span class="badge badge-hero">تحریریه مهندسی و معماری وب</span>
          <h1 class="editorial-hero-title">مجله تخصصی سخت‌افزار، ارگونومی و تکنولوژی</h1>
          <p class="muted">مجموعه مقالات تحلیلی، استانداردهای طراحی محیط کار و راهنماهای انتخاب ابزار مهندسی.</p>
        </header>

        <!-- Topic Tags Toolbar -->
        <div class="tag-pills-row">
          ${tagPillsHtml}
        </div>

        <!-- Articles Bento/Masonry Grid -->
        <div class="magazine-grid">
          ${cardsHtml}
        </div>
      </section>
    `;
  }

  /**
   * Renders the single article reader view with auto TOC and related products.
   *
   * @param {Element} mount
   * @param {string} articleId
   */
  async renderReaderView(mount, articleId) {
    const article = await this.deps.articleService.byId(articleId);

    if (!article) {
      mount.innerHTML = `
        <div class="card empty-state">
          <h2>مقاله مورد نظر یافت نشد</h2>
          <p class="muted">ممکن است مقاله حذف شده یا آدرس پیوند نادرست باشد.</p>
          <a href="#/articles" class="btn btn-primary">بازگشت به فهرست مقالات</a>
        </div>
      `;
      return;
    }

    const related = await this.deps.articleService.relatedProducts(article);
    const readTime = this.deps.articleService.estimateRead(article.body);

    // Parse Markdown headers (##) for Table of Contents and inject IDs
    const lines = article.body.split('\n');
    /** @type {Array<{ id: string, title: string }>} */
    const toc = [];
    const parsedBodyHtml = lines
      .map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const title = trimmed.replace('## ', '').trim();
          const headerId = `sec-${idx}`;
          toc.push({ id: headerId, title });
          return `<h2 id="${headerId}" class="reader-section-heading">${escapeHtml(title)}</h2>`;
        }
        if (trimmed.length === 0) return '';
        return `<p class="reader-paragraph">${escapeHtml(trimmed)}</p>`;
      })
      .join('');

    const tocHtml = toc
      .map((item) => `<li><a href="#/article/${article.id}#${item.id}" class="toc-link">${escapeHtml(item.title)}</a></li>`)
      .join('');

    const relatedHtml = related
      .map((p) => {
        const price = Math.round(p.price * (1 - (p.discount || 0) / 100));
        return `
        <div class="related-product-card card">
          <div class="related-thumb-wrap">
            <img src="${p.image}" alt="${escapeHtml(p.name)}" class="related-thumb" width="80" height="60" loading="lazy" />
          </div>
          <div class="related-details">
            <h4 class="related-title">${escapeHtml(p.name)}</h4>
            <div class="related-price">${toman(price)}</div>
            <button class="btn btn-primary btn-sm" data-act="add-related-cart" data-id="${p.id}">
              + افزودن به سبد
            </button>
          </div>
        </div>`;
      })
      .join('');

    mount.innerHTML = `
      <article class="reader-view-container stack gap-lg">
        <!-- Back Navigation Breadcrumb -->
        <div class="reader-breadcrumb">
          <a href="#/articles" class="btn btn-ghost btn-sm">↵ بازگشت به مجله مقالات</a>
        </div>

        <!-- Article Hero Header -->
        <header class="reader-header card">
          <div class="reader-tags">
            ${article.tags.map((t) => `<span class="badge badge-tag">${escapeHtml(t)}</span>`).join('')}
            <span class="read-time-badge">⏱ زمان مطالعه: ${toPersianDigits(readTime)} دقیقه</span>
          </div>

          <h1 class="reader-title">${escapeHtml(article.title)}</h1>

          <div class="reader-meta-row">
            <div class="author-block">
              <span class="author-badge-icon">✍️</span>
              <div>
                <strong>${escapeHtml(article.author)}</strong>
                <div class="muted text-sm">تاریخ انتشار: ${jalali(article.createdAt)}</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Two Column Content Layout: Article Body + Sticky TOC Sidebar -->
        <div class="reader-layout-grid">
          <main class="reader-main-content card">
            ${parsedBodyHtml}
          </main>

          <aside class="reader-sidebar stack gap-md">
            <!-- Table of Contents Widget -->
            <div class="reader-toc-card card">
              <div class="toc-header">
                <span class="toc-icon">📑</span>
                <h3>فهرست مطالب مقاله</h3>
              </div>
              <ul class="toc-list">
                ${tocHtml}
              </ul>
            </div>

            <!-- Related Products Cross-Sell Widget -->
            ${
              related.length > 0
                ? `
              <div class="related-products-widget card">
                <div class="widget-header">
                  <span class="widget-icon">🛍️</span>
                  <h3>محصولات مرتبط با این مقاله</h3>
                </div>
                <p class="muted text-sm">تجهیزات و ابزارهای معرفی‌شده در متن:</p>
                <div class="related-products-stack">
                  ${relatedHtml}
                </div>
              </div>`
                : ''
            }
          </aside>
        </div>
      </article>
    `;
  }
}
