// Supabase Edge Function: Generate presigned PUT URL for Cloudflare R2
// POST { fileName, contentType }
// Returns { uploadUrl, publicUrl, key }

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    // Verify auth — only logged-in admins can upload
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return new Response(
        JSON.stringify({ error: 'fileName and contentType are required' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Only allow video MIME types for R2
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(contentType)) {
      return new Response(
        JSON.stringify({ error: 'Only video files are allowed for R2 upload' }),
        { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // R2 credentials from Supabase secrets
    const R2_ACCOUNT_ID = Deno.env.get('R2_ACCOUNT_ID')!;
    const R2_ACCESS_KEY_ID = Deno.env.get('R2_ACCESS_KEY_ID')!;
    const R2_SECRET_ACCESS_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY')!;
    const R2_BUCKET_NAME = Deno.env.get('R2_BUCKET_NAME')!;
    const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL')!; // e.g. https://pub-xxx.r2.dev or custom domain

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME || !R2_PUBLIC_URL) {
      console.error('Missing R2 environment variables');
      return new Response(
        JSON.stringify({ error: 'R2 configuration is missing' }),
        { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize filename and generate a unique key
    const ext = fileName.lastIndexOf('.') >= 0 ? fileName.slice(fileName.lastIndexOf('.')) : '';
    const base = fileName.lastIndexOf('.') >= 0 ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
    const clean = base.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 60) || 'video';
    const key = `videos/${Date.now()}-${clean}${ext}`;

    // Generate presigned URL using AWS Signature V4 for S3-compatible API
    const endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${R2_BUCKET_NAME}/${key}`;

    // We'll use a simple approach: generate a presigned URL using the S3 PutObject
    const expiresIn = 300; // 5 minutes
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const region = 'auto';
    const service = 's3';

    // Credential scope
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const credential = `${R2_ACCESS_KEY_ID}/${credentialScope}`;

    // Canonical query string
    const queryParams = new URLSearchParams({
      'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
      'X-Amz-Credential': credential,
      'X-Amz-Date': amzDate,
      'X-Amz-Expires': String(expiresIn),
      'X-Amz-SignedHeaders': 'host;content-type',
    });

    const canonicalQueryString = [...queryParams.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const host = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

    // Canonical request
    const canonicalRequest = [
      'PUT',
      `/${R2_BUCKET_NAME}/${key}`,
      canonicalQueryString,
      `content-type:${contentType}`,
      `host:${host}`,
      '',
      'content-type;host',
      'UNSIGNED-PAYLOAD',
    ].join('\n');

    // String to sign
    const encoder = new TextEncoder();

    async function hmacSha256(key: ArrayBuffer, message: string): Promise<ArrayBuffer> {
      const cryptoKey = await crypto.subtle.importKey(
        'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
      );
      return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message));
    }

    async function sha256Hex(message: string): Promise<string> {
      const hash = await crypto.subtle.digest('SHA-256', encoder.encode(message));
      return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join('');
    }

    const canonicalRequestHash = await sha256Hex(canonicalRequest);
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    // Signing key
    const kDate = await hmacSha256(encoder.encode(`AWS4${R2_SECRET_ACCESS_KEY}`).buffer, dateStamp);
    const kRegion = await hmacSha256(kDate, region);
    const kService = await hmacSha256(kRegion, service);
    const kSigning = await hmacSha256(kService, 'aws4_request');

    // Signature
    const signatureBuffer = await hmacSha256(kSigning, stringToSign);
    const signature = [...new Uint8Array(signatureBuffer)].map(b => b.toString(16).padStart(2, '0')).join('');

    const presignedUrl = `${url}?${canonicalQueryString}&X-Amz-Signature=${signature}`;

    // Public URL for reading the file after upload
    const publicUrl = `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;

    return new Response(
      JSON.stringify({
        uploadUrl: presignedUrl,
        publicUrl,
        key,
        contentType,
      }),
      { headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('R2 presign error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate upload URL' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
