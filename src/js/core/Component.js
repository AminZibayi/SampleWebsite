// @ts-check
/**
 * @fileoverview Base Component abstraction governing UI lifecycle and memory management.
 *
 * Architectural Layer: Presentation Core / View Component Template.
 * Pattern: Template Method Pattern (GoF).
 *
 * Why this pattern?
 * In Vanilla JS without a framework runtime (like React, Vue, or Svelte), components can
 * easily leave orphaned DOM listeners and Pub-Sub subscriptions in memory when swapped,
 * creating memory leaks and duplicate action execution.
 *
 * By establishing a formal lifecycle:
 *   1. constructor(root, dependencies)
 *   2. render() -> returns markup string
 *   3. mount() -> mounts markup into DOM and invokes bindEvents()
 *   4. bindEvents() -> registers event delegation and Pub/Sub unbind handles
 *   5. destroy() -> executes all collected unsubs and cleans up resources
 *
 * We guarantee deterministic behavior and predictable memory disposal for any student
 * studying modular vanilla frontend architecture.
 */

import { createSafeElement } from '../utils/dom.js';

export class Component {
  /**
   * Constructs the component.
   *
   * @param {Element|null} root - Host DOM node for this component.
   */
  constructor(root) {
    /**
     * The host DOM element.
     * @type {Element|null}
     */
    this.root = root;

    /**
     * Collection of unsubscribe / cleanup callbacks executed upon component destruction.
     * @type {Array<() => void>}
     * @protected
     */
    this.unsubs = [];
  }

  /**
   * Generates the component's HTML template string.
   * Derived classes MUST override this method.
   *
   * @returns {string} Raw HTML string.
   */
  render() {
    return '';
  }

  /**
   * Attaches event listeners, delegates parent events, and registers EventBus subscriptions.
   * Derived classes override this method to bind interactivity.
   *
   * @returns {void|Promise<void>}
   */
  bindEvents() {}

  /**
   * Mounts the component into its host root element.
   *
   * Browser Performance Note:
   * Direct innerHTML replacement is acceptable at mount time because it replaces the entire
   * component tree in one parser pass. Subsequent dynamic updates should either target
   * micro-containers or leverage DocumentFragment to avoid full-page style recalculations.
   *
   * @returns {void|Promise<void>}
   */
  mount() {
    if (!this.root) return;
    this.root.innerHTML = this.render();
    return this.bindEvents();
  }

  /**
   * Lifecycle hook to destroy the component and free memory.
   * Iterates through all registered `unsubs` (EventBus listeners, interval timers,
   * DOM event unbinders) and empties the list to prevent memory leaks.
   */
  destroy() {
    for (let i = 0; i < this.unsubs.length; i++) {
      try {
        this.unsubs[i]();
      } catch (err) {
        console.error('[Component.destroy] Error executing unbind handler:', err);
      }
    }
    this.unsubs = [];
  }

  /**
   * Attaches a DOM event listener that is automatically deregistered on `destroy()`.
   *
   * @template {Event} E
   * @param {EventTarget|null|undefined} target - Target element or window/document.
   * @param {string} event - Event name (e.g. 'click', 'keydown').
   * @param {(e: E) => void} listener - Event handler callback.
   * @param {boolean|AddEventListenerOptions} [options] - Optional listener options.
   */
  listen(target, event, listener, options) {
    if (!target) return;
    const castTarget = /** @type {EventTarget} */ (target);
    const castListener = /** @type {EventListener} */ (listener);
    castTarget.addEventListener(event, castListener, options);
    this.unsubs.push(() => {
      castTarget.removeEventListener(event, castListener, options);
    });
  }

  /**
   * Scoped query selector helper.
   * Searches exclusively within this component's root element.
   *
   * @template {Element} [T=Element]
   * @param {string} selector - CSS selector.
   * @returns {T|null} Matching element or null.
   */
  $(selector) {
    return this.root ? /** @type {T|null} */ (this.root.querySelector(selector)) : null;
  }

  /**
   * Scoped query selector all helper.
   *
   * @template {Element} [T=Element]
   * @param {string} selector - CSS selector.
   * @returns {T[]} Array of matching elements.
   */
  $$(selector) {
    return this.root ? Array.from(this.root.querySelectorAll(selector)) : [];
  }

  /**
   * Creates an XSS-safe DOM element containing escaped text.
   *
   * @param {string} tag - HTML tag name.
   * @param {string} text - Plain text content (automatically escaped by the DOM engine).
   * @returns {HTMLElement} The created DOM element.
   */
  textEl(tag, text) {
    return createSafeElement(tag, text);
  }
}
