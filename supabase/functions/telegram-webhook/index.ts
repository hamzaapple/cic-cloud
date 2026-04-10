import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-telegram-bot-secret",
};

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ status: "error", message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Auth check
  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (!secret) {
    console.error("TELEGRAM_WEBHOOK_SECRET not configured");
    return new Response(
      JSON.stringify({ status: "error", message: "Server misconfigured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("authorization") || "";
  const botSecret = req.headers.get("x-telegram-bot-secret") || "";
  const token = authHeader.replace("Bearer ", "") || botSecret;

  if (token !== secret) {
    return new Response(
      JSON.stringify({ status: "error", message: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { subject, type, display_name, deadline, file_url } = body;

    // Validate required fields
    if (!subject || !type || !display_name || !file_url) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Missing required fields: subject, type, display_name, file_url",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const typeInfo = TYPE_MAP[type];
    if (!typeInfo) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Invalid type: "${type}". Valid types: محاضرة, سكشن, تكليف, مصدر خارجي`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find course
    const { data: allCourses } = await supabase.from("courses").select("id, name, code");
    const matchedCourse = findCourseMatch(subject, allCourses || []);

    if (!matchedCourse) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: `Course not found: "${subject}". Available courses: ${(allCourses || []).map((c: any) => c.name).join(", ")}`,
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle file: if it's a Telegram file URL, download and re-upload to Supabase Storage
    let finalPdfUrl: string | null = null;
    let finalExternalLink: string | null = null;
    const isTelegramFile = file_url.includes("api.telegram.org/file/bot");

    if (isTelegramFile) {
      try {
        console.log("Downloading file from Telegram...");
        const fileResponse = await fetch(file_url);
        if (!fileResponse.ok) {
          throw new Error(`Failed to download from Telegram: ${fileResponse.status}`);
        }
        const fileBlob = await fileResponse.blob();
        const fileName = `${Date.now()}-${display_name.replace(/\s+/g, "_")}.pdf`;

        const { error: uploadError } = await supabase.storage
          .from("materials")
          .upload(fileName, fileBlob, {
            contentType: "application/pdf",
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from("materials")
          .getPublicUrl(fileName);

        finalPdfUrl = publicUrlData.publicUrl;
        console.log("File uploaded to storage:", finalPdfUrl);
      } catch (dlError) {
        console.error("File download/upload error:", dlError);
        // Fallback: store the Telegram URL directly (temporary, will expire)
        finalPdfUrl = file_url;
      }
    } else if (
      file_url.endsWith(".pdf") ||
      file_url.includes("storage") ||
      file_url.includes("supabase") ||
      file_url.includes(".pdf?")
    ) {
      finalPdfUrl = file_url;
    } else {
      finalExternalLink = file_url;
    }

    // Insert material
    const materialData: any = {
      title: display_name,
      type: typeInfo.type,
      course_id: matchedCourse.id,
      is_assignment: typeInfo.is_assignment,
      archived: false,
      pdf_display_name: display_name,
      pdf_url: finalPdfUrl,
      external_link: finalExternalLink,
    };

    if (deadline) {
      // Support formats like "2026-11-15 10:00" → store as "2026-11-15"
      materialData.deadline = deadline.trim().split(" ")[0];
    }

    const { data: material, error: materialError } = await supabase
      .from("materials")
      .insert(materialData)
      .select()
      .single();

    if (materialError) {
      console.error("Material insert error:", materialError);
      return new Response(
        JSON.stringify({ status: "error", message: `Failed to insert material: ${materialError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notification
    const typeLabel = typeInfo.is_assignment ? "تكليف" : type;
    let notifMessage = `تم رفع ${typeLabel}: ${display_name}`;
    if (deadline) {
      notifMessage += ` - موعد التسليم: ${deadline}`;
    }

    const { error: notifError } = await supabase.from("notifications").insert({
      title: `📢 ${display_name}`,
      message: notifMessage,
      target_audience: "all",
      sent_by: "telegram-bot",
    });

    if (notifError) {
      console.error("Notification insert error:", notifError);
    }

    // Send real push notifications to all subscribers
    try {
      const pushResponse = await fetch(
        `${supabaseUrl}/functions/v1/send-push`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            title: `📢 ${display_name}`,
            message: notifMessage,
          }),
        }
      );
      const pushResult = await pushResponse.json();
      console.log("Push notification result:", pushResult);
    } catch (pushErr) {
      console.error("Push notification error:", pushErr);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Material uploaded and notifications sent.",
        data: {
          material_id: material.id,
          course: matchedCourse.name,
          type: typeInfo.type,
          is_assignment: typeInfo.is_assignment,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
