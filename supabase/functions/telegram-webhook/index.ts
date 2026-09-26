import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Allowed origins ───
const ALLOWED_ORIGINS = [
  'https://cic-cloud.com',
  'http://localhost:5173',
  'http://localhost:4173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-telegram-bot-secret',
    'Vary': 'Origin',
  };
}

// Map Arabic type names to DB values
const TYPE_MAP: Record<string, { type: string; is_assignment: boolean }> = {
  محاضرة: { type: "lecture", is_assignment: false },
  سكشن: { type: "section", is_assignment: false },
  تكليف: { type: "resource", is_assignment: true },
  "مصدر خارجي": { type: "resource", is_assignment: false },
  lecture: { type: "lecture", is_assignment: false },
  section: { type: "section", is_assignment: false },
  assignment: { type: "resource", is_assignment: true },
  resource: { type: "resource", is_assignment: false },
};

// Subject name aliases to match DB course names
const SUBJECT_ALIASES: Record<string, string[]> = {
  "مقدمة في نظم المعلومات": ["مقدمة في نظم المعلومات"],
  "رياضيات متقطعة": ["الرياضيات غير المتصلة", "الرياضيات المتقطعة", "رياضيات متقطعة"],
  "الرياضيات المتقطعة": ["الرياضيات غير المتصلة", "الرياضيات المتقطعة", "رياضيات متقطعة"],
  "التصميم المنطقي": ["التصميم المنطقي", "التصميم المنطقى"],
  "برمجة الحاسبات": ["برمجة الحاسبات"],
  "الجبر الخطي": ["الجبر الخطي", "Linear Algebra"],
  "كتابة التقارير": ["كتابة التقارير", "كتابة التقارير الفنية"],
};

function findCourseMatch(subject: string, courses: any[]): any | null {
  // Exact match by name or code
  const exact = courses.find(
    (c) => c.name === subject || c.code === subject || c.name.toLowerCase() === subject.toLowerCase()
  );
  if (exact) return exact;

  // Check aliases
  const aliases = SUBJECT_ALIASES[subject];
  if (aliases) {
    for (const alias of aliases) {
      const match = courses.find((c) => c.name === alias || c.name.includes(alias) || alias.includes(c.name));
      if (match) return match;
    }
  }

  // Reverse alias lookup: check if any alias group contains the subject
  for (const [, aliasList] of Object.entries(SUBJECT_ALIASES)) {
    if (aliasList.includes(subject)) {
      for (const alias of aliasList) {
        const match = courses.find((c) => c.name === alias || c.name.includes(alias) || alias.includes(c.name));
        if (match) return match;
      }
    }
  }

  // Partial match
  const partial = courses.find(
    (c) =>
      c.name.includes(subject) ||
      subject.includes(c.name) ||
      c.code.toLowerCase() === subject.toLowerCase()
  );
  if (partial) return partial;

  return null;
}

Deno.serve(async (req) => {
  return new Response(
    JSON.stringify({ status: "error", message: "Telegram integration is currently disabled." }),
    { status: 503, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
  );
});

