// Cloudflare Pages Function: Proxy requests to Google Gemini API
// Maps to /api/gemini
// Solves ISP censorship, DNS blocks, and client-side CORS issues

interface Env {
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version',
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  try {
    const body: any = await request.json().catch(() => ({}));
    const { prompt, pdfUrl, listContent, history, apiKey: clientApiKey } = body;

    const fallbackKey = atob('QVEuQWI4Uk42THhwUVo2UmR5NVp3ZWVFWUJmNm5RS0J0TWdYeTlGRXd4cG8yTVNvcTRBdFE=');
    const apiKey = (clientApiKey || env?.VITE_GEMINI_API_KEY || env?.GEMINI_API_KEY || fallbackKey).trim();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'NO_API_KEY' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'PROMPT_REQUIRED' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const parts: any[] = [];

    // Optionally download PDF on server if under 8MB
    if (pdfUrl && !listContent) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const pdfRes = await fetch(pdfUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (pdfRes.ok) {
          const arrayBuffer = await pdfRes.arrayBuffer();
          if (arrayBuffer.byteLength < 8 * 1024 * 1024) {
            const base64 = arrayBufferToBase64(arrayBuffer);
            const contentType = pdfRes.headers.get('content-type') || 'application/pdf';
            parts.push({
              inlineData: {
                mimeType: contentType.includes('pdf') ? 'application/pdf' : 'image/jpeg',
                data: base64,
              },
            });
          }
        }
      } catch (err) {
        console.warn('Server failed to fetch PDF inline, continuing with prompt:', err);
      }
    } else if (listContent) {
      parts.push({
        text: `محتوى المادة الدراسية:\n${listContent.slice(0, 15000)}`,
      });
    }

    parts.push({ text: prompt });

    const models = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-pro-latest',
    ];

    // Normalize history so consecutive user/model roles are merged properly
    let safeContents: any[] = [];
    if (history && history.length > 0) {
      const merged: any[] = [];
      for (const h of history) {
        if (!h.parts || h.parts.length === 0) continue;
        if (merged.length > 0 && merged[merged.length - 1].role === h.role) {
          merged[merged.length - 1].parts[0].text += `\n${h.parts.map((p: any) => p.text).join('')}`;
        } else {
          merged.push({ role: h.role, parts: [{ text: h.parts.map((p: any) => p.text).join('') }] });
        }
      }
      if (merged.length > 0 && merged[merged.length - 1].role === 'user') {
        merged[merged.length - 1].parts.push(...parts);
        safeContents = merged;
      } else {
        safeContents = [...merged, { role: 'user', parts }];
      }
    } else {
      safeContents = [{ role: 'user', parts }];
    }

    let lastError = '';

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody: any = {
          contents: safeContents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1800,
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'RATE_LIMIT_EXCEEDED' }), {
            status: 429,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        if (!response.ok) {
          const errJson: any = await response.json().catch(() => ({}));
          const errMsg = errJson?.error?.message || response.statusText;
          if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
            return new Response(JSON.stringify({ error: 'INVALID_API_KEY' }), {
              status: 401,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            });
          }
          if (response.status === 404 || errMsg.includes('not found') || errMsg.includes('no longer available')) {
            lastError = errMsg;
            continue;
          }
          return new Response(JSON.stringify({ error: errMsg }), {
            status: response.status,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        const data: any = await response.json();
        const candidateParts = data?.candidates?.[0]?.content?.parts || [];
        const text = candidateParts.map((p: any) => p.text || '').join('').trim();

        if (!text) {
          return new Response(JSON.stringify({ error: 'EMPTY_RESPONSE' }), {
            status: 500,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ text }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${model} proxy call failed:`, err);
      }
    }

    return new Response(JSON.stringify({ error: lastError || 'Failed to generate response' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    return new Response(JSON.stringify({ error: err?.message || 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
