const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { image } = await req.json();
    if (!image || typeof image !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing image' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = 
      Deno.env.get('GEMINI_API_KEY') || 
      Deno.env.get('GOOGLE_AI_API_KEY') || 
      Deno.env.get('GOOGLE_API_KEY') || 
      Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'AI key not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in Supabase secrets.' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isGoogle = apiKey.startsWith('AIza') || Boolean(
      Deno.env.get('GEMINI_API_KEY') || 
      Deno.env.get('GOOGLE_AI_API_KEY') || 
      Deno.env.get('GOOGLE_API_KEY')
    );

    const endpoint = isGoogle 
      ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
      : 'https://ai.gateway.lovable.dev/v1/chat/completions';

    const model = isGoogle ? 'gemini-2.0-flash' : 'google/gemini-2.5-flash';

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a friendly, safety-first personal trainer helping high school students learn gym equipment. Always emphasize good form and starting light. Keep it concise and easy to follow.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this gym machine and explain how to use it. Format as markdown with: **Machine name**, then a short intro, then "## How to use it" (numbered steps), then "## Muscles worked" (bullet list), then "## Safety tips" (3 bullets). If this is not a gym machine, say so politely.' },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit reached. Try again in a minute.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits in Lovable.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway error: ${txt}`);
    }

    const data = await res.json();
    const guide = data.choices?.[0]?.message?.content ?? 'No response from AI.';

    return new Response(JSON.stringify({ guide }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
