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

type SlugCourse = { id: string; name: string; academic_year?: string | null; semester?: string | null };

/**
 * URL slug for a course. Courses with the same name in the same year/semester
 * (e.g. same subject in CS and AI & Cyber) get a short id suffix so each opens its own materials.
 */
export function courseSlug(course: SlugCourse, allCourses: SlugCourse[] = []) {
  const base = slugify(course.name);
  const y = course.academic_year || "1";
  const s = course.semester || "2";
  const clash = allCourses.some(
    (c) => c.id !== course.id && (c.academic_year || "1") === y && (c.semester || "2") === s && slugify(c.name) === base,
  );
  return clash ? `${base}-${course.id.slice(0, 6)}` : base;
}

export function coursePath(course: SlugCourse, allCourses: SlugCourse[] = []) {
  return `/${course.academic_year || "1"}/${course.semester || "2"}/${courseSlug(course, allCourses)}`;
}

/** Find the course a URL slug points to (supports old links without the suffix). */
export function findCourseBySlug<T extends SlugCourse>(courses: T[], yearId: string, semesterId: string, slug: string): T | undefined {
  const inTerm = courses.filter((c) => (c.academic_year || "1") === yearId && (c.semester || "2") === semesterId);
  return inTerm.find((c) => courseSlug(c, courses) === slug) || inTerm.find((c) => slugify(c.name) === slug);
}

/** Turn whatever an admin typed ("t.me/x", "www.site.com", "/schedule", "https://…") into a usable link. */
export function normalizeLink(raw?: string | null): string | null {
  if (!raw) return null;
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("/")) return v;
  if (/^(https?:|mailto:|tel:)/i.test(v)) return v;
  return `https://${v.replace(/^\/+/, "")}`;
}

/** First URL written inside a piece of text, if any. */
export function extractFirstUrl(text?: string | null): string | null {
  if (!text) return null;
  const m = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|t\.me\/[^\s]+)/i);
  return m ? m[1].replace(/[)\].,،]+$/, "") : null;
}

/** Open a link: in-site paths stay in the app, external ones open in a new tab. */
export function openLink(raw: string | null | undefined, navigate?: (to: string) => void) {
  const url = normalizeLink(raw);
  if (!url) return;
  if (url.startsWith("/")) {
    if (navigate) navigate(url); else window.location.assign(url);
    return;
  }
  try {
    const u = new URL(url);
    if (u.origin === window.location.origin) {
      const path = u.pathname + u.search + u.hash;
      if (navigate) navigate(path); else window.location.assign(path);
      return;
    }
  } catch { /* ignore */ }
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) window.location.assign(url); // popup blocked (common in installed app mode)
}
