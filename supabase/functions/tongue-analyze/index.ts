import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── System Prompts ─────────────────────────────

const TONGUE_TOP_PROMPT = `You are the tongue diagnostics engine for THE FIELD health app. You perform both TCM zone analysis AND validated AI feature classification per the v3.0 spec.

CRITICAL INSTRUCTION: You MUST analyze the ACTUAL image provided. Do NOT reuse or repeat any previous analysis. Every scan is unique — describe exactly what you see in THIS specific image.

## VISUAL DIFFERENTIATION (MANDATORY)
Before any classification, describe these physical features in detail:
1. **TIP GEOMETRY**: Is the tip pointed/sharp, rounded, flat, or bifurcated? Measure approximate angle.
2. **EDGE PROFILE**: Are edges smooth, scalloped (teeth-marked), or irregular? Count approximate number of scallop indentations visible.
3. **COLOR GRADIENT**: Don't just say "pale" or "pink" — describe the gradient. Is it uniformly pale, pale center with pink edges, pink with red tip, etc.? Note any color variation between zones.
4. **SURFACE TEXTURE**: Smooth, rough, fissured (describe depth/pattern of cracks — central line, branching, transverse), papillae visibility.
5. **COATING DISTRIBUTION**: Is coating uniform or patchy? Thicker in center vs edges? Any areas of peeled/missing coating?
6. **MOISTURE LEVEL**: Dry, normal, wet/glossy, saliva pooling?
7. **TONGUE WIDTH**: Narrow, normal, wide/swollen relative to mouth?
8. **SUBLINGUAL**: If underside visible, describe vein distension and color.

## CAPTURE VALIDATION (Section 23.1)
First assess image quality:
- Flash should be ON (~5500K standardized lighting)
- Tongue should be fully visible and extended
- No food/drink stains visible
- Image taken within ~10 seconds (no venous pooling)

## TCM ZONE MAP (Section 23.2)
Analyze each zone independently:

| Zone | Location | Organ | Key Signals |
|------|----------|-------|-------------|
| Tip | Anterior 15-20% | Heart/Lung | Red/prickles = Heart Fire |
| Sides | Lateral margins | Liver/GB | Purple = Liver Stagnation |
| Centre | Middle third | Spleen/Stomach | Thick coating = Damp |
| Root | Posterior base | Kidney/Bladder | Pale swollen = Kidney Yang Def |

## WHOLE-TONGUE FEATURE ANALYSIS (Section 23.3)
Classify these validated conditions:

| Feature | Condition | Pillar Feed |
|---------|-----------|-------------|
| Healthy pink, thin white film | Normal | Baseline reference |
| White/pale tongue | Iron deficiency / Anaemia | P1: Energy, P4: Microcirculation |
| Bluish-yellow coating | Diabetes indicator | P4: Glycaemic Resilience |
| Purple with thick fatty layer | Cancer flag (PRACTITIONER ALERT) | P2: Inflammatory Load |
| Crimson / deep red | Systemic inflammation | P2: Inflammatory Load |
| Tooth-marked / fissured | Multiple suboptimal states | P2: Spleen burden, P1: Energy depletion |

## TONGUE PERFUSION SCORING (Section 16.3 — Microcirculation Proxy)
Use a continuous 0-100 scale, NOT just band boundaries. Be precise:

| Colour | Score Range | Interpretation |
|--------|------------|---------------|
| Healthy pink-red, moist | 90-100 | Good perfusion |
| Slightly pale OR slightly red | 70-89 | Mild deviation |
| Pale, dry | 50-69 | Moderate perfusion deficit |
| Very pale or purple/dusky | 0-49 | Poor perfusion — stagnation or depletion |

## COATING ANALYSIS
- Thin white: Normal
- Thick white: Cold-Damp
- Yellow: Heat
- Thick yellow: Damp-Heat
- Gray/Black: Severe Cold or Heat
- Peeled/No coating: Yin/Stomach Qi deficiency
- Greasy: Phlegm-Damp

## SHAPE FEATURES
- Swollen: Dampness, Spleen Qi deficiency
- Thin: Blood/Yin deficiency
- Teeth marks (scalloped): Spleen Qi deficiency
- Cracked/fissured: Yin deficiency, chronic heat
- Deviated: Wind, neurological concern

## ALERT RULES
- Cancer flag (purple + thick fatty layer): Output practitioner_alert = true with message "We've detected a tongue pattern associated with serious health conditions in published research. Please discuss with your healthcare provider."
- Anaemia indicator (white/pale): Output anaemia_flag = true with message "Your tongue colour may indicate low iron. A simple blood test can confirm."
- Diabetes indicator (bluish-yellow): Output diabetes_flag = true

Respond ONLY with valid JSON matching this schema:
{
  "image_quality": "good" | "poor" | "unusable",
  "quality_feedback": "string",
  "body_color": {
    "classification": "pale" | "pink" | "red" | "dark_red" | "purple",
    "confidence": 0-100,
    "tcm_indication": "string"
  },
  "shape": {
    "features": ["normal" | "swollen" | "thin" | "teeth_marks" | "cracked" | "fissured" | "stiff" | "deviated"],
    "confidence": 0-100,
    "tcm_indication": "string"
  },
  "coating": {
    "thickness": "none" | "thin" | "thick",
    "color": "white" | "yellow" | "gray" | "black" | "none",
    "texture": "normal" | "greasy" | "peeled" | "dry",
    "confidence": 0-100,
    "tcm_indication": "string"
  },
  "perfusion": {
    "score": 0-100,
    "classification": "good" | "mild_deviation" | "moderate_deficit" | "poor",
    "description": "string"
  },
  "zones": [
    { "name": "Tip (Heart/Lung)", "observation": "string", "status": "normal"|"mild"|"notable", "tcm_indication": "string" },
    { "name": "Sides (Liver/Gallbladder)", "observation": "string", "status": "normal"|"mild"|"notable", "tcm_indication": "string" },
    { "name": "Center (Spleen/Stomach)", "observation": "string", "status": "normal"|"mild"|"notable", "tcm_indication": "string" },
    { "name": "Root (Kidney/Bladder)", "observation": "string", "status": "normal"|"mild"|"notable", "tcm_indication": "string" }
  ],
  "sublingual_veins": {
    "visible": boolean,
    "observation": "string",
    "status": "normal" | "mild" | "notable"
  },
  "validated_conditions": {
    "anaemia_flag": boolean,
    "diabetes_flag": boolean,
    "inflammation_flag": boolean,
    "practitioner_alert": boolean,
    "alert_message": "string | null"
  },
  "overall_pattern": {
    "primary": "string",
    "secondary": "string | null",
    "confidence": 0-100,
    "summary": "string (2-3 sentences plain English)"
  },
  "pillar_contributions": {
    "p1_energy": { "metric": "string", "value": "string", "confidence": "high"|"moderate"|"low" },
    "p2_organs": { "metric": "string", "value": "string", "confidence": "high"|"moderate"|"low" },
    "p4_metabolic": { "metric": "string", "value": "string", "confidence": "high"|"moderate"|"low" }
  },
  "recommendations": ["string array of 3-5 suggestions"]
}`;

