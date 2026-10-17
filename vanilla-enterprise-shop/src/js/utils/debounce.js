// @ts-check
/**
 * @fileoverview Debounce/Throttle helpers.
 * Why: debounce waits for pause in typing so we avoid expensive search on each keystroke.
 */
/** @template {(...args:any[])=>void} T @param {T} fn @param {number} wait */
export function debounce(fn, wait = 300) {
  let t = 0;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
