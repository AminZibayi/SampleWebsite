// @ts-check
/**
 * @fileoverview Pure functional input validators and formatting verifiers.
 *
 * Architectural Layer: Infrastructure / Validation Utility.
 * Pattern: Specification / Pure Predicate Functions.
 *
 * Why this pattern?
 * Client-side validation provides immediate, tactile feedback to the user before
 * an asynchronous service or gateway request is dispatched.
 *
 * Defensive Design Note:
 * Client validation does NOT replace backend security; it merely enhances user experience.
 * All functions here are stateless and side-effect free, making them trivial to unit test.
 */

/**
 * Validates standard email address syntax.
 *
 * @param {string} value - Email string.
 * @returns {boolean} True if structurally valid.
 */
export function isEmail(value) {
  if (!value || typeof value !== 'string') return false;
  // RFC 5322 compliant practical regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(value.trim());
}

/**
 * Validates standard Iranian mobile phone numbers (e.g., 09123456789 or +989123456789).
 *
 * @param {string} value - Phone number string.
 * @returns {boolean} True if matching valid Iranian carrier prefix and length.
 */
export function isPhone(value) {
  if (!value || typeof value !== 'string') return false;
  const cleaned = value.trim().replace(/^(\+98|0098)/, '0');
  return /^09\d{9}$/.test(cleaned);
}

/**
 * Validates a 16-digit banking card number (with or without hyphens) using the Luhn Algorithm.
 *
 * Educational Note on the Luhn Algorithm (Mod 10):
 * Invented by IBM scientist Hans Peter Luhn, this checksum formula validates credit/debit
 * card numbers to catch accidental typos before sending transactions over the network:
 *   1. From right to left, double every second digit.
 *   2. If doubling results in a number > 9, subtract 9.
 *   3. Sum all resulting digits.
 *   4. If total sum is divisible by 10 (sum % 10 === 0), the number is valid.
 *
 * @param {string} value - Card number (e.g., "6037-9918-1234-5678").
 * @returns {boolean} True if valid 16 digits and passes Luhn checksum.
 */
export function isCard(value) {
  if (!value || typeof value !== 'string') return false;
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 16) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Validates Iranian banking card CVV2 (3 or 4 digits).
 *
 * @param {string} value - CVV2 string.
 * @returns {boolean} True if 3 or 4 numeric digits.
 */
export function isCvv2(value) {
  if (!value || typeof value !== 'string') return false;
  return /^\d{3,4}$/.test(value.trim());
}

/**
 * Validates card expiration date in MM/YY format.
 *
 * @param {string} value - Expiry date string (e.g. "07/08" or "12/28").
 * @returns {boolean} True if valid format with month between 01 and 12.
 */
export function isExpDate(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.trim().split('/');
  if (parts.length !== 2) return false;
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  return month >= 1 && month <= 12 && !isNaN(year) && parts[1].length === 2;
}

/**
 * Validates a 6-digit dynamic OTP (رمز پویا).
 *
 * @param {string} value - OTP string.
 * @returns {boolean} True if exactly 6 numeric digits.
 */
export function isOtp(value) {
  if (!value || typeof value !== 'string') return false;
  return /^\d{6}$/.test(value.trim());
}

/**
 * Checks if a string meets a minimum character length after trimming whitespace.
 *
 * @param {string} value - Input text.
 * @param {number} min - Minimum required length.
 * @returns {boolean} True if trimmed length >= min.
 */
export function minLen(value, min) {
  if (!value || typeof value !== 'string') return false;
  return value.trim().length >= min;
}
