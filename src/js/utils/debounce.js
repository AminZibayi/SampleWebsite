// @ts-check
/**
 * @fileoverview Timing utilities: Debounce and Throttle.
 *
 * Architectural Layer: Infrastructure / Performance Optimization.
 * Pattern: Higher-Order Function / Function Decorator.
 *
 * Why Debounce vs Throttle? (A Core Interview Question Explained):
 *
 * 1. DEBOUNCE:
 *    "Wait until the user STOPS doing something for X milliseconds."
 *    Use Case: Live search inputs. If a user types "laptop" (6 keystrokes within 200ms),
 *    without debounce we would trigger 6 separate search queries and 6 DOM repaints.
 *    With a 300ms debounce, only 1 single query executes after the user pauses typing.
 *
 * 2. THROTTLE:
 *    "Execute at most ONCE every X milliseconds, no matter how many times triggered."
 *    Use Case: Window scroll, resize, or pointer movement tracking.
 */

/**
 * Returns a debounced version of the passed function.
 *
 * How it works internally:
 * It forms a closure over a `timeoutId` variable. Every time the returned wrapper is invoked,
 * it cancels the previous pending timer (`clearTimeout`) and establishes a brand new one.
 * The wrapped target function only executes if the delay window elapses without interruption.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn - Function to debounce.
 * @param {number} [wait=300] - Inactivity delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void} Debounced wrapper.
 */
export function debounce(fn, wait = 300) {
  /** @type {number|undefined} */
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

/**
 * Returns a throttled version of the passed function.
 *
 * How it works internally:
 * It locks execution using a boolean flag or timestamp. When invoked, if within the throttling
 * interval, subsequent calls are ignored until the interval completes.
 *
 * @template {(...args: any[]) => any} T
 * @param {T} fn - Function to throttle.
 * @param {number} [limit=200] - Minimum duration in ms between executions.
 * @returns {(...args: Parameters<T>) => void} Throttled wrapper.
 */
export function throttle(fn, limit = 200) {
  let inThrottle = false;

  return function throttled(...args) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
