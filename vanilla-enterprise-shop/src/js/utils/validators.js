// @ts-check
/**
 * @fileoverview Form validators.
 * Pattern: Stateless validation utilities for testability.
 */
export const isEmail = (value) => /.+@.+\..+/.test(value);
export const isPhone = (value) => /^09\d{9}$/.test(value);
export const isCard = (value) => /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(value);
export const minLen = (value, n) => value.trim().length >= n;
