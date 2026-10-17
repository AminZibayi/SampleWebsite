// @ts-check
/**
 * @fileoverview Persian locale formatting utilities.
 *
 * Architectural Layer: Infrastructure / Internationalization & Localization (i18n/L10n).
 * Pattern: Pure Stateless Function Library.
 *
 * Educational Importance:
 * When displaying numbers, currencies, and dates in Right-to-Left (RTL) Persian interfaces,
 * mixing Latin digits (0-9) directly into Persian prose breaks text shaping and bidirectional
 * (BiDi) flow.
 *
 * Using native browser ECMAScript Internationalization APIs (`Intl.NumberFormat` and
 * `Intl.DateTimeFormat`) with the Persian calendar guarantees accurate solar hijri dates
 * and localized grouping separators without requiring massive 100KB date libraries (like Moment.js).
 */

const PERSIAN_DIGIT_MAP = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts any ASCII Latin digits (0-9) in a string or number into standard Persian digits (۰-۹).
 *
 * @param {string|number|null|undefined} value - Input value.
 * @returns {string} String with all ASCII digits replaced with Persian counterparts.
 *
 * @example
 * toPersianDigits("Page 42") // => "Page ۴۲"
 */
export function toPersianDigits(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\d/g, (char) => PERSIAN_DIGIT_MAP[Number(char)]);
}

/**
 * Formats a numeric price into a localized Toman currency string.
 *
 * @param {number} price - Amount in Iranian Tomans.
 * @returns {string} Formatted string, e.g., "۱۴,۸۰۰,۰۰۰ تومان".
 */
export function toman(price) {
  if (typeof price !== 'number' || isNaN(price)) return '۰ تومان';
  // Use Intl with fa-IR for locale-aware grouping separators
  const formatted = new Intl.NumberFormat('fa-IR').format(Math.round(price));
  return `${toPersianDigits(formatted)} تومان`;
}

/**
 * Formats a Toman price as Iranian Rials for official payment gateway displays (1 Toman = 10 Rials).
 *
 * @param {number} tomanPrice - Base price in Tomans.
 * @returns {string} Formatted string in Rials, e.g., "۱۴۸,۰۰۰,۰۰۰ ریال".
 */
export function rial(tomanPrice) {
  if (typeof tomanPrice !== 'number' || isNaN(tomanPrice)) return '۰ ریال';
  const rials = Math.round(tomanPrice * 10);
  const formatted = new Intl.NumberFormat('fa-IR').format(rials);
  return `${toPersianDigits(formatted)} ریال`;
}

/**
 * Formats an ISO-8601 timestamp into a Solar Hijri (Jalali / تقویم شمسی) localized date string.
 *
 * @param {string|Date} isoOrDate - Timestamp string or Date instance.
 * @param {Intl.DateTimeFormatOptions} [options] - Optional custom Intl options.
 * @returns {string} Formatted Jalali date, e.g., "۳۱ شهریور ۱۴۰۵".
 */
export function jalali(isoOrDate, options) {
  try {
    const date = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
    if (isNaN(date.getTime())) return '-';

    /** @type {Intl.DateTimeFormatOptions} */
    const defaultOptions = {
      calendar: 'persian',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    const formatter = new Intl.DateTimeFormat('fa-IR', options || defaultOptions);
    return toPersianDigits(formatter.format(date));
  } catch (err) {
    console.error('[formatters.jalali] Formatting error:', err);
    return '-';
  }
}

/**
 * Truncates text safely to a maximum character length, appending an ellipsis symbol.
 *
 * @param {string} text - Source string.
 * @param {number} maxLen - Maximum character length.
 * @returns {string} Truncated string with ellipsis if exceeding length.
 */
export function truncate(text, maxLen = 120) {
  if (!text || text.length <= maxLen) return text || '';
  return `${text.slice(0, maxLen).trim()}…`;
}
