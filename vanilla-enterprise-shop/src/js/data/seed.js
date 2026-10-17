// @ts-check
/**
 * @fileoverview Static seed data for first boot.
 * Pattern: Seed Repository snapshot to make localStorage deterministic.
 */
export const seedData = {
  users: [
    { id: 'u1', name: 'ادمین', email: 'admin@example.com', role: 'admin', password: 'admin123', wishlist: [] },
    { id: 'u2', name: 'مشتری', email: 'user@example.com', role: 'customer', password: 'user123', wishlist: [] }
  ],
  session: null,
  products: [
    { id: 'p1', name: 'لپ‌تاپ حرفه‌ای', price: 65000000, discount: 10, category: 'دیجیتال', stock: 8, rating: 4.6, popularity: 80, image: '', description: 'برای توسعه و طراحی', createdAt: '2026-09-01' },
    { id: 'p2', name: 'هدفون نویزکنسلینگ', price: 7500000, discount: 0, category: 'صوتی', stock: 16, rating: 4.4, popularity: 70, image: '', description: 'تجربه صدای شفاف', createdAt: '2026-08-11' },
    { id: 'p3', name: 'گوشی هوشمند', price: 42000000, discount: 6, category: 'دیجیتال', stock: 0, rating: 4.2, popularity: 95, image: '', description: 'دوربین پیشرفته', createdAt: '2026-07-20' }
  ],
  articles: [
    { id: 'a1', title: 'راهنمای انتخاب لپ‌تاپ', body: '## مقدمه\\nانتخاب لپ‌تاپ مناسب ...', tags: ['دیجیتال'], author: 'تحریریه', createdAt: '2026-09-22', relatedProductIds: ['p1'] },
    { id: 'a2', title: 'چطور هدفون خوب بخریم', body: '## نکات مهم\\nبه امپدانس توجه کنید ...', tags: ['صوتی'], author: 'تحریریه', createdAt: '2026-09-05', relatedProductIds: ['p2'] }
  ],
  orders: [],
  feedback: [],
  cart: []
};
