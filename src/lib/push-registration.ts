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

export function getSavedDepartment(): string {
  try {
    const deptContext = localStorage.getItem("cic_dept_context");
    if (deptContext === "cs" || deptContext === "ai_cyber") return deptContext;
    const pushDept = localStorage.getItem("cic_push_dept");
    if (pushDept === "bachelor") return "bachelor";
    return deptContext || pushDept || "all";
  } catch {
    return "all";
  }
}

export function getSavedYear(): string {
  try {
    return localStorage.getItem("cic_year") || "1";
  } catch {
    return "1";
  }
}

export async function registerPushSubscription(
  subscription: PushSubscription,
  department?: string | null,
  academicYear?: string | null,
) {
  const json = subscription.toJSON();
  const finalDept = department || getSavedDepartment();
  const finalYear = academicYear ?? getSavedYear();

  const { error } = await (supabase.rpc as any)("register_push_subscription", {
    p_endpoint: subscription.endpoint,
    p_p256dh: json.keys?.p256dh || null,
    p_auth: json.keys?.auth || null,
    p_user_agent: navigator.userAgent,
    p_department: finalDept,
    p_academic_year: finalYear,
  });

  if (error) throw error;
}

/**
 * Sync both academic year and department to the push subscription in DB.
 */
export async function syncPushPreferences(department?: string | null, academicYear?: string | null) {
  try {
    if (department) {
      localStorage.setItem("cic_push_dept", department);
      if (department === "cs" || department === "ai_cyber" || department === "bachelor") {
        localStorage.setItem("cic_dept_context", department);
      }
    }
    if (academicYear) {
      localStorage.setItem("cic_year", academicYear);
    }
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await registerPushSubscription(sub, department || getSavedDepartment(), academicYear || getSavedYear());
    }
  } catch (e) {
    console.warn("[push] failed to sync push preferences", e);
  }
}

/**
 * Tag this device's push subscription with an audience (e.g. "bachelor" or "cs" or "ai_cyber").
 */
export async function setPushAudience(department: string) {
  // If the user already has a specific department ("cs" or "ai_cyber"), do not downgrade to "all"
  if (department === "all") {
    const existing = getSavedDepartment();
    if (existing === "cs" || existing === "ai_cyber" || existing === "bachelor") {
      return;
    }
  }
  await syncPushPreferences(department, null);
}

/** Re-tag this device with the visitor's academic year so it only gets that year's alerts. */
export async function setPushYear(academicYear: string) {
  await syncPushPreferences(null, academicYear);
}
