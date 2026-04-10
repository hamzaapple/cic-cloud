import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.3/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getVapidKey(base64url: string) {
  // Import raw 32-byte EC private key via JWK
  // We need to derive the public key x,y from the private key d
  // But jose supports importing with just d if we use the right approach
  // Actually, for signing we need d + x + y. Let's compute them.
  
  // Convert base64url private key to JWK format
  // For EC P-256, we can import using crypto.subtle with raw format
  const std = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (std.length % 4)) % 4);
  const binary = atob(std + padding);
  const rawBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) rawBytes[i] = binary.charCodeAt(i);

  // Build PKCS#8 DER
  const header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
    0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01,
    0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(header.length + rawBytes.length);
  pkcs8.set(header, 0);
  pkcs8.set(rawBytes, header.length);

  // Import as CryptoKey with sign usage
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    true, // extractable so we can export as JWK
    ["sign"]
  );

  // Export as JWK to get d, x, y
  const jwk = await crypto.subtle.exportKey("jwk", key);
  
  // Re-import via jose for JWT signing
  return await importJWK(jwk, "ES256");
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string | null; auth: string | null },
  payload: string, vapidPublicKey: string, signingKey: CryptoKey, vapidSubject: string
): Promise<boolean> {
  try {
    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    const jwt = await new SignJWT({})
      .setProtectedHeader({ typ: "JWT", alg: "ES256" })
      .setAudience(audience)
      .setSubject(vapidSubject)
      .setExpirationTime("12h")
      .sign(signingKey);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        TTL: "86400",
        Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
      },
      body: new TextEncoder().encode(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Push failed (${response.status}): ${text}`);
      return false;
    }
    await response.text();
    return true;
  } catch (err) {
    console.error("Push send error:", err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const authHeader = req.headers.get("authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = authHeader.replace("Bearer ", "");

  let authorized = token === serviceKey;
  if (!authorized && token) {
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const checkClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || serviceKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: { user } } = await checkClient.auth.getUser(token);
      if (user) {
        const role = user.app_metadata?.app_role;
        if (role === "owner" || role === "moderator") authorized = true;
      }
    } catch {}
  }

  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { title, message, target_audience } = await req.json();
    if (!title || !message) {
      return new Response(JSON.stringify({ error: "title and message required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const vapidPublicKey = "BKZRratAiVsA6zZo4zLJhuN8Q0EDuIPU9e2rpTkvQgUYs4NKB3CEra1BhQALPzzjovuh0fJxEwHBzuY2hd5NJhE";
    const vapidPrivateKeyB64 = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivateKeyB64) {
      console.error("VAPID_PRIVATE_KEY not configured");
      return new Response(JSON.stringify({ error: "VAPID not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Import key once
    const signingKey = await getVapidKey(vapidPrivateKeyB64);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: subs, error } = await supabase.from("push_subscriptions").select("endpoint, p256dh, auth, department");

    if (error) {
      console.error("Failed to fetch subscriptions:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const payload = JSON.stringify({ title, message });
    let sent = 0;
    let failed = 0;

    for (const sub of subs) {
      // Filter by target_audience (department)
      if (
        target_audience && 
        target_audience !== "all" && 
        sub.department && 
        sub.department !== target_audience && 
        sub.department !== "all" // Assuming users choosing "all" want everything
      ) {
        continue;
      }

      const ok = await sendWebPush(sub, payload, vapidPublicKey, signingKey as CryptoKey, "mailto:admin@cic-cloud.lovable.app");
      if (ok) sent++; else failed++;
    }

    console.log(`Push notifications: ${sent} sent, ${failed} failed out of ${subs.length}`);
    return new Response(JSON.stringify({ sent, failed, total: subs.length }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
