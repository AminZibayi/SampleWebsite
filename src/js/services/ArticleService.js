// @ts-check
/**
 * @fileoverview Editorial articles and tech magazine repository.
 *
 * Architectural Layer: Domain Services / Editorial & Content Repository.
 * Pattern: Repository Pattern / Derived Content Aggregator.
 *
 * Educational Importance:
 * High-value e-commerce platforms blend editorial content with product commerce (content-driven
 * commerce). This service derives reading time, extracts tags, parses headings for table
 * of contents (TOC), and resolves cross-references between articles and purchasable products.
 */

export class ArticleService {
  /**
   * @param {import('./StorageService.js').StorageService} storage - Injected storage gateway.
   * @param {import('./ProductService.js').ProductService} productService - Injected product catalog.
   */
  constructor(storage, productService) {
    this.storage = storage;
    this.productService = productService;
  }

  /**
   * Retrieves all published articles.
   *
   * @returns {Promise<import('../types/typedefs.js').Article[]>}
   */
  async all() {
    await this.sleep();
    return this.storage.get('articles') || [];
  }

  /**
   * Retrieves an article by its unique identifier.
   *
   * @param {string} id - Article ID.
   * @returns {Promise<import('../types/typedefs.js').Article|null>}
   */
  async byId(id) {
    const articles = await this.all();
    return articles.find((a) => a.id === id) || null;
  }

  /**
   * Queries articles matching an optional search term and tag filter.
   *
   * @param {Object} options
   * @param {string} [options.search=''] - Keyword search across title, excerpt, and body.
   * @param {string} [options.tag=''] - Specific topic tag filter.
   * @returns {Promise<import('../types/typedefs.js').Article[]>}
   */
  async query({ search = '', tag = '' } = {}) {
    let rows = await this.all();

    if (tag && tag !== 'همه') {
      rows = rows.filter((a) => a.tags && a.tags.includes(tag));
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return rows;
  }

  /**
   * Collects all unique tags used across articles for filter pills.
   *
   * @returns {Promise<string[]>} List of unique tags.
   */
  async allTags() {
    const articles = await this.all();
    const set = new Set();
    for (const a of articles) {
      if (Array.isArray(a.tags)) {
        a.tags.forEach((t) => set.add(t));
      }
    }
    return Array.from(set);
  }

  /**
   * Estimates reading duration based on typical Persian adult reading speed (~200 words per minute).
   *
   * @param {string} body - Full markdown text of the article.
   * @returns {number} Estimated minutes.
   */
  estimateRead(body) {
    if (!body) return 1;
    const words = body.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  }

  /**
   * Resolves related product models associated with this article for inline cross-selling.
   *
   * @param {import('../types/typedefs.js').Article} article - Article record.
   * @returns {Promise<import('../types/typedefs.js').Product[]>} Hydrated product list.
   */
  async relatedProducts(article) {
    if (!article.relatedProductIds || article.relatedProductIds.length === 0) {
      return [];
    }

    const allProducts = await this.productService.all();
    return allProducts.filter((p) => article.relatedProductIds.includes(p.id));
  }

  /**
   * Simulates asynchronous network latency.
   *
   * @param {number} [min=120]
   * @param {number} [max=280]
   * @returns {Promise<void>}
   */
  sleep(min = 120, max = 280) {
    const ms = min + Math.floor(Math.random() * (max - min));
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
