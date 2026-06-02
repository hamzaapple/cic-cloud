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

export async function registerPushSubscription(subscription: PushSubscription, department?: string | null) {
  const json = subscription.toJSON();
  const { error } = await (supabase.rpc as any)("register_push_subscription", {
    p_endpoint: subscription.endpoint,
    p_p256dh: json.keys?.p256dh || null,
    p_auth: json.keys?.auth || null,
    p_user_agent: navigator.userAgent,
    p_department: department || localStorage.getItem("cic_push_dept") || "all",
  });

  if (error) throw error;
}