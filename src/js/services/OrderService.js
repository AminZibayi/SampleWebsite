// @ts-check
/**
 * @fileoverview Shopping cart and checkout order processing domain service.
 *
 * Architectural Layer: Domain Services / Cart & Order Management.
 * Pattern: Transaction Script Pattern / Service Layer.
 *
 * Educational Concept: Cart Hydration & Checkout Consistency:
 * Storing only minimal references in the cart (`[{ productId, qty }]`) prevents stale data.
 * When the user views the cart or proceeds to checkout, `getCartSummary()` hydrates the items
 * against current catalog prices, active product discounts, and stock availability.
 *
 * During final checkout via `placeOrder()`:
 *  1. Authenticated user identity is verified.
 *  2. Stock levels are deducted from the product inventory.
 *  3. An immutable snapshot of line items and prices is persisted inside the Order record.
 *  4. An 8-digit tracking code is generated.
 *  5. The shopping cart is cleared.
 */

export class OrderService {
  /**
   * @param {import('./StorageService.js').StorageService} storage - Storage gateway.
   * @param {import('./AuthService.js').AuthService} authService - Identity provider.
   */
  constructor(storage, authService) {
    this.storage = storage;
    this.authService = authService;
  }

  /**
   * Retrieves raw cart items from storage.
   *
   * @returns {import('../types/typedefs.js').CartItem[]}
   */
  getCart() {
    return this.storage.get('cart') || [];
  }

  /**
   * Hydrates the cart with live product records, calculating subtotals, item discounts, and stock status.
   *
   * @returns {Promise<{
   *   items: Array<import('../types/typedefs.js').Product & { qty: number, lineTotal: number }>,
   *   subtotal: number,
   *   itemCount: number
   * }>}
   */
  async getCartSummary() {
    /** @type {import('../types/typedefs.js').Product[]} */
    const products = this.storage.get('products') || [];
    const cart = this.getCart();

    /** @type {Array<import('../types/typedefs.js').Product & { qty: number, lineTotal: number }>} */
    const items = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const c of cart) {
      const p = products.find((prod) => prod.id === c.productId);
      if (p) {
        const effectivePrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
        const lineTotal = effectivePrice * c.qty;
        items.push({ ...p, qty: c.qty, lineTotal });
        subtotal += lineTotal;
        itemCount += c.qty;
      }
    }

