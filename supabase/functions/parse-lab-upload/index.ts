// Parse a lab document (PDF or image) using Lovable AI Gateway (Gemini).
// Reads the file from the lab-uploads bucket, extracts text, persists it
// to lab_documents.parsed_text.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  filePath: string;       // e.g. "<userId>/labs/<uuid>.pdf"
  fileName: string;
  mimeType: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing Authorization header" }, 401);
    }

    // Verify caller
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ error: "Not authenticated" }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as RequestBody;
    if (!body.filePath || !body.fileName) {
      return json({ error: "filePath and fileName are required" }, 400);
    }

    // Owner check on file path
    const expectedPrefix = `${userId}/`;
    if (!body.filePath.startsWith(expectedPrefix)) {
      return json({ error: "filePath does not belong to caller" }, 403);
    }

    // Service-role client to download + insert metadata
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: fileData, error: dlErr } = await admin.storage
      .from("lab-uploads")
      .download(body.filePath);
    if (dlErr || !fileData) {
      return json({ error: `Download failed: ${dlErr?.message ?? "unknown"}` }, 500);
    }

    // Convert to base64 for Gemini multimodal input
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = base64Encode(new Uint8Array(arrayBuffer));

    // Determine inline mime
    const mime = body.mimeType || "application/pdf";

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a medical lab report extractor. Extract every measurable lab value from the provided document. " +
              "Output plain text, one biomarker per line, in the format: `Name: value units (reference range, flag)`. " +
              "Include patient demographics if present. Do not invent values. If unreadable, write `[unreadable]`.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Extract all lab values from this report (${body.fileName}).` },
              {
                type: "image_url",
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      if (aiResp.status === 429) return json({ error: "Rate limited — try again shortly." }, 429);
      if (aiResp.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: `AI gateway error: ${errText.slice(0, 200)}` }, 502);
    }

    const aiJson = await aiResp.json();
    const parsedText: string =
      aiJson?.choices?.[0]?.message?.content ?? "[no content extracted]";

    // Persist
    const { data: inserted, error: insErr } = await admin
      .from("lab_documents")
      .insert({
        user_id: userId,
        file_path: body.filePath,
        file_name: body.fileName,
        mime_type: mime,
        parsed_text: parsedText,
      })
      .select()
      .single();

    if (insErr) {
      return json({ error: `DB insert failed: ${insErr.message}` }, 500);
    }

    return json({ id: inserted.id, parsedText });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
