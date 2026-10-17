// @ts-check
/**
 * @fileoverview Base UI Component lifecycle abstraction.
 * Pattern: Template Method (render/mount/bind/destroy hooks).
 */
import { createSafeElement } from '../utils/dom.js';

export class Component {
  /** @param {Element|null} root */
  constructor(root) {
    this.root = root;
    /** @type {Array<() => void>} */
    this.unsubs = [];
  }
  render() { return ''; }
  bindEvents() {}
  mount() {
    if (!this.root) return;
    this.root.innerHTML = this.render();
    this.bindEvents();
  }
  destroy() { this.unsubs.forEach((f) => f()); this.unsubs = []; }
  /** @param {string} tag @param {string} text */
  textEl(tag, text) { return createSafeElement(tag, text); }
}
