// @ts-check
/**
 * @fileoverview Cart/order domain service including promo and gateway simulation.
 * Pattern: Transaction Script service for checkout flow.
 */
export class OrderService {
  constructor(storage, authService) { this.storage = storage; this.authService = authService; }
  getCart() { return this.storage.get('cart') || []; }
  async addToCart(productId, qty = 1) {
    const cart = this.getCart();
    const row = cart.find((c) => c.productId === productId);
    if (row) row.qty += qty;
    else cart.push({ productId, qty });
    this.storage.set('cart', cart);
  }
  async updateQty(productId, qty) {
    const cart = this.getCart().map((i) => i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i);
    this.storage.set('cart', cart);
  }
  async removeFromCart(productId) { this.storage.set('cart', this.getCart().filter((i) => i.productId !== productId)); }
  async clearCart() { this.storage.set('cart', []); }
  promoOff(code) { return code === 'LEARN10' ? 0.1 : 0; }
  async placeOrder(total) {
    const user = this.authService.currentUser();
    if (!user) throw new Error('ابتدا وارد شوید.');
    const orders = this.storage.get('orders') || [];
    const cart = this.getCart();
    const order = { id: crypto.randomUUID(), userId: user.id, items: cart.map((c) => ({ ...c, price: 0 })), total, status: 'paid', createdAt: new Date().toISOString(), trackingCode: String(Date.now()).slice(-8) };
    orders.unshift(order);
    this.storage.set('orders', orders);
    await this.clearCart();
    return order;
  }
  userOrders() {
    const u = this.authService.currentUser();
    if (!u) return [];
    return (this.storage.get('orders') || []).filter((o) => o.userId === u.id);
  }
  allOrders() { return this.storage.get('orders') || []; }
  async setStatus(id, status) {
    const rows = this.storage.get('orders') || [];
    const idx = rows.findIndex((o) => o.id === id);
    if (idx >= 0) rows[idx].status = status;
    this.storage.set('orders', rows);
  }
}
