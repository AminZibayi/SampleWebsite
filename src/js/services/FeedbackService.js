// @ts-check
/**
 * @fileoverview Feedback repository.
 * Pattern: Repository with append/list operations.
 */
export class FeedbackService {
  constructor(storage) { this.storage = storage; }
  all() { return this.storage.get('feedback') || []; }
  add(payload) {
    const rows = this.all();
    rows.unshift({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...payload });
    this.storage.set('feedback', rows);
    return rows[0];
  }
}
