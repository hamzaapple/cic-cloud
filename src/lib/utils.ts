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
