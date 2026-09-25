/**
 * Cloudflare R2 upload helper.
 * Requests a presigned URL from the Supabase Edge Function,
 * then uploads the file directly to R2 from the browser.
 *
 * Only used for VIDEO files — PDFs still go to Supabase Storage.
 */

import { supabase } from "@/integrations/supabase/client";

const VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
] as const;

/** Check if a file is a video that should go to R2 */
export function isVideoFile(file: File): boolean {
  return (
    (VIDEO_MIME_TYPES as readonly string[]).includes(file.type) ||
    /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name)
  );
}

interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  contentType: string;
}

/**
 * Upload a video file to Cloudflare R2 via presigned URL.
 * 1. Calls the `r2-presign` edge function to get a presigned PUT URL
 * 2. PUTs the file directly to R2
 * 3. Returns the public URL
 */
export async function uploadVideoToR2(file: File): Promise<string> {
  // Get the content type
  const contentType =
    (VIDEO_MIME_TYPES as readonly string[]).includes(file.type)
      ? file.type
      : "video/mp4"; // fallback

  // 1. Get presigned URL from edge function
  const { data, error } = await supabase.functions.invoke<PresignResponse>(
    "r2-presign",
    {
      body: {
        fileName: file.name,
        contentType,
      },
    }
  );

  if (error || !data) {
    console.error("Failed to get R2 presigned URL:", error);
    throw new Error("فشل في الحصول على رابط الرفع. تأكد من إعدادات R2.");
  }

  const { uploadUrl, publicUrl } = data;

  // 2. Upload directly to R2
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const errText = await uploadResponse.text().catch(() => "Unknown error");
    console.error("R2 upload failed:", uploadResponse.status, errText);
    throw new Error(`فشل رفع الفيديو على R2: ${uploadResponse.status}`);
  }

  // 3. Return the public URL
  return publicUrl;
}
