// @ts-check
/**
 * @fileoverview Stackable, non-blocking RTL Toast notification system with auto-dismiss progress bar.
 *
 * Architectural Layer: Presentation / Ephemeral Feedback System.
 * Pattern: Observer / Notification Bus Subscriber.
 *
 * Accessibility & UX Architecture:
 *  - Hosted inside `#toast-root` with `aria-live="polite"` and `aria-atomic="true"`.
 *  - Supports 4 semantic variants: 'success', 'error', 'warning', 'info' with corresponding icons.
 *  - Animated CSS progress bar indicating remaining time before automatic dismissal.
 *  - Manual dismiss button (✕) for user autonomy.
 *  - Pause on hover: users reading long messages can hover to inspect without auto-dismissal.
 */

import { Component } from '../../core/Component.js';
import { escapeHtml } from '../../utils/dom.js';

export class Toast extends Component {
  /**
   * @param {Element|null} root - Host container (#toast-root).
   * @param {import('../../core/EventBus.js').EventBus} bus - Application EventBus.
   */
  constructor(root, bus) {
    super(root);
    this.bus = bus;
  }

  render() {
    return `<div class="toast-stack" id="toast-stack-container"></div>`;
  }

  bindEvents() {
    this.unsubs.push(
      this.bus.on('toast:add', ({ kind = 'info', text, duration = 4000 }) => {
        const stack = this.$('#toast-stack-container');
        if (!stack) return;

        const toastEl = document.createElement('div');
        toastEl.className = `toast-card toast-${kind}`;
        toastEl.setAttribute('role', 'alert');

        const icons = {
          success: '✓',
          error: '✕',
          warning: '⚠',
          info: 'ℹ'
        };

        toastEl.innerHTML = `
          <div class="toast-icon-wrap">
            <span class="toast-icon">${icons[kind] || 'ℹ'}</span>
          </div>
          <div class="toast-message-wrap">
            <p class="toast-message">${escapeHtml(text)}</p>
          </div>
          <button class="toast-close-btn" aria-label="بستن پیام">✕</button>
          <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
        `;

        stack.appendChild(toastEl);

        // Slide in animation
        requestAnimationFrame(() => {
          toastEl.classList.add('is-visible');
        });

        let timerId;
        const removeToast = () => {
          clearTimeout(timerId);
          toastEl.classList.remove('is-visible');
          toastEl.classList.add('is-leaving');
          setTimeout(() => {
            toastEl.remove();
          }, 250);
        };

        timerId = setTimeout(removeToast, duration);

        // Pause timer on hover
        toastEl.addEventListener('mouseenter', () => {
          clearTimeout(timerId);
          const bar = toastEl.querySelector('.toast-progress-bar');
          if (bar) /** @type {HTMLElement} */ (bar).style.animationPlayState = 'paused';
        });

        toastEl.addEventListener('mouseleave', () => {
          timerId = setTimeout(removeToast, 1500);
          const bar = toastEl.querySelector('.toast-progress-bar');
          if (bar) /** @type {HTMLElement} */ (bar).style.animationPlayState = 'running';
        });

        // Close on manual click
        toastEl.querySelector('.toast-close-btn')?.addEventListener('click', () => {
          removeToast();
        });
      })
    );
  }
}
