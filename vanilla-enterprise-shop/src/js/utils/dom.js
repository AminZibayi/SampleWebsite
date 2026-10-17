// @ts-check
/**
 * @fileoverview Safe DOM utilities.
 * Why: using textContent blocks HTML injection vectors (XSS) in user generated text.
 */
/** @param {string} tag @param {string} text */
export function createSafeElement(tag, text) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}
/** @param {Array<Element>} nodes */
export function fragmentOf(nodes) {
  const frag = document.createDocumentFragment();
  // DocumentFragment batches inserts, reducing layout/reflow cost.
  nodes.forEach((n) => frag.appendChild(n));
  return frag;
}
