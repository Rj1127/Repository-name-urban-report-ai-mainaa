import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, imageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({
        detected_issue: "other",
        confidence_score: 0.5,
        description: "AI service not configured.",
        rejected: false,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build multimodal content - use base64 if available, otherwise URL
    const imageContent = imageBase64
      ? { type: "image_url", image_url: { url: imageBase64 } }
      : { type: "image_url", image_url: { url: imageUrl } };

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
            content: `You are a strict civic infrastructure issue detection AI. Your ONLY job is to identify real civic/municipal infrastructure problems in photos.

ACCEPT ONLY these types of images:
- Potholes on roads
- Garbage/waste accumulation on streets or public areas
- Blocked or overflowing drains
- Road damage (cracks, broken roads)
- Waterlogging/flooding on roads or public areas
- Other genuine civic infrastructure issues (broken streetlights, damaged sidewalks, etc.)

REJECT ALL of these:
- Photos of documents, books, papers, text pages
- Selfies, portraits, photos of people
- Food, animals, nature landscapes
- Indoor photos unrelated to civic issues
- Screenshots, memes, random objects
- Any image that does NOT show a civic/municipal infrastructure problem

Be VERY STRICT. If unsure, REJECT the image. Only classify as a civic issue if you can clearly see infrastructure damage or civic problems.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this image. Is it a civic infrastructure issue? If yes, classify it. If no, reject it. Be strict - only accept images showing real civic problems like potholes, garbage, blocked drains, road damage, or waterlogging." },
              imageContent
            ]
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_issue",
            description: "Classify a civic issue from an image or reject irrelevant images",
            parameters: {
              type: "object",
              properties: {
                rejected: {
                  type: "boolean",
                  description: "True if the image does NOT show a civic infrastructure issue"
                },
                rejection_reason: {
                  type: "string",
                  description: "Clear reason why this image was rejected (e.g. 'This appears to be a photo of a book/document, not a civic issue')"
                },
                detected_issue: {
                  type: "string",
                  enum: ["pothole", "garbage", "blocked_drain", "road_damage", "waterlogging", "other"]
                },
                confidence_score: {
                  type: "number",
                  description: "Confidence between 0.0 and 1.0"
                },
                description: {
                  type: "string",
                  description: "1-2 sentence description of the detected civic issue"
                }
              },
              required: ["rejected"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "classify_issue" } },
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
        return new Response(JSON.stringify({ error: "Payment required for AI analysis." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        error: "AI analysis temporarily unavailable. Please try again.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      detected_issue: "other",
      confidence_score: 0.5,
      description: "Could not determine the exact issue type.",
      rejected: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("analyze-image error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
