// @ts-check
/**
 * @fileoverview Reactive State Container utilizing ES6 Proxy traps and EventBus observer notifications.
 *
 * Architectural Layer: Application Core / Reactive State Management.
 * Pattern: Proxy Pattern (GoF) + Observer Pattern.
 *
 * Why this pattern?
 * In framework-less Vanilla JS, developers frequently suffer from either:
 *  1. Excessive full-DOM repaints whenever anything changes (destroying input focus and animations).
 *  2. Spaghetti imperative code manually updating each DOM element on every user click.
 *
 * The Proxy-based Store solves this by intercepting property assignments:
 * Whenever any code mutates `store.state.cartOpen = true`, the Proxy's `set` trap automatically:
 *  - Updates the internal state object via `Reflect.set()`.
 *  - Emits a specific event: `state:cartOpen` (notifying only components that care about the cart).
 *  - Emits a global event: `state:changed` (notifying debugging tools or generic state inspectors).
 *
 * How ES6 Proxy Traps Work:
 * A Proxy wraps a target object and redefines fundamental operations (like [[Get]], [[Set]],
 * or [[Delete]]). When a property is set on the proxy, the engine pauses and invokes our `set`
 * trap function with (target, property, value, receiver). We return `true` to signal success.
 *
 * @template {Record<string, any>} T
 */

export class Store {
  /**
   * Initializes the reactive Store.
   *
   * @param {import('./EventBus.js').EventBus} bus - EventBus instance used to broadcast state events.
   * @param {T} initialState - Initial snapshot of the state object.
   */
  constructor(bus, initialState) {
    /**
     * @type {import('./EventBus.js').EventBus}
     * @private
     */
    this._bus = bus;

    /**
     * The internal raw state object.
     * @type {T}
     * @private
     */
    this._rawState = { ...initialState };

    /**
     * The reactive Proxy facade exposed to the outside world.
     * Mutations to properties on this object trigger event notifications automatically.
     * @type {T}
     */
    this.state = new Proxy(this._rawState, {
      set: (target, prop, value, receiver) => {
        // Prevent unnecessary emits if the value has not changed (primitive identity or reference match)
        if (Reflect.get(target, prop, receiver) === value) {
          return true;
        }

        const success = Reflect.set(target, prop, value, receiver);
        if (success && typeof prop === 'string') {
          // Fine-grained notification for subscribers watching this exact property
          this._bus.emit(`state:${prop}`, value);
          // General state audit notification
          this._bus.emit('state:changed', { key: prop, value });
        }
        return success;
      }
    });
  }

  /**
   * Helper method to update a state key.
   * Equivalent to `store.state[key] = value`, but offers fluent syntax.
   *
   * @template {keyof T} K
   * @param {K} key - The property key to update.
   * @param {T[K]} value - The new value to assign.
   */
  set(key, value) {
    this.state[key] = value;
  }

  /**
   * Helper method to read a state key.
   *
   * @template {keyof T} K
   * @param {K} key - The property key to read.
   * @returns {T[K]} Current value in state.
   */
  get(key) {
    return this.state[key];
  }

  /**
   * Convenience helper to subscribe directly to changes of a specific state property.
   *
   * @template {keyof T} K
   * @param {K} key - State key name.
   * @param {(value: T[K]) => void} handler - Callback with the updated value.
   * @returns {() => void} Unsubscribe function.
   */
  subscribe(key, handler) {
    return this._bus.on(`state:${String(key)}`, handler);
  }

  /**
   * Returns a detached, non-reactive shallow clone of the current state snapshot.
   * Useful for serialization, logging, or debugging.
   *
   * @returns {T} Frozen shallow copy of state.
   */
  snapshot() {
    return Object.freeze({ ...this._rawState });
  }
}
