// @ts-check
/**
 * @fileoverview Robust storage gateway wrapping browser localStorage.
 *
 * Architectural Layer: Infrastructure / Persistence Adapter.
 * Pattern: Gateway / Adapter Pattern (GoF).
 *
 * Why this pattern?
 * Direct calls to `localStorage.getItem()` and `localStorage.setItem()` throughout UI
 * components create severe architectural problems:
 *  1. No centralized error handling (e.g., Safari Private Browsing quota errors or corrupted JSON).
 *  2. No schema migration or initial seed hydration.
 *  3. Inability to swap the storage engine (e.g. from localStorage to IndexedDB or REST API)
 *     without modifying hundreds of UI files.
 *
 * This adapter encapsulates all JSON serialization, namespace prefixing, and self-healing
 * fallback to initial seed data when storage is empty or corrupted.
 */

export class StorageService {
  /**
   * Initializes the storage adapter with a specific namespace key and default seed dataset.
   *
   * @param {string} namespace - Prefix key in localStorage (e.g., 'ves_db').
   * @param {Record<string, any>} defaultSeed - Initial data dictionary hydrated on first visit.
   */
  constructor(namespace, defaultSeed) {
    this.key = namespace;
    this.defaultSeed = defaultSeed;

    // First-boot initialization: write seed data if key does not exist
    if (!localStorage.getItem(this.key)) {
      this.write(this.defaultSeed);
    }
  }

  /**
   * Reads the complete raw storage document. Recovers automatically if corrupted.
   *
   * @returns {Record<string, any>} Complete parsed JSON object.
   */
  read() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return { ...this.defaultSeed };
      const parsed = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Storage document is not a valid object.');
      }
      return parsed;
    } catch (err) {
      console.warn(`[StorageService] Corrupted storage detected in key "${this.key}". Restoring seed.`, err);
      this.write(this.defaultSeed);
      return { ...this.defaultSeed };
    }
  }

  /**
   * Serializes and writes data to localStorage with QuotaExceeded error trapping.
   *
   * @param {Record<string, any>} data - Complete document to persist.
   */
  write(data) {
    try {
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch (err) {
      console.error(`[StorageService] Failed to persist data to localStorage:`, err);
    }
  }

  /**
   * Retrieves a specific collection or property from storage.
   *
   * @template T
   * @param {string} name - Entity collection key (e.g., 'products', 'orders').
   * @returns {T} Retrieved entity collection or undefined.
   */
  get(name) {
    const document = this.read();
    return document[name];
  }

  /**
   * Atomically updates a specific collection or property in storage.
   *
   * @param {string} name - Entity collection key.
   * @param {any} value - New value to persist.
   */
  set(name, value) {
    const document = this.read();
    document[name] = value;
    this.write(document);
  }

  /**
   * Hard-resets the storage back to initial seed data.
   */
  reset() {
    this.write(this.defaultSeed);
  }
}
