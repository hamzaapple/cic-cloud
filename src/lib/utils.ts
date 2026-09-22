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
