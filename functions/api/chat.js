// functions/api/chat.js
// Cloudflare Pages Function — runs on Cloudflare's edge, your API key stays secret here.
// File path functions/api/chat.js automatically becomes the route: POST /api/chat
// Uses Google's Gemini API (gemini-2.5-flash) — has a permanent free tier.

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

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders() });
}

// Handle the actual chat request
export async function onRequestPost(context) {
  const { request, env } = context;

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
