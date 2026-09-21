// Stores which academic year (صف) the visitor belongs to, so the calendar,
// schedule and notifications only show that year's content.
const KEY = "cic_year";
const EVENT = "cic-year-change";

export const YEARS = ["1", "2", "3", "4"] as const;
export type AcademicYear = string;

export const yearLabel = (year: string, lang: string) => {
  const ar: Record<string, string> = {
    "1": "الصف الأول",
    "2": "الصف الثاني",
    "3": "الصف الثالث",
    "4": "الصف الرابع",
    "2b": "الصف الثاني - بكالوريا",
  };
  const en: Record<string, string> = {
    "1": "1st Year",
    "2": "2nd Year",
    "3": "3rd Year",
    "4": "4th Year",
    "2b": "2nd Year - Bachelor",
  };
  return (lang === "ar" ? ar : en)[year] || year;
};

export const getStoredYear = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export const setStoredYear = (year: string) => {
  try {
    localStorage.setItem(KEY, year);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: year }));
};

export const clearStoredYear = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }));
};

export const onYearChange = (cb: (year: string | null) => void) => {
  const handler = (e: Event) => cb((e as CustomEvent).detail ?? null);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};
