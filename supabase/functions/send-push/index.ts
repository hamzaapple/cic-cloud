import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.3/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── VAPID signing key ────────────────────────────────────────────────────────
async function getVapidKeys(base64url: string): Promise<{ signingKey: CryptoKey; publicKey: string }> {
  const std = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (std.length % 4)) % 4);
  const binary = atob(std + padding);
  const rawBytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) rawBytes[i] = binary.charCodeAt(i);

  const header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86,
    0x48, 0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce,
    0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01,
    0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(header.length + rawBytes.length);
  pkcs8.set(header, 0);
  pkcs8.set(rawBytes, header.length);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8.buffer,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"]
  );
  const jwk = await crypto.subtle.exportKey("jwk", key);
  if (!jwk.x || !jwk.y) throw new Error("Invalid VAPID private key");

  const publicBytes = new Uint8Array(65);
  publicBytes[0] = 0x04;
  publicBytes.set(b64UrlToBytes(jwk.x), 1);
  publicBytes.set(b64UrlToBytes(jwk.y), 33);

  return {
    signingKey: (await importJWK(jwk, "ES256")) as CryptoKey,
    publicKey: bytesToB64Url(publicBytes),
  };
}

async function getConfiguredVapidKeys(): Promise<{ signingKey: CryptoKey; publicKey: string }> {
  const vapidPrivateKeyB64 = Deno.env.get("VAPID_PRIVATE_KEY");
  if (!vapidPrivateKeyB64) throw new Error("VAPID_PRIVATE_KEY not configured");
  return getVapidKeys(vapidPrivateKeyB64);
}

// ─── Base64url helpers ────────────────────────────────────────────────────────
function b64UrlToBytes(b64url: string): Uint8Array {
  const std = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (std.length % 4)) % 4);
  const binary = atob(std + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToB64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ─── Web Push Encryption (RFC 8291 — aesgcm128) ───────────────────────────────
// This implements the simplified "aesgcm" scheme that all browsers understand.
async function encryptPayload(
  p256dhB64: string,
  authB64: string,
  plaintext: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKeyBytes = b64UrlToBytes(p256dhB64);
  const authBytes = b64UrlToBytes(authB64);
  const plaintextBytes = new TextEncoder().encode(plaintext);

  // Generate ephemeral EC key pair for this message
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  // Import client public key
  const clientPublicKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPublicKey },
    serverKeyPair.privateKey,
    256
  );

  // Export server public key (uncompressed 65 bytes)
  const serverPublicKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeyPair.publicKey)
  );

  // Salt (16 random bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // PRK using HKDF with auth secret
  const ikm = new Uint8Array(sharedSecret);
  const authKey = await crypto.subtle.importKey("raw", authBytes, { name: "HKDF" }, false, ["deriveKey", "deriveBits"]);
  
  // Build info for pseudo-random key
  const prk = await crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: ikm,
      info: new TextEncoder().encode("Content-Encoding: auth\0"),
    },
    authKey,
    256
  );

  // Derive content encryption key using salt
  const prkKey = await crypto.subtle.importKey("raw", prk, { name: "HKDF" }, false, ["deriveKey", "deriveBits"]);

  // Build info with client + server public keys
  const keyInfo = buildInfo("aesgcm", clientPublicKeyBytes, serverPublicKeyBytes);
  const nonceInfo = buildInfo("nonce", clientPublicKeyBytes, serverPublicKeyBytes);

  const contentKey = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: keyInfo },
    prkKey,
    128
  );
  const nonce = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    prkKey,
    96
  );

  // AES-GCM encrypt
  const aesKey = await crypto.subtle.importKey("raw", contentKey, { name: "AES-GCM" }, false, ["encrypt"]);

  // Pad plaintext (add 2 byte padding length prefix)
  const padded = new Uint8Array(2 + plaintextBytes.length);
  padded.set(plaintextBytes, 2); // first 2 bytes = 0 (no padding)

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    padded
  );

  return { encrypted: new Uint8Array(encrypted), salt, serverPublicKey: serverPublicKeyBytes };
}

