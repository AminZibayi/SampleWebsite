// @ts-check
/**
 * @fileoverview Product repository/service with CRUD and filtering.
 * Pattern: Repository abstraction for domain queries.
 */
export class ProductService {
  constructor(storage) { this.storage = storage; }
  async all() { await this.sleep(); return this.storage.get('products') || []; }
  async byId(id) { const rows = await this.all(); return rows.find((p) => p.id === id) || null; }
  async query({ search = '', category = 'همه', stockOnly = false, sortBy = 'newest', priceMax = Number.MAX_SAFE_INTEGER }) {
    let rows = await this.all();
    rows = rows.filter((p) => p.price <= priceMax);
    if (category !== 'همه') rows = rows.filter((p) => p.category === category);
    if (stockOnly) rows = rows.filter((p) => p.stock > 0);
    if (search.trim()) {
      const q = search.trim();
      rows = rows.filter((p) => p.name.includes(q) || p.description.includes(q));
    }
    rows.sort(this.sorter(sortBy));
    return rows;
  }
  sorter(sortBy) {
    if (sortBy === 'priceAsc') return (a, b) => a.price - b.price;
    if (sortBy === 'priceDesc') return (a, b) => b.price - a.price;
    if (sortBy === 'popular') return (a, b) => b.popularity - a.popularity;
    return (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt);
  }
  async upsert(payload) {
    const rows = this.storage.get('products') || [];
    const idx = rows.findIndex((p) => p.id === payload.id);
    if (idx >= 0) rows[idx] = { ...rows[idx], ...payload };
    else rows.unshift(payload);
    this.storage.set('products', rows);
    return payload;
  }
  async remove(id) {
    const rows = this.storage.get('products') || [];
    this.storage.set('products', rows.filter((p) => p.id !== id));
  }
  sleep() { return new Promise((r) => setTimeout(r, 150 + Math.floor(Math.random() * 250))); }
}
