// Parses a photo of grades into structured course/grade entries using Lovable AI vision.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Course { name: string; grade: string; credits: number; }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = 
      Deno.env.get('GEMINI_API_KEY') || 
      Deno.env.get('GOOGLE_AI_API_KEY') || 
      Deno.env.get('GOOGLE_API_KEY') || 
      Deno.env.get('LOVABLE_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in Supabase secrets.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    const { imageDataUrl } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
      return new Response(JSON.stringify({ error: 'imageDataUrl must be a data:image/* URL' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (imageDataUrl.length > 12 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'Image too large (max ~9MB)' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You extract a student's grades from a photo of a report card, transcript, gradebook, or screenshot.
Return ONLY valid JSON matching this schema (no prose, no markdown):
{ "courses": [ { "name": string, "grade": "A+"|"A"|"A-"|"B+"|"B"|"B-"|"C+"|"C"|"C-"|"D+"|"D"|"D-"|"F", "credits": number } ] }
Rules:
- "credits" defaults to 1 if not visible.
- If a numeric percentage is shown, convert: 97+ A+, 93-96 A, 90-92 A-, 87-89 B+, 83-86 B, 80-82 B-, 77-79 C+, 73-76 C, 70-72 C-, 67-69 D+, 63-66 D, 60-62 D-, <60 F.
- Skip non-academic rows (attendance, conduct, etc.).
- If you can't read it, return { "courses": [] }.`;

    const aiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract every class and its letter grade from this image.' },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error('AI error', aiRes.status, txt);
      const status = aiRes.status === 429 ? 429 : aiRes.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: status === 429 ? 'Rate limit, please try again.' : status === 402 ? 'AI credits exhausted.' : 'AI request failed' }), {
        status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiJson = await aiRes.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json|```/g, '').trim();
    let parsed: { courses?: Course[] } = {};
    try { parsed = JSON.parse(cleaned); } catch { parsed = { courses: [] }; }
    const courses = Array.isArray(parsed.courses) ? parsed.courses.slice(0, 30) : [];

    return new Response(JSON.stringify({ courses }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('parse-grades-photo error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
