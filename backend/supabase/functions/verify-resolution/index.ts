import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { originalImageUrl, resolutionImageUrl, issueType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        work_done_percentage: 50,
        assessment: "AI verification not available. Manual review required.",
        is_fake: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a civic issue resolution verifier AI. You will receive TWO images:
1. The ORIGINAL complaint image showing a civic issue (${issueType || 'unknown type'})
2. The RESOLUTION image uploaded by the resolver claiming the issue is fixed

Your job is to:
1. Compare both images and determine what percentage of work has been done (0-100%)
2. Check if the resolution image looks fake or manipulated (stock photo, unrelated photo, digitally edited, etc.)
3. Provide a brief assessment of the resolution quality

Be strict but fair:
- 0% = No work done at all, or fake/unrelated image
- 10-30% = Minimal effort, issue largely remains
- 40-60% = Partial fix, some work visible but incomplete
- 70-90% = Good progress, most of the issue addressed
- 100% = Issue fully resolved, area looks clean/repaired

If the resolution image shows the SAME area but fixed, give appropriate credit.
If the resolution image looks fake, unrelated, or like a stock photo, flag it.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Compare these two images. First is the original complaint, second is the claimed resolution. Assess the work done percentage and check for fakery." },
              { type: "image_url", image_url: { url: originalImageUrl } },
              { type: "image_url", image_url: { url: resolutionImageUrl } }
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "verify_resolution",
            description: "Verify a resolution image against the original complaint",
            parameters: {
              type: "object",
              properties: {
                work_done_percentage: {
                  type: "number",
                  description: "Percentage of work completed (0-100)"
                },
                assessment: {
                  type: "string",
                  description: "2-3 sentence assessment of the resolution quality"
                },
                is_fake: {
                  type: "boolean",
                  description: "True if the resolution image appears fake, manipulated, or unrelated"
                },
                fake_reason: {
                  type: "string",
                  description: "Reason why the image is suspected to be fake (if applicable)"
                }
              },
              required: ["work_done_percentage", "assessment", "is_fake"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "verify_resolution" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        work_done_percentage: 50,
        assessment: "AI verification temporarily unavailable.",
        is_fake: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(args), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      work_done_percentage: 50,
      assessment: "Could not determine resolution quality.",
      is_fake: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("verify-resolution error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
