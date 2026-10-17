// @ts-check
/**
 * @fileoverview Authentication + session + RBAC logic.
 * Pattern: Service Layer so UI does not manipulate storage directly.
 */
export class AuthService {
  constructor(storage) { this.storage = storage; }
  async login(email, password) {
    await this.sleep();
    const users = this.storage.get('users') || [];
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('اطلاعات ورود نامعتبر است.');
    this.storage.set('session', { userId: user.id });
    return user;
  }
  logout() { this.storage.set('session', null); }
  currentUser() {
    const s = this.storage.get('session');
    const users = this.storage.get('users') || [];
    return users.find((u) => u.id === s?.userId) || null;
  }
  isAuthenticated() { return Boolean(this.currentUser()); }
  isAdmin() { return this.currentUser()?.role === 'admin'; }
  sleep() { return new Promise((r) => setTimeout(r, 150 + Math.floor(Math.random() * 250))); }
}
