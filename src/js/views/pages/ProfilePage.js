// @ts-check
/**
 * @fileoverview Customer profile dashboard with orders and wishlist snapshot.
 */
import { Component } from '../../core/Component.js';

export class ProfilePage extends Component {
  constructor(root, deps) { super(root); this.deps = deps; }
  render() {
    const user = this.deps.authService.currentUser();
    const orders = this.deps.orderService.userOrders();
    return `<section class="stack"><h1>داشبورد مشتری</h1><article class="card"><p>کاربر: ${user?.name || '-'}</p><p>علاقه‌مندی‌ها: ${(user?.wishlist || []).length}</p></article><article class="card"><h3>تاریخچه سفارش‌ها</h3>${orders.map((o) => `<div>${o.createdAt} - ${o.total} - ${o.trackingCode || '-'}</div>`).join('') || '<p>سفارشی ثبت نشده است.</p>'}</article></section>`;
  }
}
