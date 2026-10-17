// @ts-check
/**
 * @fileoverview User feedback, criticisms, and suggestions repository.
 *
 * Architectural Layer: Domain Services / Feedback & CRM Repository.
 * Pattern: Repository Pattern / Append-Only Ledger.
 *
 * Educational Importance:
 * Bridges the public storefront footer (where any customer can register complaints or suggestions)
 * with the administrative management dashboard (where system admins review and triage tickets).
 */

export class FeedbackService {
  /**
   * @param {import('./StorageService.js').StorageService} storage - Injected storage gateway.
   */
  constructor(storage) {
    this.storage = storage;
  }

  /**
   * Retrieves all submitted feedback items.
   *
   * @returns {import('../types/typedefs.js').Feedback[]}
   */
  all() {
    return this.storage.get('feedback') || [];
  }

  /**
   * Appends a new feedback submission to the repository.
   *
   * @param {Object} payload
   * @param {string} payload.name - Submitter name.
   * @param {'شکایت'|'انتقاد'|'پیشنهاد'} payload.category - Classification.
   * @param {number} payload.rating - 1-5 rating score.
   * @param {string} payload.message - Description text.
   * @returns {Promise<import('../types/typedefs.js').Feedback>} Saved feedback item.
   */
  async add(payload) {
    /** @type {import('../types/typedefs.js').Feedback[]} */
    const rows = this.all();

    /** @type {import('../types/typedefs.js').Feedback} */
    const item = {
      id: `fb-${Date.now().toString(36)}`,
      name: payload.name.trim(),
      category: payload.category,
      rating: Math.max(1, Math.min(5, Number(payload.rating) || 5)),
      message: payload.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread'
    };

    rows.unshift(item);
    this.storage.set('feedback', rows);
    return item;
  }

  /**
   * Updates review/triage status for administrative tracking.
   *
   * @param {string} id - Feedback identifier.
   * @param {'unread'|'reviewed'|'resolved'} status - New triage status.
   * @returns {Promise<void>}
   */
  async updateStatus(id, status) {
    /** @type {import('../types/typedefs.js').Feedback[]} */
    const rows = this.all();
    const idx = rows.findIndex((f) => f.id === id);
    if (idx >= 0) {
      rows[idx].status = status;
      this.storage.set('feedback', rows);
    }
  }

  /**
   * Deletes a feedback record.
   *
   * @param {string} id - Ticket ID.
   * @returns {Promise<void>}
   */
  async remove(id) {
    /** @type {import('../types/typedefs.js').Feedback[]} */
    const rows = this.all();
    this.storage.set('feedback', rows.filter((f) => f.id !== id));
  }
}
