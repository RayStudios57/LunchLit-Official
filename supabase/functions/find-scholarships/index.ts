// Searches the live web for scholarship opportunities using Firecrawl or Gemini AI fallback.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReqBody {
  category?: 'local' | 'national' | 'school' | 'general';
  location?: string;
  schoolName?: string;
  gradeLevel?: string;
  keywords?: string;
}

interface ScholarshipItem {
  title: string;
  url: string;
  description: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    const category = body.category ?? 'general';

    let query = '';
    switch (category) {
      case 'local':
        query = `local high school scholarships ${body.location ?? ''} 2026 deadline application`.trim();
        break;
      case 'school':
        query = `${body.schoolName ?? ''} college scholarships financial aid undergraduate 2026`.trim();
        break;
      case 'national':
        query = `national scholarships for ${body.gradeLevel ?? 'high school'} students 2026 deadline ${body.keywords ?? ''}`.trim();
        break;
      default:
        query = `scholarships for students ${body.keywords ?? ''} 2026 deadline application`.trim();
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const aiKey =
      Deno.env.get('GEMINI_API_KEY') ||
      Deno.env.get('GOOGLE_AI_API_KEY') ||
      Deno.env.get('GOOGLE_API_KEY') ||
      Deno.env.get('LOVABLE_API_KEY');

    // 1. Try Firecrawl if key is configured
    if (firecrawlKey) {
      try {
        const fcRes = await fetch('https://api.firecrawl.dev/v2/search', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            limit: 10,
            tbs: 'qdr:m',
          }),
        });

        if (fcRes.ok) {
          const fcJson = await fcRes.json();
          const items: Record<string, string>[] = Array.isArray(fcJson?.data)
            ? fcJson.data
            : Array.isArray(fcJson?.web)
              ? fcJson.web
              : Array.isArray(fcJson?.data?.web)
                ? fcJson.data.web
                : [];

          const scholarships = items.slice(0, 10).map((it) => ({
            title: it.title || it.name || 'Scholarship Opportunity',
            url: it.url || it.link || '',
            description: (it.description || it.snippet || '').slice(0, 300),
          })).filter((s) => s.url);

          if (scholarships.length > 0) {
            return new Response(JSON.stringify({ scholarships, query }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } else {
          console.warn('Firecrawl search failed with status:', fcRes.status);
        }
      } catch (fcErr) {
        console.warn('Firecrawl request failed:', fcErr);
      }
    }

    // 2. AI Fallback using Gemini API or Lovable Gateway
    if (aiKey) {
      try {
        const isGoogle = aiKey.startsWith('AIza') || Boolean(
          Deno.env.get('GEMINI_API_KEY') ||
          Deno.env.get('GOOGLE_AI_API_KEY') ||
          Deno.env.get('GOOGLE_API_KEY')
        );

        const endpoint = isGoogle
          ? `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
          : `https://ai.gateway.lovable.dev/v1/chat/completions`;

        const model = isGoogle ? 'gemini-2.0-flash' : 'google/gemini-2.5-flash';

        const prompt = `You are a college and high school scholarship advisor.
Find and list 6 to 10 real, legitimate scholarship opportunities for the following criteria:
Category: ${category}
Location: ${body.location || 'United States'}
School / College: ${body.schoolName || 'N/A'}
Grade Level: ${body.gradeLevel || 'High School / College'}
Keywords: ${body.keywords || 'N/A'}

Return ONLY a valid JSON array of objects with keys:
- "title": (string) Name of the scholarship
- "url": (string) Official or trusted directory application URL (e.g. Fastweb, Bold.org, CollegeBoard BigFuture, or official site)
- "description": (string) 1-2 sentence description including eligibility and estimated award / deadline for 2026.

Do not wrap in markdown code blocks or extra text. Output only the raw JSON array.`;

        const aiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${aiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: 'You output only valid JSON arrays.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3,
          }),
        });

        if (aiRes.ok) {
          const aiJson = await aiRes.json();
          let rawContent = aiJson?.choices?.[0]?.message?.content?.trim() || '';
          rawContent = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
          const parsed = JSON.parse(rawContent);

          if (Array.isArray(parsed) && parsed.length > 0) {
            const scholarships: ScholarshipItem[] = parsed.map((it) => ({
              title: String(it.title || 'Scholarship Opportunity'),
              url: String(it.url || 'https://www.fastweb.com/college-scholarships'),
              description: String(it.description || '').slice(0, 300),
            })).filter((s) => s.url);

            return new Response(JSON.stringify({ scholarships, query }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (aiErr) {
        console.warn('AI scholarship fallback failed:', aiErr);
      }
    }

    // 3. Fallback to curated scholarship resources if neither is configured or both failed
    const defaultScholarships: ScholarshipItem[] = [
      {
        title: 'BigFuture College Board Scholarships (2026)',
        url: 'https://bigfuture.collegeboard.org/pay-for-college/scholarship-search',
        description: 'Over $4 billion in scholarships awarded annually based on GPA, grade level, and college prep milestones with no essay required.',
      },
      {
        title: 'Fastweb National Directory & Matching',
        url: 'https://www.fastweb.com/college-scholarships',
        description: 'Comprehensive directory matching high school and undergraduate students to local, regional, and national funding.',
      },
      {
        title: 'Bold.org Community & High School Scholarships',
        url: 'https://bold.org/scholarships/',
        description: 'Exclusive, zero-fee scholarship opportunities spanning STEM, community service, arts, and first-generation college students.',
      },
      {
        title: 'Scholarships.com Free College Search',
        url: 'https://www.scholarships.com/financial-aid/college-scholarships/scholarship-directory',
        description: 'Filter over 3.7 million college scholarships and grants by grade level, state, athletic ability, and major.',
      },
      {
        title: 'Coca-Cola Scholars Foundation',
        url: 'https://www.coca-colascholarsfoundation.org/apply/',
        description: 'Achievement-based scholarship awarded to graduating high school seniors who demonstrate exemplary leadership and service.',
      },
    ];

    return new Response(JSON.stringify({ scholarships: defaultScholarships, query }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('find-scholarships error', e);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