    return { items, subtotal, itemCount };
  }

  /**
   * Adds a product to the cart or increments its quantity if already present.
   *
   * @param {string} productId - Product ID.
   * @param {number} [qty=1] - Quantity to add.
   * @returns {Promise<import('../types/typedefs.js').CartItem[]>} Updated cart.
   */
  async addToCart(productId, qty = 1) {
    const cart = this.getCart();
    const existing = cart.find((item) => item.productId === productId);

    /** @type {import('../types/typedefs.js').Product[]} */
    const products = this.storage.get('products') || [];
    const prod = products.find((p) => p.id === productId);
    const maxStock = prod ? prod.stock : 999;

    if (existing) {
      existing.qty = Math.min(existing.qty + qty, maxStock);
    } else {
      cart.push({ productId, qty: Math.min(qty, maxStock) });
    }

    this.storage.set('cart', cart);
    return cart;
  }

  /**
   * Updates the exact quantity of a cart line item.
   *
   * @param {string} productId - Product ID.
   * @param {number} qty - Desired quantity (minimum 1).
   * @returns {Promise<void>}
   */
  async updateQty(productId, qty) {
    const cart = this.getCart();
    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      existing.qty = Math.max(1, qty);
      this.storage.set('cart', cart);
    }
  }

  /**
   * Removes a specific item from the shopping cart.
   *
   * @param {string} productId - Product ID to remove.
   * @returns {Promise<void>}
   */
  async removeFromCart(productId) {
    const cart = this.getCart().filter((item) => item.productId !== productId);
    this.storage.set('cart', cart);
  }

  /**
   * Empties all items from the shopping cart.
   *
   * @returns {Promise<void>}
   */
  async clearCart() {
    this.storage.set('cart', []);
  }

  /**
   * Evaluates promotional coupon codes and calculates discount deduction.
   *
   * Educational note:
   * Valid codes:
   *  - 'LEARN10' -> 10% discount
   *  - 'TECH20'  -> 20% discount
   *
   * @param {string} code - Promo code entered by the user.
   * @param {number} subtotal - Subtotal amount before discount.
   * @returns {{ valid: boolean, percent: number, discountAmount: number, message: string }}
   */
  promoDiscount(code, subtotal) {
    const clean = (code || '').trim().toUpperCase();
    if (!clean) {
      return { valid: false, percent: 0, discountAmount: 0, message: '' };
    }

    if (clean === 'LEARN10') {
      const discountAmount = Math.round(subtotal * 0.1);
      return { valid: true, percent: 10, discountAmount, message: 'کد تخفیف ۱۰٪ دانشجویی اعمال شد.' };
    }

    if (clean === 'TECH20') {
      const discountAmount = Math.round(subtotal * 0.2);
      return { valid: true, percent: 20, discountAmount, message: 'کد تخفیف ۲۰٪ ویژه تکنولوژی اعمال شد.' };
    }

    return { valid: false, percent: 0, discountAmount: 0, message: 'کد تخفیف وارد شده معتبر یا فعال نیست.' };
  }

  /**
   * Places and records a completed order after payment authorization.
   *
   * @param {Object} orderData
   * @param {number} orderData.total - Final paid total.
   * @param {string} [orderData.address] - Shipping address.
   * @param {string} [orderData.phone] - Contact phone.
   * @param {string} [orderData.promoCode] - Used coupon code.
   * @returns {Promise<import('../types/typedefs.js').Order>} The newly created Order record.
   */
  async placeOrder({ total, address = '', phone = '', promoCode = '' }) {
    const user = this.authService.currentUser();
    if (!user) {
      throw new Error('برای تکمیل فرایند سفارش، ابتدا وارد حساب کاربری خود شوید.');
    }

    const { items, subtotal } = await this.getCartSummary();
    if (items.length === 0) {
      throw new Error('سبد خرید شما خالی است.');
    }

    const promo = this.promoDiscount(promoCode, subtotal);

    /** @type {import('../types/typedefs.js').OrderItem[]} */
    const orderItems = items.map((i) => ({
      productId: i.id,
      name: i.name,
      qty: i.qty,
      price: Math.round(i.price * (1 - (i.discount || 0) / 100))
    }));

    // Deduct stock from products inventory
    /** @type {import('../types/typedefs.js').Product[]} */
    const products = this.storage.get('products') || [];
    for (const item of items) {
      const prod = products.find((p) => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.qty);
      }
    }
    this.storage.set('products', products);

    // Generate random 8-digit tracking reference code
    const trackingCode = String(Math.floor(10000000 + Math.random() * 90000000));

    /** @type {import('../types/typedefs.js').Order} */
    const newOrder = {
      id: `ord-${trackingCode}`,
      userId: user.id,
      items: orderItems,
      subtotal,
      discount: promo.discountAmount,
      total,
      status: 'paid',
      createdAt: new Date().toISOString(),
      trackingCode,
      address,
      phone
    };

    /** @type {import('../types/typedefs.js').Order[]} */
    const orders = this.storage.get('orders') || [];
    orders.unshift(newOrder);
    this.storage.set('orders', orders);

    // Empty shopping cart
    await this.clearCart();

    return newOrder;
  }

  /**
   * Retrieves orders belonging specifically to the currently logged in customer.
   *
   * @returns {import('../types/typedefs.js').Order[]} Customer's past orders.
   */
  userOrders() {
    const user = this.authService.currentUser();
    if (!user) return [];
    /** @type {import('../types/typedefs.js').Order[]} */
    const all = this.storage.get('orders') || [];
    return all.filter((o) => o.userId === user.id);
  }

  /**
   * Retrieves all orders across the platform for administrative inspection.
   *
   * @returns {import('../types/typedefs.js').Order[]}
   */
  allOrders() {
    return this.storage.get('orders') || [];
  }

  /**
   * Updates an order's status (e.g. 'paid' -> 'shipped' -> 'delivered').
   *
   * @param {string} orderId - Order identifier.
   * @param {'pending'|'paid'|'shipped'|'delivered'|'cancelled'} status - New lifecycle status.
   * @returns {Promise<void>}
   */
  async setStatus(orderId, status) {
    /** @type {import('../types/typedefs.js').Order[]} */
    const orders = this.storage.get('orders') || [];
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx].status = status;
      this.storage.set('orders', orders);
    }
  }
}
