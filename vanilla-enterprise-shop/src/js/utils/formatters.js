// @ts-check
/**
 * @fileoverview Display formatters for Persian locale.
 * Why: isolated formatters avoid duplicated locale logic across components.
 */
export const toPersianDigits = (value) => String(value).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
export const toman = (price) => `${toPersianDigits(new Intl.NumberFormat('fa-IR').format(price))} تومان`;
export const rial = (price) => `${toPersianDigits(new Intl.NumberFormat('fa-IR').format(price * 10))} ریال`;
export const jalali = (iso) => new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(iso));
