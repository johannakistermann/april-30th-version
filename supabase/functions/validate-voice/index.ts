import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio_base64, duration_seconds, avg_volume } = await req.json();

    if (!audio_base64) {
      return new Response(
        JSON.stringify({ error: "No audio provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client-side volume check already done, but double-check duration
    if (duration_seconds < 5) {
      return new Response(
        JSON.stringify({
          valid: false,
          loud_enough: true,
          is_speech: false,
          message: "Recording too short. Please read the full passage aloud.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (avg_volume < 0.005) {
      return new Response(
        JSON.stringify({
          valid: false,
          loud_enough: false,
          is_speech: false,
          message: "We couldn't hear you. Please speak louder and closer to the microphone.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to verify it's actual speech
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            role: "user",
            content: [
              {
                type: "text",
                text: `You are a voice quality checker. Listen to this audio and determine:
1. "is_speech": boolean — does this contain clear human speech (someone reading aloud)? Not just noise, music, silence, tapping, or random sounds.
2. "loud_enough": boolean — is the speech volume adequate for analysis? Not too quiet or muffled.
3. "message": string — if valid: "Great recording! Clear speech detected." If not speech: "We didn't detect clear speech. Please read the passage out loud." If too quiet: "Your voice is too quiet. Please speak up and try again."

Context: The user should be reading a short passage aloud. Duration: ${duration_seconds.toFixed(1)}s, avg volume level: ${avg_volume.toFixed(4)}.

Respond ONLY with JSON: {"is_speech": true/false, "loud_enough": true/false, "message": "..."}`,
              },
              {
                type: "input_audio",
                input_audio: {
                  data: audio_base64,
                  format: "wav",
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Fall back to client-side checks only — let it pass if volume was ok
      return new Response(
        JSON.stringify({
          valid: avg_volume >= 0.01,
          loud_enough: avg_volume >= 0.01,
          is_speech: true,
          message: avg_volume >= 0.01 ? "Recording accepted." : "Please speak louder.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      console.error("Failed to parse AI response:", content);
      result = null;
    }

    if (!result) {
      // Fallback: accept if volume is reasonable
      result = {
        is_speech: true,
        loud_enough: avg_volume >= 0.01,
        message: "Recording accepted.",
      };
    }

    return new Response(
      JSON.stringify({
        valid: result.is_speech && result.loud_enough,
        ...result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("validate-voice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
