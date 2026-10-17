// @ts-check
/**
 * @fileoverview Application Composition Root (Bootstrap/DI Layer).
 * Pattern: Dependency Injection + Mediator wiring to keep components loosely coupled.
 * Data flow: Services read/write repositories -> Store state -> pages/components render -> EventBus events.
 */
import { EventBus } from './core/EventBus.js';
import { Store } from './core/Store.js';
import { Router } from './core/Router.js';
import { seedData } from './data/seed.js';
import { StorageService } from './services/StorageService.js';
import { AuthService } from './services/AuthService.js';
import { ProductService } from './services/ProductService.js';
import { OrderService } from './services/OrderService.js';
import { ArticleService } from './services/ArticleService.js';
import { FeedbackService } from './services/FeedbackService.js';
import { Header } from './views/components/Header.js';
import { Footer } from './views/components/Footer.js';
import { CartDrawer } from './views/components/CartDrawer.js';
import { QuickViewModal } from './views/components/QuickViewModal.js';
import { Toast } from './views/components/Toast.js';
import { StorefrontPage } from './views/pages/StorefrontPage.js';
import { AuthPage } from './views/pages/AuthPage.js';
import { CheckoutPage } from './views/pages/CheckoutPage.js';
import { GatewayPage } from './views/pages/GatewayPage.js';
import { ArticlesPage } from './views/pages/ArticlesPage.js';
import { ContactPage } from './views/pages/ContactPage.js';
import { AdminPage } from './views/pages/AdminPage.js';
import { ProfilePage } from './views/pages/ProfilePage.js';

const bus = new EventBus();
const storage = new StorageService('ves', seedData);
const authService = new AuthService(storage);
const productService = new ProductService(storage);
const orderService = new OrderService(storage, authService);
const articleService = new ArticleService(storage, productService);
const feedbackService = new FeedbackService(storage);

const initialTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.dataset.theme = initialTheme;

const store = new Store(bus, {
  route: '/',
  cartOpen: false,
  theme: initialTheme,
  quickViewId: null,
  search: '',
  category: 'همه',
  stockOnly: false,
  sortBy: 'newest',
  priceMax: 999999999,
  otp: null
});

const appRoot = document.querySelector('#app');
const header = new Header(document.querySelector('#header-root'), { bus, store, authService, orderService, productService });
const footer = new Footer(document.querySelector('#footer-root'), { bus, feedbackService, articleService });
const cartDrawer = new CartDrawer(document.body, { bus, store, orderService, productService });
const modal = new QuickViewModal(document.querySelector('#modal-root'), { bus, productService, orderService });
const toast = new Toast(document.querySelector('#toast-root'), bus);

header.mount();
footer.mount();
cartDrawer.mount();
modal.mount();
toast.mount();

const pages = {
  '/': () => new StorefrontPage(appRoot, { bus, store, productService, orderService }),
  '/products': () => new StorefrontPage(appRoot, { bus, store, productService, orderService }),
  '/login': () => new AuthPage(appRoot, { bus, authService }),
  '/checkout': () => new CheckoutPage(appRoot, { bus, orderService, authService }),
  '/gateway': () => new GatewayPage(appRoot, { bus, store, orderService, authService }),
  '/articles': () => new ArticlesPage(appRoot, { bus, articleService, orderService }),
  '/article/:id': (params) => new ArticlesPage(appRoot, { bus, articleService, orderService, articleId: params.id }),
  '/contact': () => new ContactPage(appRoot, { bus, feedbackService }),
  '/admin': () => new AdminPage(appRoot, { bus, productService, orderService, feedbackService, authService }),
  '/profile': () => new ProfilePage(appRoot, { authService, orderService, productService })
};

let currentPage = null;

const router = new Router({
  bus,
  guards: [
    {
      match: '/admin',
      check: () => authService.isAdmin(),
      redirectTo: '/login'
    },
    {
      match: '/checkout',
      check: () => authService.isAuthenticated(),
      redirectTo: '/login'
    }
  ],
  onRoute(route, params) {
    store.set('route', route.path);
    if (currentPage) {
      currentPage.destroy();
    }
    const factory = pages[route.pattern] || pages['/'];
    currentPage = factory(params || {});
    currentPage.mount();
  }
});

bus.on('theme:toggle', () => {
  const next = store.state.theme === 'dark' ? 'light' : 'dark';
  store.set('theme', next);
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
});

bus.on('cart:toggle', () => store.set('cartOpen', !store.state.cartOpen));
bus.on('product:quickView', (id) => store.set('quickViewId', id));
bus.on('product:addToCart', async ({ id, qty = 1 }) => {
  await orderService.addToCart(id, qty);
  bus.emit('toast:add', { kind: 'success', text: 'محصول به سبد اضافه شد.' });
  bus.emit('cart:changed');
});

router.start();
