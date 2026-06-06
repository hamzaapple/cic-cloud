import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Windows in hours and acceptable tolerance (must be >= cron interval / 2)
const WINDOWS: { type: "24h" | "6h" | "1h"; hours: number }[] = [
  { type: "24h", hours: 24 },
  { type: "6h", hours: 6 },
  { type: "1h", hours: 1 },
];
const TOLERANCE_MIN = 35; // cron runs every 30 min

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const now = new Date();
    const horizonMs = 25 * 3600 * 1000;

    const { data: assignments, error } = await supabase
      .from("materials")
      .select("id, title, deadline, course_id, courses(name, departments(name_en))")
      .eq("is_assignment", true)
      .eq("archived", false)
      .is("deleted_at", null)
      .not("deadline", "is", null);

    if (error) throw error;

    const { data: sentRows } = await supabase.from("assignment_reminders_sent").select("material_id, reminder_type");
    const sentSet = new Set((sentRows || []).map((r: any) => `${r.material_id}:${r.reminder_type}`));

    const toSend: { material: any; type: "24h" | "6h" | "1h" }[] = [];

    for (const m of assignments || []) {
      if (!m.deadline) continue;
      // Parse "YYYY-MM-DDTHH:MM" as local Egypt time (UTC+2). Convert to UTC.
      const raw = String(m.deadline);
      const dt = new Date(raw.includes("Z") || /[+-]\d\d:?\d\d$/.test(raw) ? raw : raw + "+02:00");
      if (isNaN(dt.getTime())) continue;
      const diffMin = (dt.getTime() - now.getTime()) / 60000;
      if (diffMin < 0 || diffMin > horizonMs / 60000) continue;

      for (const w of WINDOWS) {
        const targetMin = w.hours * 60;
        if (Math.abs(diffMin - targetMin) <= TOLERANCE_MIN) {
          if (!sentSet.has(`${m.id}:${w.type}`)) {
            toSend.push({ material: m, type: w.type });
          }
        }
      }
    }

    let sentCount = 0;
    for (const { material, type } of toSend) {
      const courseName = (material as any).courses?.name || "";
      const dept = (material as any).courses?.departments?.name_en || "all";
      const label = type === "24h" ? "خلال 24 ساعة ⏰" : type === "6h" ? "خلال 6 ساعات ⚠️" : "خلال ساعة واحدة 🚨";

      const pushRes = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({
          title: `📝 تذكير تسليم: ${courseName}`,
          message: `${material.title} — ${label}`,
          target_audience: dept,
        }),
      });

      if (pushRes.ok) {
        await supabase.from("assignment_reminders_sent").insert({ material_id: material.id, reminder_type: type });
        sentCount++;
      } else {
        console.error("send-push failed", await pushRes.text());
      }
    }

    return new Response(
      JSON.stringify({ checked: assignments?.length || 0, candidates: toSend.length, sent: sentCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("assignment-reminders error", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