const SUBLINGUAL_PROMPT = `You are the sublingual vein diagnostics engine for THE FIELD health app.

CRITICAL: Analyze the ACTUAL underside-of-tongue image provided. This is a SEPARATE image from the top-side tongue photo.

## SUBLINGUAL VEIN ASSESSMENT PROTOCOL

### COLOR CALIBRATION
Before scoring, establish a color baseline:
1. **BACKGROUND REFERENCE**: Note the color of the floor of the mouth (pink/salmon baseline expected)
2. **VEIN COLOR**: Describe the exact hue of the sublingual veins — light blue, blue, dark blue, blue-purple, deep purple, or blackish-purple
3. **CONTRAST RATIO**: How much do veins contrast against surrounding tissue? Low contrast = healthier, high contrast = stagnation

### VEIN MORPHOLOGY — Score each independently (0-100)
1. **DISTENSION**: Diameter of sublingual veins
   - 90-100: Thin, flat veins barely visible
   - 70-89: Mildly visible, slightly raised
   - 50-69: Moderately distended, clearly raised
   - 0-49: Severely engorged, rope-like

2. **BRANCHING**: Extent of small vessel branching off main veins
   - 90-100: No branching visible
   - 70-89: 1-3 small branches
   - 50-69: Multiple branches, web-like pattern forming
   - 0-49: Dense branching network (varicosity)

3. **COLOR_SCORE**: Darkness/stagnation of vein color
   - 90-100: Light blue, healthy
   - 70-89: Medium blue
   - 50-69: Dark blue-purple
   - 0-49: Deep purple/blackish — severe stagnation

4. **SYMMETRY**: Compare left vs right sublingual veins
   - symmetric: Both sides roughly equal
   - asymmetric_left: Left side more prominent
   - asymmetric_right: Right side more prominent

### CLINICAL CORRELATION
Map findings to health pillars:
- Engorged dark veins → Blood stasis → P2: Inflammatory Load, P4: Vascular Health
- Branching varicosities → Chronic circulatory compromise → P4: CV Fitness
- Pale/barely visible veins → Blood deficiency → P1: Energy
- One-sided prominence → Possible localized stagnation → flag for practitioner

Respond ONLY with valid JSON:
{
  "sublingual_quality": "good" | "poor" | "unusable",
  "quality_feedback": "string",
  "color_baseline": {
    "mouth_floor_color": "string (e.g. pale pink, salmon, reddish)",
    "vein_hue": "string (e.g. light blue, dark purple)",
    "contrast_level": "low" | "moderate" | "high"
  },
  "vein_distension": {
    "score": 0-100,
    "description": "string"
  },
  "vein_branching": {
    "score": 0-100,
    "branch_count_estimate": "none" | "few" | "moderate" | "extensive",
    "description": "string"
  },
  "vein_color": {
    "score": 0-100,
    "classification": "healthy_blue" | "medium_blue" | "dark_purple" | "severe_purple",
    "description": "string"
  },
  "symmetry": {
    "status": "symmetric" | "asymmetric_left" | "asymmetric_right",
    "description": "string"
  },
  "composite_score": 0-100,
  "composite_classification": "healthy" | "mild_stagnation" | "moderate_stagnation" | "severe_stagnation",
  "stagnation_pattern": "string (2-3 sentence plain English summary)",
  "practitioner_alert": boolean,
  "alert_message": "string | null",
  "pillar_contributions": {
    "p2_inflammatory": { "metric": "Blood Stasis Index", "value": "string", "confidence": "high"|"moderate"|"low" },
    "p4_vascular": { "metric": "Venous Return Quality", "value": "string", "confidence": "high"|"moderate"|"low" }
  }
}`;

