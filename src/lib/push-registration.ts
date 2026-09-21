import { supabase } from "@/integrations/supabase/client";

export async function getVapidPublicKey() {
  const { data, error } = await supabase.functions.invoke("send-push", { method: "GET" } as any);
  if (error || !data?.publicKey) throw error || new Error("Missing VAPID public key");
  return data.publicKey as string;
}

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) out[i] = rawData.charCodeAt(i);
  return out;
}

export async function registerPushSubscription(
  subscription: PushSubscription,
  department?: string | null,
  academicYear?: string | null,
) {
  const json = subscription.toJSON();
  const { error } = await (supabase.rpc as any)("register_push_subscription", {
    p_endpoint: subscription.endpoint,
    p_p256dh: json.keys?.p256dh || null,
    p_auth: json.keys?.auth || null,
    p_user_agent: navigator.userAgent,
    p_department: department || localStorage.getItem("cic_push_dept") || "all",
    p_academic_year: academicYear ?? localStorage.getItem("cic_year"),
  });

  if (error) throw error;
}
/**
 * Tag this device's push subscription with an audience (e.g. "bachelor" or "all").
 * Bachelor devices only get bachelor notifications, and university notifications skip them.
 */
export async function setPushAudience(department: string) {
  const current = localStorage.getItem("cic_push_dept");
  localStorage.setItem("cic_push_dept", department);
  if (current === department) return;
  try {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await registerPushSubscription(sub, department);
  } catch (e) {
    console.warn("[push] failed to update audience", e);
  }
}

/** Re-tag this device with the visitor's academic year so it only gets that year's alerts. */
export async function setPushYear(academicYear: string) {
  try {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await registerPushSubscription(sub, null, academicYear);
  } catch (e) {
    console.warn("[push] failed to update year", e);
  }
}
