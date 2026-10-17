// @ts-check
/**
 * @fileoverview Article repository/service.
 * Pattern: Query service returning derived data (reading time/related products).
 */
export class ArticleService {
  constructor(storage, productService) { this.storage = storage; this.productService = productService; }
  async all() { await this.sleep(); return this.storage.get('articles') || []; }
  async byId(id) { const rows = await this.all(); return rows.find((a) => a.id === id) || null; }
  estimateRead(body) { return Math.max(1, Math.ceil(body.length / 700)); }
  async relatedProducts(article) {
    const products = await this.productService.all();
    return products.filter((p) => article.relatedProductIds.includes(p.id));
  }
  sleep() { return new Promise((r) => setTimeout(r, 150 + Math.floor(Math.random() * 250))); }
}
