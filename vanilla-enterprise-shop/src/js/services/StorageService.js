// @ts-check
/**
 * @fileoverview Storage adapter around localStorage.
 * Pattern: Gateway/Adapter to isolate persistence concerns and recovery.
 */
export class StorageService {
  /** @param {string} namespace @param {Record<string, any>} seed */
  constructor(namespace, seed) {
    this.key = namespace;
    if (!localStorage.getItem(this.key)) this.write(seed);
  }
  read() {
    try { return JSON.parse(localStorage.getItem(this.key) || '{}'); }
    catch { return {}; }
  }
  write(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
  get(name) { return this.read()[name]; }
  set(name, value) {
    const all = this.read();
    all[name] = value;
    this.write(all);
  }
}
