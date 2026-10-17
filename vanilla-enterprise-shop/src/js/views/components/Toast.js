// @ts-check
/**
 * @fileoverview Toast manager component.
 * Pattern: append-only ephemeral notifications.
 */
import { Component } from '../../core/Component.js';

export class Toast extends Component {
  constructor(root, bus) { super(root); this.bus = bus; }
  render() { return ''; }
  bindEvents() {
    this.unsubs.push(this.bus.on('toast:add', ({ kind = 'info', text }) => {
      if (!this.root) return;
      const el = document.createElement('div');
      el.className = `toast ${kind}`;
      el.textContent = text;
      this.root.appendChild(el);
      setTimeout(() => el.remove(), 3500);
    }));
  }
}
