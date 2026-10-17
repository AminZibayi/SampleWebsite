// @ts-check
/**
 * @fileoverview Safe DOM manipulation and accessibility utilities.
 *
 * Architectural Layer: Infrastructure / DOM Helpers & Accessibility (a11y).
 * Pattern: Adapter / Helper Module.
 *
 * Why this matters for security & performance:
 * 1. XSS (Cross-Site Scripting) Prevention:
 *    Direct string concatenation into `innerHTML` (e.g. `div.innerHTML = `<p>${userInput}</p>`)
 *    is the #1 security vulnerability in vanilla JS. If a malicious user supplies `<img src=x onerror=stealCookies()>`,
 *    the browser executes it. Using `textContent` forces the HTML parser to treat all input
 *    as inert text, neutralizing injection attacks.
 *
 * 2. DocumentFragment for DOM Performance:
 *    Inserting 20 elements into the live DOM one-by-one causes up to 20 separate layout recalculations
 *    (reflows and repaints). A `DocumentFragment` is an off-screen light container: appending
 *    nodes to a fragment does not trigger reflows. When the fragment is finally appended to the
 *    document, all child nodes are inserted in one single atomic operation.
 *
 * 3. Focus Trapping for Accessible Dialogs (WAI-ARIA Modal pattern):
 *    When a modal or drawer opens, keyboard focus must not escape behind the backdrop.
 */

/**
 * Creates an element with safely escaped text content and optional attributes.
 *
 * @param {string} tag - HTML tag name (e.g., 'span', 'p').
 * @param {string} text - Content safely escaped via textContent.
 * @param {Record<string, string>} [attributes] - Key-value map of HTML attributes.
 * @returns {HTMLElement} Safely constructed DOM element.
 */
export function createSafeElement(tag, text, attributes = {}) {
  const el = document.createElement(tag);
  el.textContent = text;
  for (const [key, val] of Object.entries(attributes)) {
    el.setAttribute(key, val);
  }
  return el;
}

/**
 * Escapes special HTML characters in a string to prevent XSS when building template literals.
 *
 * @param {string|null|undefined} str - Raw string.
 * @returns {string} Sanitized string safe for HTML interpolation.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Batches an array of DOM nodes into a single DocumentFragment.
 *
 * @param {Array<Node>} nodes - Array of DOM nodes to bundle.
 * @returns {DocumentFragment} Off-screen fragment ready for atomic insertion.
 */
export function fragmentOf(nodes) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < nodes.length; i++) {
    fragment.appendChild(nodes[i]);
  }
  return fragment;
}

/**
 * Traps keyboard focus within a specified container for accessible modals and drawers.
 *
 * @param {HTMLElement} container - The dialog or drawer element.
 * @returns {() => void} Cleanup function to release the trap.
 */
export function trapFocus(container) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    /** @type {NodeListOf<HTMLElement>} */
    const focusable = container.querySelectorAll(focusableSelectors);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus the first available element inside the container
  const initial = /** @type {HTMLElement|null} */ (container.querySelector(focusableSelectors));
  if (initial) {
    initial.focus();
  }

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}
