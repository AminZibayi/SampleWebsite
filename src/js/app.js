// @ts-check
/**
 * @fileoverview Application Composition Root & Dependency Injection (DI) Container.
 *
 * Architectural Layer: Composition Root / Application Bootstrapper.
 * Pattern: Dependency Injection (DI) + Mediator + Front Controller Pattern.
 *
 * Why the Composition Root Pattern?
 * In professional software engineering (Mark Seemann, Dependency Injection in .NET),
 * the Composition Root is the unique single location in an application where the entire
 * dependency graph is composed.
 *
 * Instead of components importing singletons or constructing their own services:
 *  1. Low-level repositories and services are instantiated once.
 *  2. Central EventBus and reactive Store are initialized.
 *  3. Inverted dependencies are injected into UI components and pages (`new Header(root, deps)`).
 *
 * This pattern ensures that components remain pure, loosely coupled, and trivially mockable
 * in automated unit tests.
 */

import { EventBus } from './core/EventBus.js';
import { Store } from './core/Store.js';
import { Router } from './core/Router.js';
import { StorageService } from './services/StorageService.js';
import { AuthService } from './services/AuthService.js';
import { ProductService } from './services/ProductService.js';
import { OrderService } from './services/OrderService.js';
import { ArticleService } from './services/ArticleService.js';
import { FeedbackService } from './services/FeedbackService.js';
import { seedData } from './data/seed.js';

// Layout & Shell Components
import { Header } from './views/components/Header.js';
import { Footer } from './views/components/Footer.js';
import { CartDrawer } from './views/components/CartDrawer.js';
import { QuickViewModal } from './views/components/QuickViewModal.js';
import { Toast } from './views/components/Toast.js';

// Routed Pages
import { StorefrontPage } from './views/pages/StorefrontPage.js';
import { AuthPage } from './views/pages/AuthPage.js';
import { CheckoutPage } from './views/pages/CheckoutPage.js';
import { GatewayPage } from './views/pages/GatewayPage.js';
import { ArticlesPage } from './views/pages/ArticlesPage.js';
import { ContactPage } from './views/pages/ContactPage.js';
import { AdminPage } from './views/pages/AdminPage.js';
import { ProfilePage } from './views/pages/ProfilePage.js';

// ---------------------------------------------------------------------------
// 1. Dependency Graph Instantiation (Services & Core)
// ---------------------------------------------------------------------------
const bus = new EventBus();
const storage = new StorageService('ves_v2_db', seedData);
const authService = new AuthService(storage);
const productService = new ProductService(storage);
const orderService = new OrderService(storage, authService);
const articleService = new ArticleService(storage, productService);
const feedbackService = new FeedbackService(storage);

// ---------------------------------------------------------------------------
// 2. Theming Architecture (System Preference + LocalStorage Persistence)
// ---------------------------------------------------------------------------
const storedTheme = localStorage.getItem('ves_theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = storedTheme || (systemDark ? 'dark' : 'light');
document.documentElement.dataset.theme = initialTheme;

// ---------------------------------------------------------------------------
// 3. Central Reactive Store Initialization
// ---------------------------------------------------------------------------
const store = new Store(bus, {
  search: '',
  category: 'همه',
  stockOnly: false,
  sortBy: 'newest',
  priceMax: 100000000,
  cartOpen: false,
  quickViewId: null,
  theme: initialTheme
});

// ---------------------------------------------------------------------------
// 4. Shell Component Mounting (Header, Footer, Overlays)
// ---------------------------------------------------------------------------
const appRoot = document.querySelector('#app');
const headerRoot = document.querySelector('#header-root');
const footerRoot = document.querySelector('#footer-root');
const drawerRoot = document.querySelector('#drawer-root');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');

const header = new Header(headerRoot, {
  bus,
  store,
  authService,
  orderService,
  productService,
  articleService
});

const footer = new Footer(footerRoot, {
  bus,
  feedbackService,
  articleService
});

const cartDrawer = new CartDrawer(drawerRoot, {
  bus,
  store,
  orderService,
  productService
});

const quickViewModal = new QuickViewModal(modalRoot, {
  bus,
  productService,
  orderService,
  authService
});

const toastManager = new Toast(toastRoot, bus);

header.mount();
footer.mount();
cartDrawer.mount();
quickViewModal.mount();
toastManager.mount();

// ---------------------------------------------------------------------------
// 5. Client-Side Page Router & Strategy Route Guards
// ---------------------------------------------------------------------------
/** @type {Record<string, (match: import('./core/Router.js').RouteMatch) => import('./core/Component.js').Component>} */
const pageFactories = {
  '/': (match) =>
    new StorefrontPage(appRoot, { bus, store, productService, orderService, authService, query: match.query }),
  '/products': (match) =>
    new StorefrontPage(appRoot, { bus, store, productService, orderService, authService, query: match.query }),
  '/login': () =>
    new AuthPage(appRoot, { bus, authService }),
  '/checkout': () =>
    new CheckoutPage(appRoot, { bus, orderService, authService }),
  '/gateway': () =>
    new GatewayPage(appRoot, { bus, store, orderService, authService }),
  '/articles': (match) =>
    new ArticlesPage(appRoot, { bus, articleService, orderService, productService, query: match.query }),
  '/article/:id': (match) =>
    new ArticlesPage(appRoot, {
      bus,
      articleService,
      orderService,
      productService,
      articleId: match.params.id
    }),
  '/contact': () =>
    new ContactPage(appRoot, { bus, feedbackService }),
  '/admin': () =>
    new AdminPage(appRoot, { bus, productService, orderService, feedbackService, authService }),
  '/profile': () =>
    new ProfilePage(appRoot, { bus, authService, orderService, productService })
};

/** @type {import('./core/Component.js').Component|null} */
let currentPage = null;

const router = new Router({
  bus,
  guards: [
    {
      match: '/admin',
      check: () => authService.isAdmin(),
      redirectTo: '/login',
      reason: 'برای دسترسی به پنل مدیریت سیستم باید با حساب کاربری مدیر وارد شوید.'
    },
    {
      match: '/checkout',
      check: () => authService.isAuthenticated(),
      redirectTo: '/login',
      reason: 'برای ورود به مرحله تسویه‌حساب و پرداخت، ابتدا وارد حساب کاربری شوید.'
    },
    {
      match: '/profile',
      check: () => authService.isAuthenticated(),
      redirectTo: '/login',
      reason: 'مشاهده مشخصات کاربری و سوابق خرید نیازمند ورود به سامانه است.'
    }
  ],
  onRoute: async (match) => {
    // Teardown prior page component lifecycle to unbind listeners and free memory
    if (currentPage) {
      currentPage.destroy();
      currentPage = null;
    }

    const factory = pageFactories[match.pattern];
    if (factory) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      currentPage = factory(match);
      await currentPage.mount();
    }
  }
});

// ---------------------------------------------------------------------------
// 6. Global Event Handlers & Theme Subscriptions
// ---------------------------------------------------------------------------
bus.on('theme:toggle', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('ves_theme', next);
  store.set('theme', next);
  bus.emit('state:theme', next);
});

bus.on('cart:toggle', () => {
  store.set('cartOpen', !store.state.cartOpen);
});

bus.on('router:blocked', ({ reason }) => {
  bus.emit('toast:add', { kind: 'warning', text: reason });
});

// Start SPA Navigation
router.start();
