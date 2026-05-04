import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    
    if (!vapidPrivateKey || !vapidPublicKey) {
      console.error("VAPID keys not configured in Edge Function env");
      return new Response(JSON.stringify({ error: "VAPID keys missing" }), { status: 500, headers: corsHeaders });
    }

    webpush.setVapidDetails(
      "mailto:admin@cic-cloud.app",
      vapidPublicKey,
      vapidPrivateKey
    );

    if (req.method === "GET") {
      const body = await req.json().catch(() => ({}));
      return new Response(JSON.stringify({ publicKey: vapidPublicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      return new Response(JSON.stringify({ publicKey: vapidPublicKey }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!authorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { title, message, target_audience } = body;
    if (!title || !message) {
      return new Response(JSON.stringify({ error: "Missing title or message" }), { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);
    const { data: subs, error } = await supabase.from("push_subscriptions").select("*");

    if (error || !subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, failed: 0, total: 0 }), { headers: corsHeaders });
    }

    const payload = JSON.stringify({ title, message, icon: "/logo.png" });
    let sent = 0;
    let failed = 0;
    const staleIds: string[] = [];

    const sendPromises = subs.map(async (sub) => {
      if (target_audience && target_audience !== "all" && sub.department && sub.department !== target_audience) {
        return; // skip
      }

      if (!sub.endpoint || !sub.p256dh || !sub.auth) {
        staleIds.push(sub.id);
        failed++;
        return;
      }

      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
      } catch (err: any) {
        failed++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          staleIds.push(sub.id);
        }
      }
    });

    await Promise.all(sendPromises);

    if (staleIds.length > 0) {
      await supabase.from("push_subscriptions").delete().in("id", staleIds);
    }

    console.log(`Push completed: ${sent} sent, ${failed} failed / ${subs.length} total`);
    return new Response(JSON.stringify({ sent, failed, cleaned: staleIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Global edge function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
