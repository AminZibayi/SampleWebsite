// @ts-check
/**
 * @fileoverview Product repository and query domain service.
 *
 * Architectural Layer: Domain Services / Catalog & Repository.
 * Pattern: Repository Pattern (Martin Fowler).
 *
 * Why the Repository Pattern?
 * UI components must never know HOW data is queried, sorted, or filtered under the hood.
 * By exposing high-level domain operations like `query({ category, priceMax, sortBy })`,
 * the presentation layer remains completely decoupled from whether the records originate
 * from localStorage, IndexedDB, or an external GraphQL/REST backend.
 *
 * Simulated Network Latency:
 * Each asynchronous method invokes `await this.sleep()`. This introduces realistic 150-350ms
 * latency, allowing students to observe and design proper skeleton loaders and async states
 * without relying on an external server.
 */

export class ProductService {
  /**
   * @param {import('./StorageService.js').StorageService} storage - Injected storage adapter.
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Retrieves all product records from storage.
   *
   * @returns {Promise<import('../types/typedefs.js').Product[]>} All catalog items.
   */
  async all() {
    await this.sleep();
    return this.storage.get('products') || [];
  }

  /**
   * Finds a single product by its unique ID.
   *
   * @param {string} id - Product ID.
   * @returns {Promise<import('../types/typedefs.js').Product|null>} Found product or null.
   */
  async byId(id) {
    const list = await this.all();
    return list.find((p) => p.id === id) || null;
  }

  /**
   * Queries products with multi-criteria filtering and sorting.
   *
   * @param {Object} criteria
   * @param {string} [criteria.search=''] - Keyword search across name and description.
   * @param {string} [criteria.category='همه'] - Category filter.
   * @param {boolean} [criteria.stockOnly=false] - If true, excludes items with 0 stock.
   * @param {string} [criteria.sortBy='newest'] - Sorting mode ('newest'|'priceAsc'|'priceDesc'|'popular').
   * @param {number} [criteria.priceMax=Infinity] - Maximum price cutoff.
   * @returns {Promise<import('../types/typedefs.js').Product[]>} Filtered and sorted products.
   */
  async query({
    search = '',
    category = 'همه',
    stockOnly = false,
    sortBy = 'newest',
    priceMax = Number.MAX_SAFE_INTEGER
  }) {
    let rows = await this.all();

    // Filter by price ceiling
    if (priceMax < Number.MAX_SAFE_INTEGER) {
      rows = rows.filter((p) => {
        const effectivePrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
        return effectivePrice <= priceMax;
      });
    }

    // Filter by category
    if (category && category !== 'همه') {
      rows = rows.filter((p) => p.category === category);
    }

    // Filter by available stock
    if (stockOnly) {
      rows = rows.filter((p) => p.stock > 0);
    }

    // Filter by search query
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort immutable copy
    return [...rows].sort(this.getSorter(sortBy));
  }

  /**
   * Retrieves flagship products for the Bento Hero showcase (highest rated and popularity).
   *
   * @param {number} [limit=2]
   * @returns {Promise<import('../types/typedefs.js').Product[]>}
   */
  async flagshipProducts(limit = 2) {
    const list = await this.all();
    return [...list].sort((a, b) => b.popularity - a.popularity).slice(0, limit);
  }

  /**
   * Retrieves active flash deal products (discount > 0).
   *
   * @param {number} [limit=3]
   * @returns {Promise<import('../types/typedefs.js').Product[]>}
   */
  async flashDeals(limit = 3) {
    const list = await this.all();
    return list.filter((p) => p.discount > 0).slice(0, limit);
  }

  /**
   * Creates or updates a product record (CRUD).
   *
   * @param {import('../types/typedefs.js').Product} payload - Product data.
   * @returns {Promise<import('../types/typedefs.js').Product>} Saved product.
   */
  async upsert(payload) {
    await this.sleep(100, 200);
    /** @type {import('../types/typedefs.js').Product[]} */
    const rows = this.storage.get('products') || [];
    const idx = rows.findIndex((p) => p.id === payload.id);

    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...payload };
    } else {
      rows.unshift(payload);
    }

    this.storage.set('products', rows);
    return payload;
  }

  /**
   * Deletes a product from the catalog by ID (CRUD).
   *
   * @param {string} id - Product ID to remove.
   * @returns {Promise<void>}
   */
  async remove(id) {
    await this.sleep(100, 200);
    /** @type {import('../types/typedefs.js').Product[]} */
    const rows = this.storage.get('products') || [];
    this.storage.set('products', rows.filter((p) => p.id !== id));
  }

  /**
   * Factory function returning a comparison predicate for Array.prototype.sort.
   *
   * @param {string} sortBy - Sort criteria identifier.
   * @returns {(a: import('../types/typedefs.js').Product, b: import('../types/typedefs.js').Product) => number}
   */
  getSorter(sortBy) {
    switch (sortBy) {
      case 'priceAsc':
        return (a, b) => a.price - b.price;
      case 'priceDesc':
        return (a, b) => b.price - a.price;
      case 'popular':
        return (a, b) => b.popularity - a.popularity;
      case 'rating':
        return (a, b) => b.rating - a.rating;
      case 'newest':
      default:
        return (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }

  /**
   * Simulates asynchronous network latency.
   *
   * @param {number} [min=120]
   * @param {number} [max=300]
   * @returns {Promise<void>}
   */
  sleep(min = 120, max = 300) {
    const ms = min + Math.floor(Math.random() * (max - min));
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
