// @ts-check
/**
 * @fileoverview Authentication, user session management, and Role-Based Access Control (RBAC).
 *
 * Architectural Layer: Domain Services / Security & Identity.
 * Pattern: Service Layer Pattern + Repository Access.
 *
 * Educational Concept: Simulated JWT & Client-Side Session:
 * In a real production architecture, successful authentication returns a cryptographically
 * signed JSON Web Token (JWT) or an HTTP-Only session cookie.
 *
 * Here, we simulate that behavior by generating a mock session token with expiration metadata
 * stored securely in the `StorageService`. Route guards and UI components consult this service
 * rather than peeking into storage directly, maintaining a clean Separation of Concerns (SoC).
 */

export class AuthService {
  /**
   * @param {import('./StorageService.js').StorageService} storage - Injected storage gateway.
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Authenticates a user with email and password credentials.
   * Simulates realistic network round-trip delay.
   *
   * @param {string} email - User email address.
   * @param {string} password - User password.
   * @returns {Promise<import('../types/typedefs.js').User>} Resolves with the authenticated user.
   * @throws {Error} If credentials are invalid.
   */
  async login(email, password) {
    await this.sleep(150, 300);

    /** @type {import('../types/typedefs.js').User[]} */
    const users = this.storage.get('users') || [];
    const matched = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim() && u.password === password
    );

    if (!matched) {
      throw new Error('ایمیل یا رمز عبور وارد شده نادرست است.');
    }

    // Persist simulated session token
    this.storage.set('session', {
      userId: matched.id,
      token: `sim-jwt-${matched.id}-${Date.now()}`,
      issuedAt: new Date().toISOString()
    });

    return matched;
  }

  /**
   * Clears the current authenticated session.
   */
  logout() {
    this.storage.set('session', null);
  }

  /**
   * Retrieves the currently authenticated user profile, or null if guest.
   *
   * @returns {import('../types/typedefs.js').User|null} Current user or null.
   */
  currentUser() {
    const session = this.storage.get('session');
    if (!session || !session.userId) return null;

    /** @type {import('../types/typedefs.js').User[]} */
    const users = this.storage.get('users') || [];
    return users.find((u) => u.id === session.userId) || null;
  }

  /**
   * Checks whether an active authenticated session exists.
   *
   * @returns {boolean} True if logged in.
   */
  isAuthenticated() {
    return this.currentUser() !== null;
  }

  /**
   * Role-Based Access Control (RBAC) check for administrative privileges.
   *
   * @returns {boolean} True if the current user has the 'admin' role.
   */
  isAdmin() {
    const user = this.currentUser();
    return user !== null && user.role === 'admin';
  }

  /**
   * Toggles a product in the user's saved wishlist.
   *
   * @param {string} productId - Product ID to add or remove.
   * @returns {Promise<{ inWishlist: boolean, count: number }>} Updated wishlist status.
   */
  async toggleWishlist(productId) {
    const user = this.currentUser();
    if (!user) {
      throw new Error('برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری خود شوید.');
    }

    /** @type {import('../types/typedefs.js').User[]} */
    const users = this.storage.get('users') || [];
    const userIdx = users.findIndex((u) => u.id === user.id);
    if (userIdx === -1) throw new Error('کاربر یافت نشد.');

    const wishlist = users[userIdx].wishlist || [];
    const existsIndex = wishlist.indexOf(productId);
    let inWishlist = false;

    if (existsIndex >= 0) {
      wishlist.splice(existsIndex, 1);
      inWishlist = false;
    } else {
      wishlist.push(productId);
      inWishlist = true;
    }

    users[userIdx].wishlist = wishlist;
    this.storage.set('users', users);

    return { inWishlist, count: wishlist.length };
  }

  /**
   * Checks whether a product is currently in the active user's wishlist.
   *
   * @param {string} productId - Product ID.
   * @returns {boolean} True if saved.
   */
  isInWishlist(productId) {
    const user = this.currentUser();
    if (!user || !user.wishlist) return false;
    return user.wishlist.includes(productId);
  }

  /**
   * Simulates asynchronous network latency.
   *
   * @param {number} [min=150] - Minimum milliseconds.
   * @param {number} [max=350] - Maximum milliseconds.
   * @returns {Promise<void>}
   */
  sleep(min = 150, max = 350) {
    const ms = min + Math.floor(Math.random() * (max - min));
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
