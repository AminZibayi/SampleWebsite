// @ts-check
/**
 * @fileoverview Single Page Application (SPA) Client-Side Hash Router with Route Guards.
 *
 * Architectural Layer: Application Core / Navigation Routing.
 * Pattern: Strategy Pattern + Middleware Guard Chain.
 *
 * Why Hash Routing over History API for this educational project?
 * 1. Zero Server Configuration: When deploying static vanilla web apps on GitHub Pages,
 *    Netlify, or local file servers, the HTML5 History API (`pushState`) causes 404 errors
 *    when reloading on sub-routes (`/products/123`), because the server tries to find a
 *    physical directory. Hash navigation (`#/products/123`) is strictly client-side; the server
 *    always serves `index.html`.
 * 2. Predictability: The `hashchange` browser event provides a unified, cross-browser
 *    trigger for all navigation events, including back/forward history buttons.
 *
 * How Route Guards Work (Middleware Pattern):
 * Before resolving any route match, the router evaluates an array of guard predicates.
 * If any guard check returns `false`, navigation to the requested route is intercepted,
 * and the user is redirected to `guard.redirectTo` with an explanation emitted to EventBus.
 */

/**
 * @typedef {Object} RouteGuard
 * @property {string} match - Route pattern to protect (e.g., '/admin' or '/checkout').
 * @property {() => boolean} check - Predicate returning true if allowed, false if blocked.
 * @property {string} redirectTo - Fallback route if blocked (e.g., '/login').
 * @property {string} [reason] - Educational explanation why access was denied.
 */

/**
 * @typedef {Object} RouteMatch
 * @property {string} path - The sanitized path without hash or query string (e.g. '/article/art-01').
 * @property {string} pattern - The matching route pattern (e.g. '/article/:id').
 * @property {Record<string, string>} params - Dynamic route parameters.
 * @property {Record<string, string>} query - Parsed URL query parameters.
 */

export class Router {
  /**
   * @param {Object} options
   * @param {import('./EventBus.js').EventBus} options.bus - EventBus instance for navigation events.
   * @param {RouteGuard[]} [options.guards] - Array of route protection middlewares.
   * @param {(match: RouteMatch) => void} options.onRoute - Callback executed when a route is resolved.
   */
  constructor(options) {
    this.bus = options.bus;
    this.guards = options.guards || [];
    this.onRoute = options.onRoute;

    /**
     * Supported route pattern registry.
     * Order matters: specific static routes before dynamic parametric patterns.
     * @type {string[]}
     */
    this.routes = [
      '/',
      '/products',
      '/login',
      '/checkout',
      '/gateway',
      '/articles',
      '/article/:id',
      '/contact',
      '/admin',
      '/profile'
    ];

    /** @type {RouteMatch|null} */
    this.current = null;

    /** @private @type {(() => void)|null} */
    this._listener = null;
  }

  /**
   * Starts listening to browser hash navigation.
   */
  start() {
    this._listener = () => this.resolve();
    window.addEventListener('hashchange', this._listener);
    // Initial resolution for the first load
    this.resolve();
  }

  /**
   * Programmatically navigates to a hash path.
   *
   * @param {string} path - Destination path (e.g., '/products' or '#/products').
   */
  navigate(path) {
    const clean = path.startsWith('#') ? path : `#${path}`;
    if (location.hash === clean) {
      // Force resolve if already on the same hash
      this.resolve();
    } else {
      location.hash = clean;
    }
  }

  /**
   * Resolves the current URL hash, checks route guards, and triggers the route handler.
   */
  resolve() {
    const rawHash = location.hash.replace(/^#/, '') || '/';

    // Parse path and query string: e.g. '/products?category=audio&sort=priceAsc'
    const [pathPart, queryPart] = rawHash.split('?');
    const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;

    /** @type {Record<string, string>} */
    const query = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        query[key] = val;
      });
    }

    const match = this.match(path, query);
    if (!match) {
      console.warn(`[Router] No route match found for "${path}". Redirecting to default home route.`);
      this.navigate('/');
      return;
    }

    // Evaluate Route Guards (Strategy / Interceptor pattern)
    for (const guard of this.guards) {
      if (guard.match === match.pattern) {
        const allowed = guard.check();
        if (!allowed) {
          console.warn(`[Router] Guard blocked route "${match.path}". Reason: ${guard.reason || 'Unauthorized'}`);
          this.bus.emit('router:blocked', {
            target: match.path,
            redirectTo: guard.redirectTo,
            reason: guard.reason || 'دسترسی به این بخش محدود شده است.'
          });
          this.navigate(guard.redirectTo);
          return;
        }
      }
    }

    this.current = match;
    this.bus.emit('router:navigate', match);
    this.onRoute(match);
  }

  /**
   * Matches a path against registered route patterns and extracts parameters.
   *
   * @param {string} path - Clean path (e.g. '/article/art-01').
   * @param {Record<string, string>} query - Query parameters dictionary.
   * @returns {RouteMatch|null} Match object with extracted params or null.
   */
  match(path, query) {
    for (const pattern of this.routes) {
      // Direct static match without params
      if (!pattern.includes(':') && pattern === path) {
        return { path, pattern, params: {}, query };
      }

      // Dynamic parameter matching: split segments
      const patternSegments = pattern.split('/').filter(Boolean);
      const pathSegments = path.split('/').filter(Boolean);

      if (patternSegments.length !== pathSegments.length) {
        continue;
      }

      /** @type {Record<string, string>} */
      const params = {};
      let matched = true;

      for (let i = 0; i < patternSegments.length; i++) {
        const pSeg = patternSegments[i];
        const uSeg = pathSegments[i];

        if (pSeg.startsWith(':')) {
          const paramName = pSeg.slice(1);
          params[paramName] = decodeURIComponent(uSeg);
        } else if (pSeg !== uSeg) {
          matched = false;
          break;
        }
      }

      if (matched) {
        return { path, pattern, params, query };
      }
    }

    return null;
  }

  /**
   * Destroys router listeners.
   */
  destroy() {
    if (this._listener) {
      window.removeEventListener('hashchange', this._listener);
      this._listener = null;
    }
  }
}
