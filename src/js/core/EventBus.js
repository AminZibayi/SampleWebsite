// @ts-check
/**
 * @fileoverview Central Event Bus implementing the Observer / Publish-Subscribe pattern.
 *
 * Architectural Layer: Application Core / Messaging Infrastructure.
 * Pattern: Observer (GoF) / Publish-Subscribe Pattern.
 *
 * Why this pattern?
 * In complex Vanilla JS applications, components often need to communicate state changes
 * (e.g. an "Add to Cart" button in a nested product card notifying the Cart Drawer, Header
 * badge, and Toast manager). Without a mediator or event bus, components would need direct
 * references to each other, creating tight coupling (spaghetti dependencies) and making
 * testing, refactoring, or swapping components nearly impossible.
 *
 * Data Flow:
 * [Publisher Component] ---> bus.emit('event:name', payload)
 *                                  │
 *                                  ▼
 *                             [EventBus]
 *                                  │
 *         ┌────────────────────────┼────────────────────────┐
 *         ▼                        ▼                        ▼
 * [Subscriber A]            [Subscriber B]           [Subscriber C]
 *
 * Performance & Memory Note:
 * Handlers are stored inside a Map<string, Set<Function>>. Using a Set guarantees that
 * attaching the exact same handler reference multiple times will not cause duplicate executions,
 * while Set.delete() provides O(1) unsubscribing. Returning an unbind closure directly from
 * `on()` enables seamless memory cleanup inside component `destroy()` lifecycles.
 */

export class EventBus {
  constructor() {
    /**
     * Map storing event names and their set of registered callback handlers.
     * @type {Map<string, Set<(payload: any) => void>>}
     * @private
     */
    this._subscribers = new Map();
  }

  /**
   * Subscribes a listener to a specific event channel.
   *
   * @param {string} event - The unique name of the event channel (e.g., 'cart:updated').
   * @param {(payload: any) => void} handler - Callback invoked when the event is emitted.
   * @returns {() => void} Unsubscribe function to remove this handler and prevent memory leaks.
   *
   * @example
   * const unbind = bus.on('cart:changed', (cart) => updateBadge(cart.length));
   * // Later, in component destroy:
   * unbind();
   */
  on(event, handler) {
    if (typeof handler !== 'function') {
      throw new TypeError(`[EventBus.on] Handler for event "${event}" must be a function.`);
    }

    if (!this._subscribers.has(event)) {
      this._subscribers.set(event, new Set());
    }

    const handlers = this._subscribers.get(event);
    if (handlers) {
      handlers.add(handler);
    }

    // Return unbind closure for clean component teardown
    return () => this.off(event, handler);
  }

  /**
   * Subscribes a listener that will only fire once, then automatically deregister itself.
   *
   * @param {string} event - The event name.
   * @param {(payload: any) => void} handler - The single-execution callback.
   * @returns {() => void} Unsubscribe function.
   */
  once(event, handler) {
    /** @type {() => void} */
    const unbind = this.on(event, (payload) => {
      unbind();
      handler(payload);
    });
    return unbind;
  }

  /**
   * Explicitly removes a specific handler from an event channel.
   *
   * @param {string} event - The event name.
   * @param {(payload: any) => void} handler - The exact function reference to remove.
   */
  off(event, handler) {
    const handlers = this._subscribers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this._subscribers.delete(event);
      }
    }
  }

  /**
   * Publishes an event to all subscribed listeners with an optional data payload.
   *
   * @param {string} event - The event name to broadcast.
   * @param {any} [payload] - Optional arbitrary data passed to listeners.
   */
  emit(event, payload = undefined) {
    const handlers = this._subscribers.get(event);
    if (!handlers || handlers.size === 0) return;

    // Iterate over a snapshot array to prevent mutation issues if a handler unsubscribes during emit
    const snapshot = Array.from(handlers);
    for (let i = 0; i < snapshot.length; i++) {
      try {
        snapshot[i](payload);
      } catch (err) {
        console.error(`[EventBus] Uncaught exception in listener for event "${event}":`, err);
      }
    }
  }

  /**
   * Clears all subscribers for a given event, or all events if none specified.
   * Useful in testing or full application reset.
   *
   * @param {string} [event] - Optional event to clear.
   */
  clear(event) {
    if (event) {
      this._subscribers.delete(event);
    } else {
      this._subscribers.clear();
    }
  }
}
