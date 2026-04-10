export type SubjectLang = "ar" | "en";

type SubjectPair = { ar: string; en: string };

const SUBJECT_PAIRS: SubjectPair[] = [
  { en: "Intro to IS", ar: "مقدمة في نظم المعلومات" },
  { en: "Introduction to IS", ar: "مقدمة في نظم المعلومات" },
  { en: "Discrete Math", ar: "الرياضيات المتقطعة" },
  { en: "Discrete Mathematics", ar: "الرياضيات المتقطعة" },
  { en: "Logic Design", ar: "التصميم المنطقي" },
  { en: "Computer Programming", ar: "برمجة الحاسبات" },
  { en: "Linear Algebra", ar: "الجبر الخطي" },
  { en: "Report Writing", ar: "كتابة التقارير" },
];

// Course names (stored in database in Arabic)
const COURSE_PAIRS: SubjectPair[] = [
  { ar: "الجبر الخطي", en: "Linear Algebra" },
  { ar: "التصميم المنطقي", en: "Logic Design" },
  { ar: "التصميم المنطقى", en: "Logic Design" },
  { ar: "الرياضيات غير المتصلة", en: "Discrete Mathematics" },
  { ar: "الرياضيات المتقطعة", en: "Discrete Mathematics" },
  { ar: "رياضيات متقطعة", en: "Discrete Mathematics" },
  { ar: "برمجة الحاسبات", en: "Computer Programming" },
  { ar: "مقدمة في نظم المعلومات", en: "Introduction to IS" },
  { ar: "كتابة التقارير", en: "Report Writing" },
  { ar: "كتابة التقارير الفنية", en: "Report Writing" },
];

const subjectIndex: Record<string, SubjectPair> = {};
const subjectIndexLowerEn: Record<string, SubjectPair> = {};
const courseIndex: Record<string, SubjectPair> = {};

for (const pair of SUBJECT_PAIRS) {
  // Exact keys
  subjectIndex[pair.en] = pair;
  subjectIndex[pair.ar] = pair;

  // Case-insensitive lookup for English inputs
  subjectIndexLowerEn[pair.en.toLowerCase()] = pair;
}

for (const pair of COURSE_PAIRS) {
  courseIndex[pair.ar] = pair;
  courseIndex[pair.en] = pair;
}

function translateBaseSubject(input: string, lang: SubjectLang): string {
  const s = input.trim();
  const direct = subjectIndex[s];
  if (direct) return direct[lang];

  const lower = s.toLowerCase();
  const lowerHit = subjectIndexLowerEn[lower];
  if (lowerHit) return lowerHit[lang];

  return s;
}

export function translateSubject(input: string, lang: SubjectLang): string {
  const s = input.trim();

  // Arabic lecture prefix (محاضرة X)
  if (s.startsWith("محاضرة ")) {
    const base = s.slice("محاضرة ".length).trim();
    return lang === "ar"
      ? `محاضرة ${translateBaseSubject(base, "ar")}`
      : `${translateBaseSubject(base, "en")} (Lecture)`;
  }

  // English lecture suffix (X (Lecture))
  if (/\(Lecture\)\s*$/i.test(s)) {
    const base = s.replace(/\s*\(Lecture\)\s*$/i, "").trim();
    return lang === "en"
      ? `${translateBaseSubject(base, "en")} (Lecture)`
      : `محاضرة ${translateBaseSubject(base, "ar")}`;
  }

  // English lecture prefix (Lecture X)
  if (/^lecture\s+/i.test(s)) {
    const base = s.replace(/^lecture\s+/i, "").trim();
    return lang === "en"
      ? `${translateBaseSubject(base, "en")} (Lecture)`
      : `محاضرة ${translateBaseSubject(base, "ar")}`;
  }

  return translateBaseSubject(s, lang);
}

export function translateCourseName(input: string, lang: SubjectLang): string {
  const s = input.trim();
  const match = courseIndex[s];
  if (match) return match[lang];
  return s;
}