function buildInfo(type: string, clientKey: Uint8Array, serverKey: Uint8Array): Uint8Array {
  const context = buildContext(clientKey, serverKey);
  const label = new TextEncoder().encode(`Content-Encoding: ${type}\0P-256\0`);
  const info = new Uint8Array(label.length + context.length);
  info.set(label, 0);
  info.set(context, label.length);
  return info;
}

function buildContext(clientKey: Uint8Array, serverKey: Uint8Array): Uint8Array {
  // 2 bytes len + key for each
  const ctx = new Uint8Array(2 + clientKey.length + 2 + serverKey.length);
  const view = new DataView(ctx.buffer);
  view.setUint16(0, clientKey.length);
  ctx.set(clientKey, 2);
  view.setUint16(2 + clientKey.length, serverKey.length);
  ctx.set(serverKey, 4 + clientKey.length);
  return ctx;
}

// ─── Send a single Web Push ────────────────────────────────────────────────────
async function sendWebPush(
  sub: { endpoint: string; p256dh: string | null; auth: string | null },
  title: string,
  message: string,
  vapidPublicKey: string,
  signingKey: CryptoKey,
  vapidSubject: string
): Promise<{ ok: boolean; status?: number }> {
  try {
    const payload = JSON.stringify({ title, message, icon: "/logo.png" });
    const url = new URL(sub.endpoint);
    const audience = `${url.protocol}//${url.host}`;

    const jwt = await new SignJWT({})
      .setProtectedHeader({ typ: "JWT", alg: "ES256" })
      .setAudience(audience)
      .setSubject(vapidSubject)
      .setExpirationTime("12h")
      .sign(signingKey);

    let body: Uint8Array;
    const extraHeaders: Record<string, string> = {
      TTL: "86400",
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    };

    if (sub.p256dh && sub.auth) {
      // Encrypted push (RFC 8291 aesgcm)
      const { encrypted, salt, serverPublicKey } = await encryptPayload(sub.p256dh, sub.auth, payload);
      body = encrypted;
      extraHeaders["Content-Type"] = "application/octet-stream";
      extraHeaders["Content-Encoding"] = "aesgcm";
      extraHeaders["Crypto-Key"] = `dh=${bytesToB64Url(serverPublicKey)}`;
      extraHeaders["Encryption"] = `salt=${bytesToB64Url(salt)}`;
    } else {
      // Unencrypted fallback (limited browser support)
      body = new TextEncoder().encode(payload);
      extraHeaders["Content-Type"] = "application/octet-stream";
    }

    const response = await fetch(sub.endpoint, {
      method: "POST",
      headers: extraHeaders,
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Push failed (${response.status}) for ${sub.endpoint}: ${text}`);
      return { ok: false, status: response.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("Push send error:", err);
    return { ok: false };
  }
}

// ─── Edge Function handler ────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method === "GET") {
    try {
      const { publicKey } = await getConfiguredVapidKeys();
      return new Response(JSON.stringify({ publicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (keyError) {
      console.error("VAPID public key unavailable:", keyError);
      return new Response(JSON.stringify({ error: "VAPID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

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
    } catch { /* ignore */ }
  }

  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { title, message, target_audience } = await req.json();
    if (!title || !message) {
      return new Response(JSON.stringify({ error: "title and message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let vapidKeys: { signingKey: CryptoKey; publicKey: string };
    try {
      vapidKeys = await getConfiguredVapidKeys();
    } catch (keyError) {
      console.error("VAPID_PRIVATE_KEY not configured or invalid:", keyError);
      return new Response(JSON.stringify({ error: "VAPID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const { data: subs, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth, department");

    if (error) {
      console.error("Failed to fetch subscriptions:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidSubject = "mailto:admin@cic-cloud.app";
    let sent = 0;
    let failed = 0;

    for (const sub of subs) {
      if (
        target_audience &&
        target_audience !== "all" &&
        sub.department &&
        sub.department !== target_audience
      ) {
        continue;
      }

      const ok = await sendWebPush(sub, title, message, vapidKeys.publicKey, vapidKeys.signingKey, vapidSubject);
      if (ok) sent++; else failed++;
    }

    console.log(`Push: ${sent} sent, ${failed} failed / ${subs.length} total`);
    return new Response(JSON.stringify({ sent, failed, total: subs.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
