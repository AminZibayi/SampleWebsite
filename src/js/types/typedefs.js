// @ts-check
/**
 * @fileoverview Shared JSDoc contracts and architectural domain entities.
 *
 * Architectural Layer: Domain Models / Type Definitions Facade.
 * Pattern: Type Object / Contract Interface Pattern.
 * Why: Pure Vanilla JavaScript projects lack compile-time TypeScript type checking
 * unless paired with strict JSDoc annotations and ts-check. This file serves as
 * the single source of truth for all data shapes across repositories and views.
 */

/**
 * @typedef {Object} Product
 * @property {string} id - Unique product identifier.
 * @property {string} name - Localized Persian title.
 * @property {number} price - Base price in Tomans.
 * @property {number} discount - Percentage discount (0-100).
 * @property {string} category - Category slug/name (e.g., 'دیجیتال', 'صوتی', 'محیط کار', 'پوشیدنی', 'نمایشگر').
 * @property {number} stock - Available inventory count.
 * @property {number} rating - Average customer review score (1.0 to 5.0).
 * @property {number} popularity - Computed popularity score for sorting.
 * @property {string} image - SVG data URI or image URL.
 * @property {string} description - Detailed product overview.
 * @property {string} [badge] - Optional visual badge (e.g., 'پرچمدار', 'پیشنهاد ویژه').
 * @property {Record<string, string>} [specs] - Key-value technical specifications.
 * @property {string} createdAt - ISO-8601 creation timestamp.
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier.
 * @property {string} name - Full display name in Persian.
 * @property {string} email - Login username/email.
 * @property {'admin'|'customer'} role - Role-based access control tier.
 * @property {string} password - Stored hash or demo password.
 * @property {string[]} wishlist - List of saved product IDs.
 */

/**
 * @typedef {Object} CartItem
 * @property {string} productId - Reference to Product.id.
 * @property {number} qty - Quantity selected.
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} productId - Product identifier.
 * @property {string} name - Product snapshot name at purchase.
 * @property {number} qty - Count bought.
 * @property {number} price - Unit price paid in Tomans.
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Unique order tracking ID.
 * @property {string} userId - Owner user ID.
 * @property {OrderItem[]} items - Snapshot list of purchased line items.
 * @property {number} subtotal - Subtotal before promo discount.
 * @property {number} discount - Amount deducted via promo code.
 * @property {number} total - Final payable amount in Tomans.
 * @property {'pending'|'paid'|'shipped'|'delivered'|'cancelled'} status - Current lifecycle status.
 * @property {string} createdAt - ISO-8601 purchase timestamp.
 * @property {string} trackingCode - 8-digit simulated banking reference number.
 * @property {string} [address] - Delivery shipping address.
 * @property {string} [phone] - Recipient contact number.
 */

/**
 * @typedef {Object} Article
 * @property {string} id - Unique article identifier.
 * @property {string} title - Editorial headline.
 * @property {string} excerpt - Short summary for cards and search snippets.
 * @property {string} body - Full markdown/editorial content with ## section headers.
 * @property {string[]} tags - Categorization tags.
 * @property {string} author - Author name.
 * @property {string} createdAt - ISO-8601 publication date.
 * @property {string[]} relatedProductIds - Cross-sell references to products.
 * @property {number} [readTimeMinutes] - Estimated reading duration.
 * @property {string} [cover] - Visual accent or illustration SVG.
 */

/**
 * @typedef {Object} Feedback
 * @property {string} id - Unique feedback ticket ID.
 * @property {string} name - Submitter name.
 * @property {'شکایت'|'انتقاد'|'پیشنهاد'} category - Feedback classification.
 * @property {number} rating - Experience rating (1-5).
 * @property {string} message - Message body.
 * @property {string} createdAt - ISO-8601 submission date.
 * @property {'unread'|'reviewed'|'resolved'} [status] - Administrative triage status.
 */

/**
 * @typedef {Object} CategoryMeta
 * @property {string} slug - Short URL/filter identifier.
 * @property {string} name - Persian display label.
 * @property {string} icon - SVG or unicode symbol representation.
 * @property {string} description - Brief subtitle for mega-menu.
 */

export {};
