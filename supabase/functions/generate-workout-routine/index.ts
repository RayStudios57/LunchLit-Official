import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { goal, age, daysPerWeek, equipment, notes } = await req.json();
    const apiKey = 
      Deno.env.get("GEMINI_API_KEY") || 
      Deno.env.get("GOOGLE_AI_API_KEY") || 
      Deno.env.get("GOOGLE_API_KEY") || 
      Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "AI not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in Supabase secrets." 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isGoogle = apiKey.startsWith("AIza") || Boolean(
      Deno.env.get("GEMINI_API_KEY") || 
      Deno.env.get("GOOGLE_AI_API_KEY") || 
      Deno.env.get("GOOGLE_API_KEY")
    );

    const endpoint = isGoogle 
      ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";

    const model = isGoogle ? "gemini-2.0-flash" : "google/gemini-2.5-flash";

    const prompt = `Create a personalized gym workout routine.
Goal: ${goal || "general fitness"}
Age: ${age || "unknown"}
Days per week available: ${daysPerWeek || 3}
Available equipment / location: ${equipment || "standard gym"}
Extra notes: ${notes || "none"}

Return a single routine for one workout day appropriate for this person. Keep it safe and age-appropriate.`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a certified fitness coach. You create safe, effective, age-appropriate workout routines." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_routine",
              description: "Return a structured workout routine",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Short name for the routine" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        sets: { type: "number" },
                        reps: { type: "string", description: "reps or duration, e.g. '10' or '30 sec'" },
                      },
                      required: ["name", "sets", "reps"],
                    },
                  },
                  tips: { type: "string", description: "1-2 short safety/form tips" },
                },
                required: ["name", "exercises"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_routine" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No routine generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const routine = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ routine }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
