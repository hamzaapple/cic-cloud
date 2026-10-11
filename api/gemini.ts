// Vercel Serverless Function: Proxy requests to Google Gemini API
// Solves ISP censorship, DNS blocks, and client-side CORS issues

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, pdfUrl, listContent, history, apiKey: clientApiKey } = req.body || {};

    const fallbackKey = typeof atob !== 'undefined'
      ? atob('QVEuQWI4Uk42THhwUVo2UmR5NVp3ZWVFWUJmNm5RS0J0TWdYeTlGRXd4cG8yTVNvcTRBdFE=')
      : Buffer.from('QVEuQWI4Uk42THhwUVo2UmR5NVp3ZWVFWUJmNm5RS0J0TWdYeTlGRXd4cG8yTVNvcTRBdFE=', 'base64').toString('utf8');
    const apiKey = (clientApiKey || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || fallbackKey).trim();

    if (!apiKey) {
      return res.status(400).json({ error: 'NO_API_KEY' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'PROMPT_REQUIRED' });
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
          const buffer = Buffer.from(arrayBuffer);
          if (buffer.length < 8 * 1024 * 1024) {
            const base64 = buffer.toString('base64');
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
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-pro-latest',
    ];

    let lastError = '';

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestBody: any = {
          contents: history ? [...history, { role: 'user', parts }] : [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 3000,
          },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.status === 429) {
          return res.status(429).json({ error: 'RATE_LIMIT_EXCEEDED' });
        }

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errMsg = errJson?.error?.message || response.statusText;
          if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
            return res.status(401).json({ error: 'INVALID_API_KEY' });
          }
          if (response.status === 404 || errMsg.includes('not found') || errMsg.includes('no longer available')) {
            lastError = errMsg;
            continue;
          }
          return res.status(response.status).json({ error: errMsg });
        }

        const data = await response.json();
        const candidateParts = data?.candidates?.[0]?.content?.parts || [];
        const text = candidateParts.map((p: any) => p.text || '').join('').trim();

        if (!text) {
          return res.status(500).json({ error: 'EMPTY_RESPONSE' });
        }

        return res.status(200).json({ text });
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Model ${model} proxy call failed:`, err);
      }
    }

    return res.status(500).json({ error: lastError || 'Failed to generate response' });
  } catch (err: any) {
    console.error('Gemini proxy error:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error' });
  }
}
