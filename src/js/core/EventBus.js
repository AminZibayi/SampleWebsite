// @ts-check
/**
 * @fileoverview Core EventBus (Observer/Pub-Sub Pattern).
 * Why: decouples modules so components communicate without direct references.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.map = new Map();
  }
  /** @param {string} event @param {(payload:any)=>void} handler */
  on(event, handler) {
    if (!this.map.has(event)) this.map.set(event, new Set());
    this.map.get(event)?.add(handler);
    return () => this.off(event, handler);
  }
  /** @param {string} event @param {(payload:any)=>void} handler */
  off(event, handler) { this.map.get(event)?.delete(handler); }
  /** @param {string} event @param {any} [payload] */
  emit(event, payload = undefined) { this.map.get(event)?.forEach((fn) => fn(payload)); }
}
