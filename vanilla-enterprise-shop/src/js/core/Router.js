// @ts-check
/**
 * @fileoverview Hash SPA Router with Strategy-like guard chain.
 * Why: guard middleware keeps auth checks outside page components.
 */
export class Router {
  /** @param {{bus:any,guards:Array<{match:string,check:()=>boolean,redirectTo:string}>,onRoute:(route:any,params:any)=>void}} config */
  constructor(config) {
    this.config = config;
    this.routes = ['/','/products','/login','/checkout','/gateway','/articles','/article/:id','/contact','/admin','/profile'];
  }
  start() {
    window.addEventListener('hashchange', () => this.resolve());
    this.resolve();
  }
  resolve() {
    const raw = location.hash.replace('#', '') || '/';
    const match = this.match(raw);
    if (!match) { location.hash = '#/'; return; }
    const blocked = this.config.guards.find((g) => g.match === match.pattern && !g.check());
    if (blocked) { location.hash = `#${blocked.redirectTo}`; return; }
    this.config.onRoute(match, match.params);
  }
  /** @param {string} path */
  match(path) {
    for (const pattern of this.routes) {
      if (!pattern.includes(':') && pattern === path) return { path, pattern, params: {} };
      const a = pattern.split('/');
      const b = path.split('/');
      if (a.length !== b.length) continue;
      /** @type {Record<string,string>} */
      const params = {};
      const ok = a.every((seg, i) => {
        if (seg.startsWith(':')) { params[seg.slice(1)] = b[i]; return true; }
        return seg === b[i];
      });
      if (ok) return { path, pattern, params };
    }
    return null;
  }
}
