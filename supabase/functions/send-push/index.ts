import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

// ─── CORS headers — allow any requesting origin ───
function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
    'Vary': 'Origin',
  };
}

function normalizeDept(d?: string | null): string {
  if (!d) return "all";
  const s = String(d).trim().toLowerCase();
  if (s === "cs" || s.includes("حاسب")) return "cs";
  if (s === "ai, cyber" || s === "ai_cyber" || s === "ai" || s.includes("cyber") || s.includes("سيبر") || s.includes("ذكاء")) return "ai_cyber";
  if (s === "bachelor" || s.includes("بكالور")) return "bachelor";
  return s;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    let vapidSubject = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@cic-cloud.app";
    
    // Ensure VAPID_SUBJECT is a valid mailto: link
    if (vapidSubject && !vapidSubject.startsWith("mailto:")) {
      vapidSubject = `mailto:${vapidSubject}`;
    }

    if (!vapidPrivateKey || !vapidPublicKey) {
      console.error("VAPID keys not configured in Edge Function env");
      return new Response(JSON.stringify({ error: "VAPID keys missing" }), { status: 500, headers: getCorsHeaders(req) });
    }

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get VAPID public key for frontend
    if (req.method === "GET") {
      return new Response(JSON.stringify({ publicKey: vapidPublicKey }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("authorization") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const token = authHeader.replace("Bearer ", "");

    let authorized = token === serviceKey;
    if (!authorized && token) {
      try {
        const checkClient = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: { user } } = await checkClient.auth.getUser(token);
        if (user && (user.app_metadata?.app_role === "owner" || user.app_metadata?.app_role === "moderator")) {
          authorized = true;
        }
      } catch { /* ignore */ }
    }

    const body = await req.json().catch(() => ({}));
    if (body.action === "get_vapid_key") {
      return new Response(JSON.stringify({ publicKey: vapidPublicKey }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: getCorsHeaders(req) });
    }

    const { title, message, target_audience, target_year, link } = body;
    if (!title || !message) {
      return new Response(JSON.stringify({ error: "Missing title or message" }), { status: 400, headers: getCorsHeaders(req) });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    
    // Fetch ALL subscriptions from the table
    const { data: subs, error: subsError } = await supabase.from("push_subscriptions").select("*");

    if (subsError || !subs || subs.length === 0) {
      console.log("No subscriptions found or error fetching them:", subsError);
      return new Response(JSON.stringify({ sent: 0, failed: 0, total: 0 }), { 
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } 
      });
    }

    const payload = JSON.stringify({ 
      title, 
      message, 
      body: message,
      icon: "/logo.png",
      data: { url: link || "/" }
    });

    let sentCount = 0;
    let failedCount = 0;
    const staleIds: string[] = [];

    // Use Promise.allSettled to handle multiple requests without failing the whole process
    const results = await Promise.allSettled(subs.map(async (sub) => {
      const targetDept = normalizeDept(target_audience);
      const subDept = normalizeDept(sub.department);

      // Bachelor segregation
      if (targetDept === "bachelor") {
        if (subDept !== "bachelor") return { skipped: true };
      } else {
        if (subDept === "bachelor") return { skipped: true };

        // Strict department filtering: if notification is targeted to a specific department,
        // subscriber MUST match that department.
        if (targetDept !== "all") {
          if (subDept !== targetDept) {
            return { skipped: true };
          }
        }
      }

      // Filter by academic year if target_year is provided
      const normTargetYear = target_year ? String(target_year).trim() : "all";
      const normSubYear = sub.academic_year ? String(sub.academic_year).trim() : null;

      if (normTargetYear && normTargetYear !== "all") {
        if (!normSubYear || normSubYear !== normTargetYear) {
          return { skipped: true };
        }
      }

      if (!sub.endpoint || !sub.p256dh || !sub.auth) {
        staleIds.push(sub.id);
        return { failed: true, reason: "Missing subscription keys" };
      }

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { success: true };
      } catch (err: any) {
        console.error(`[send-push] failed for ${sub.endpoint?.slice(0, 60)} status=${err?.statusCode} body=${err?.body || err?.message}`);
        // Remove stale/invalid subs (gone, forbidden — wrong VAPID key, bad request)
        if (err.statusCode === 404 || err.statusCode === 410 || err.statusCode === 403 || err.statusCode === 400) {
          staleIds.push(sub.id);
        }
        throw err;
      }
    }));

    results.forEach((res) => {
      if (res.status === "fulfilled") {
        if ((res.value as any).success) sentCount++;
        else if ((res.value as any).failed) failedCount++;
      } else {
        failedCount++;
      }
    });

    // Cleanup stale subscriptions
    if (staleIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    console.log(`Push completed: ${sentCount} sent, ${failedCount} failed / ${subs.length} total`);
    return new Response(JSON.stringify({ 
      sent: sentCount, 
      failed: failedCount, 
      cleaned: staleIds.length,
      total: subs.length
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Global edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: getCorsHeaders(req) });
  }
});

