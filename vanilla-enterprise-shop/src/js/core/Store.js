// @ts-check
/**
 * @fileoverview Reactive Store using ES Proxy trap.
 * Why: Proxy catches state writes and emits fine-grained events instead of repainting all UI.
 */
export class Store {
  /** @param {import('./EventBus.js').EventBus} bus @param {Record<string, any>} initial */
  constructor(bus, initial) {
    this.bus = bus;
    this.state = new Proxy({ ...initial }, {
      set: (target, prop, value) => {
        Reflect.set(target, prop, value);
        if (typeof prop === 'symbol') return true;
        this.bus.emit(`state:${String(prop)}`, value);
        this.bus.emit('state:changed', { key: String(prop), value });
        return true;
      }
    });
  }
  /** @param {string} key @param {any} value */
  set(key, value) { this.state[key] = value; }
}
