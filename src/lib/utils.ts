import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(dateVal: any, formatStr: string, options?: any) {
  if (!dateVal) return "";
  const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (!isValid(date)) return "";
  try {
    return format(date, formatStr, options);
  } catch (e) {
    return "";
  }
}

export function slugify(text: string) {
  if (!text) return "";
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9\u0621-\u064A]+/g, '-') // replace non-alphanumeric and non-arabic with hyphen
    .replace(/(^-|-$)+/g, ''); // remove leading and trailing hyphens
}
