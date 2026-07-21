// src/worker.js
// A single Cloudflare Worker that:
//   1. Serves the static portfolio (index.html) via the ASSETS binding
//   2. Handles POST /api/chat by calling Google's Gemini API (free tier)
// Your Gemini key is read from env.GEMINI_API_KEY, set as an environment
// variable in the Cloudflare dashboard — never committed to the repo.

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

async function handleChat(request, env) {
  try {
    const body = await request.json();
    const { messages, system } = body || {};

    if (!messages || !Array.isArray(messages)) {
      return json({ error: 'Invalid request body' }, 400);
    }

    // Convert our {role: 'user'|'assistant', content}[] into Gemini's format,
    // where the assistant's role is called "model" instead of "assistant".
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const model = 'gemini-2.5-flash'; // fast + free-tier eligible
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY, // ← secret, set in Cloudflare dashboard
      },
      body: JSON.stringify({
        contents,
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: { maxOutputTokens: 500 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return json({ error: data.error?.message || 'API error' }, response.status);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return json({ reply });
  } catch (err) {
    console.error('Function error:', err);
    return json({ error: 'Internal server error' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders() });
      }
      if (request.method === 'POST') {
        return handleChat(request, env);
      }
      return json({ error: 'Method Not Allowed' }, 405);
    }

    // Everything else (index.html, etc.) is served from the /public folder
    // via the ASSETS binding configured in wrangler.jsonc.
    return env.ASSETS.fetch(request);
  },
};