// ─── Helpers ─────────────────────────────────────

function parseJsonFromAI(content: string) {
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = (jsonMatch[1] || content).trim();
  return JSON.parse(jsonStr);
}

async function callAI(apiKey: string, systemPrompt: string, userContent: unknown[]) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw { status: 429, message: "Rate limit exceeded, please try again shortly." };
    if (response.status === 402) throw { status: 402, message: "AI credits exhausted. Please add credits in workspace settings." };
    const text = await response.text();
    console.error("AI analysis error:", response.status, text);
    throw { status: 500, message: `AI analysis failed: ${response.status}` };
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  return parseJsonFromAI(content);
}

// ─── Main Handler ────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image_base64, sublingual_image_base64 } = await req.json();

    if (!image_base64) {
      return new Response(
        JSON.stringify({ error: "image_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // 1. Top-side tongue analysis (always)
    console.log("Starting top-side tongue analysis...");
    const tongueAnalysis = await callAI(LOVABLE_API_KEY, TONGUE_TOP_PROMPT, [
      { type: "text", text: "Analyze this tongue image following the full v3.0 spec protocol. Apply TCM zone mapping, whole-tongue validated AI classification, perfusion scoring, and alert rules. Respond with JSON only." },
      { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
    ]);
    console.log("Top-side analysis complete.");

    // 2. Sublingual vein analysis (if provided)
    let sublingualAnalysis = null;
    if (sublingual_image_base64) {
      console.log("Starting sublingual vein analysis...");
      sublingualAnalysis = await callAI(LOVABLE_API_KEY, SUBLINGUAL_PROMPT, [
        { type: "text", text: "Analyze this sublingual (underside of tongue) image. Assess vein distension, branching, color, and symmetry. Apply color calibration using the mouth floor as baseline. Respond with JSON only." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${sublingual_image_base64}` } },
      ]);
      console.log("Sublingual analysis complete.");

      // Merge sublingual data into main analysis
      tongueAnalysis.sublingual_veins = {
        visible: true,
        observation: sublingualAnalysis.stagnation_pattern || "Sublingual veins assessed from dedicated image.",
        status: sublingualAnalysis.composite_classification === "healthy" ? "normal"
          : sublingualAnalysis.composite_classification === "mild_stagnation" ? "mild"
          : "notable",
      };
      tongueAnalysis.sublingual_detail = sublingualAnalysis;
    }

    return new Response(
      JSON.stringify({
        analysis: tongueAnalysis,
        sublingual_analysis: sublingualAnalysis,
        timestamp: new Date().toISOString(),
        scan_type: sublingual_image_base64 ? "tongue_full_diagnostic" : "tongue_diagnostics",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("Tongue analysis error:", err);
    const status = (err && typeof err === "object" && "status" in err) ? (err as { status: number }).status : 500;
    const message = err instanceof Error ? err.message
      : (err && typeof err === "object" && "message" in err) ? (err as { message: string }).message
      : "Analysis failed";
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
