import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function validateMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) {
    throw new Error('Messages must be an array');
  }

  if (messages.length === 0) {
    throw new Error('Messages array cannot be empty');
  }

  if (messages.length > 20) {
    throw new Error('Too many messages. Maximum 20 allowed.');
  }

  const validatedMessages: ChatMessage[] = [];

  for (const msg of messages) {
    if (typeof msg !== 'object' || msg === null) {
      throw new Error('Each message must be an object');
    }

    const { role, content } = msg as { role?: unknown; content?: unknown };

    if (role !== 'user' && role !== 'assistant') {
      throw new Error('Message role must be "user" or "assistant"');
    }

    if (typeof content !== 'string') {
      throw new Error('Message content must be a string');
    }

    if (content.length === 0) {
      throw new Error('Message content cannot be empty');
    }

    if (content.length > 4000) {
      throw new Error('Message content exceeds maximum length of 4000 characters');
    }

    validatedMessages.push({ role, content });
  }

  return validatedMessages;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    // Parse and validate request body
    const body = await req.json();
    const messages = validateMessages(body.messages);

    const apiKey = 
      Deno.env.get('GEMINI_API_KEY') || 
      Deno.env.get('GOOGLE_AI_API_KEY') || 
      Deno.env.get('GOOGLE_API_KEY') || 
      Deno.env.get('LOVABLE_API_KEY');
    
    if (!apiKey) {
      console.error('No AI API key found in environment');
      return new Response(JSON.stringify({ 
        error: 'AI key not configured. Please set GEMINI_API_KEY or GOOGLE_AI_API_KEY in Supabase Project Settings -> Edge Functions -> Secrets.' 
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

    console.log('Received chat request from user', user.id, 'with', messages.length, 'messages, provider:', isGoogle ? 'google' : 'lovable');

    const systemPrompt = `You are LunchLit's AI Study Buddy - a friendly, encouraging, and knowledgeable assistant designed to help high school and middle school students succeed academically.

Your main capabilities:
1. **Study Tips & Techniques**: Provide evidence-based study strategies like spaced repetition, active recall, the Pomodoro technique, and mind mapping. Adapt tips based on the subject.

2. **Homework Help**: Help students understand concepts and work through problems step-by-step. Don't just give answers - guide them to understand the material. Ask clarifying questions when needed.

3. **Test Planning & Preparation**: Help students create study schedules for upcoming tests. Consider:
   - How many days until the test
   - What topics need to be covered
   - Breaking material into manageable chunks
   - Suggesting review techniques specific to the subject

4. **Subject-Specific Advice**: Provide tailored advice for different subjects:
   - Math: Practice problems, understanding formulas
   - Science: Lab concepts, scientific method
   - English: Essay structure, reading comprehension
   - History: Timeline creation, cause-effect relationships
   - Languages: Vocabulary strategies, grammar practice

5. **Motivation & Encouragement**: Be supportive and encouraging. Recognize effort, celebrate progress, and help students build confidence.

Guidelines:
- Keep responses concise and student-friendly
- Use examples and analogies that relate to their lives
- Be patient and never condescending
- If you don't know something, admit it and suggest resources
- Encourage breaks and self-care alongside studying
- Format responses with bullet points and headers when helpful`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded for user', user.id);
        return new Response(JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response started for user', user.id);
    
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Return 400 for validation errors
    const isValidationError = message.includes('must be') || 
                               message.includes('cannot be') || 
                               message.includes('exceeds') ||
                               message.includes('Too many');
    
    return new Response(JSON.stringify({ error: message }), {
      status: isValidationError ? 400 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
