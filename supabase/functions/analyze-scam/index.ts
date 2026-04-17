import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, city, mediaUrl } = await req.json();
    if (!title || !description || description.length < 10) {
      return new Response(JSON.stringify({ error: "Provide a title and a description (min 10 chars)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (description.length > 5000) {
      return new Response(JSON.stringify({ error: "Description too long (max 5000)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const system = `You are a legal-aware scam analyst for India. Analyze tourist scam reports and return STRUCTURED JSON via the analyze_scam tool. Be conservative and educational, not prescriptive. Always include the disclaimer that this is informational, not legal advice.`;
    const userPrompt = `Report from ${city || "India"}:
Title: ${title}
Description: ${description}
${mediaUrl ? `Media attached: ${mediaUrl}` : ""}

Analyze and return:
- scam_score (0-100)
- summary (2-3 sentences)
- legal_sections: array of {act, section, description} — IPC, Consumer Protection Act 2019, IT Act 2000 as relevant
- recommended_actions: array of strings (e.g., "File complaint at consumer helpline 1915")
- police_email_subject and police_email_body (formal English email to district police, ready to send)`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_scam",
            description: "Return structured scam analysis",
            parameters: {
              type: "object",
              properties: {
                scam_score: { type: "integer", minimum: 0, maximum: 100 },
                summary: { type: "string" },
                legal_sections: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      act: { type: "string" },
                      section: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["act", "section", "description"],
                  },
                },
                recommended_actions: { type: "array", items: { type: "string" } },
                police_email_subject: { type: "string" },
                police_email_body: { type: "string" },
              },
              required: ["scam_score", "summary", "legal_sections", "recommended_actions", "police_email_subject", "police_email_body"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_scam" } },
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!resp.ok) {
      const txt = await resp.text();
      console.error("AI error", resp.status, txt);
      return new Response(JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No analysis returned" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-scam error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
