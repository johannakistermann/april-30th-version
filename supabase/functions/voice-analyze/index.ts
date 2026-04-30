import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─────────────────────────────────────────────
// DSP FUNCTIONS — Real signal processing math
// ─────────────────────────────────────────────

/** Convert base64 WAV to Float32 PCM samples + sample rate */
function decodeWav(base64: string): { samples: Float32Array; sampleRate: number } {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const view = new DataView(bytes.buffer);

  // Parse WAV header
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);

  // Find data chunk
  let dataOffset = 44;
  for (let i = 36; i < bytes.length - 8; i++) {
    if (bytes[i] === 0x64 && bytes[i+1] === 0x61 && bytes[i+2] === 0x74 && bytes[i+3] === 0x61) {
      dataOffset = i + 8;
      break;
    }
  }

  const numSamples = Math.floor((bytes.length - dataOffset) / (bitsPerSample / 8) / numChannels);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const offset = dataOffset + i * numChannels * (bitsPerSample / 8);
    if (bitsPerSample === 16) {
      samples[i] = view.getInt16(offset, true) / 32768;
    } else if (bitsPerSample === 32) {
      samples[i] = view.getFloat32(offset, true);
    }
  }

  return { samples, sampleRate };
}

/** Compute F0 using autocorrelation (spec: fundamental frequency, Kidney vitality indicator) */
function computeF0(samples: Float32Array, sampleRate: number): number {
  // Windowed autocorrelation on ~50ms frames, median across frames
  const frameSize = Math.round(sampleRate * 0.05); // 50ms
  const hopSize = Math.round(sampleRate * 0.025);   // 25ms hop
  const minLag = Math.round(sampleRate / 500);      // 500Hz max
  const maxLag = Math.round(sampleRate / 50);       // 50Hz min

  const pitches: number[] = [];

  for (let start = 0; start + frameSize < samples.length; start += hopSize) {
    const frame = samples.slice(start, start + frameSize);

    // Apply Hamming window
    for (let i = 0; i < frame.length; i++) {
      frame[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (frame.length - 1));
    }

    // RMS check — skip silent frames
    let rms = 0;
    for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
    rms = Math.sqrt(rms / frame.length);
    if (rms < 0.01) continue;

    // Autocorrelation
    let bestLag = minLag;
    let bestCorr = -1;
    const r0 = autocorrelation(frame, 0);

    for (let lag = minLag; lag <= Math.min(maxLag, frame.length - 1); lag++) {
      const r = autocorrelation(frame, lag) / r0;
      if (r > bestCorr) {
        bestCorr = r;
        bestLag = lag;
      }
    }

    if (bestCorr > 0.3) {
      pitches.push(sampleRate / bestLag);
    }
  }

  if (pitches.length === 0) return 0;
  pitches.sort((a, b) => a - b);
  return pitches[Math.floor(pitches.length / 2)]; // Median F0
}

function autocorrelation(frame: Float32Array, lag: number): number {
  let sum = 0;
  for (let i = 0; i < frame.length - lag; i++) {
    sum += frame[i] * frame[i + lag];
  }
  return sum;
}

/** Compute Jitter (F0 perturbation) — spec: acute stress indicator */
function computeJitter(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.round(sampleRate * 0.03);
  const hopSize = Math.round(sampleRate * 0.015);
  const minLag = Math.round(sampleRate / 500);
  const maxLag = Math.round(sampleRate / 50);

  const periods: number[] = [];

  for (let start = 0; start + frameSize < samples.length; start += hopSize) {
    const frame = samples.slice(start, start + frameSize);
    let rms = 0;
    for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
    rms = Math.sqrt(rms / frame.length);
    if (rms < 0.01) continue;

    let bestLag = minLag;
    let bestCorr = -1;
    const r0 = autocorrelation(frame, 0);

    for (let lag = minLag; lag <= Math.min(maxLag, frame.length - 1); lag++) {
      const r = autocorrelation(frame, lag) / r0;
      if (r > bestCorr) {
        bestCorr = r;
        bestLag = lag;
      }
    }

    if (bestCorr > 0.3) {
      periods.push(bestLag / sampleRate);
    }
  }

  if (periods.length < 2) return 0;

  // Jitter (local) = average absolute difference between consecutive periods / mean period
  let diffSum = 0;
  for (let i = 1; i < periods.length; i++) {
    diffSum += Math.abs(periods[i] - periods[i - 1]);
  }
  const meanPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
  return (diffSum / (periods.length - 1)) / meanPeriod;
}

/** Compute Shimmer (amplitude perturbation) — spec: fatigue, Lung Qi Def */
function computeShimmer(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.round(sampleRate * 0.03);
  const hopSize = Math.round(sampleRate * 0.015);
  const amplitudes: number[] = [];

  for (let start = 0; start + frameSize < samples.length; start += hopSize) {
    const frame = samples.slice(start, start + frameSize);
    let peak = 0;
    for (let i = 0; i < frame.length; i++) {
      const abs = Math.abs(frame[i]);
      if (abs > peak) peak = abs;
    }
    if (peak > 0.01) amplitudes.push(peak);
  }

  if (amplitudes.length < 2) return 0;

  let diffSum = 0;
  for (let i = 1; i < amplitudes.length; i++) {
    diffSum += Math.abs(amplitudes[i] - amplitudes[i - 1]);
  }
  const mean = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length;
  return (diffSum / (amplitudes.length - 1)) / mean;
}

/** Compute HNR (Harmonics-to-Noise Ratio in dB) — spec: Vagal Tone indicator */
function computeHNR(samples: Float32Array, sampleRate: number): number {
  const frameSize = Math.round(sampleRate * 0.04);
  const minLag = Math.round(sampleRate / 500);
  const maxLag = Math.round(sampleRate / 50);

  // Use middle portion of audio for HNR
  const midStart = Math.max(0, Math.floor(samples.length / 2) - frameSize);
  const frame = samples.slice(midStart, midStart + frameSize);

  let rms = 0;
  for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
  rms = Math.sqrt(rms / frame.length);
  if (rms < 0.01) return 0;

  const r0 = autocorrelation(frame, 0);
  let bestCorr = 0;

  for (let lag = minLag; lag <= Math.min(maxLag, frame.length - 1); lag++) {
    const r = autocorrelation(frame, lag) / r0;
    if (r > bestCorr) bestCorr = r;
  }

  if (bestCorr <= 0 || bestCorr >= 1) return 0;

  // HNR = 10 * log10(r / (1 - r))
  return 10 * Math.log10(bestCorr / (1 - bestCorr));
}

/** Compute Spectral Tilt — spec: exhaustion, Kidney/Lung disconnect */
function computeSpectralTilt(samples: Float32Array, sampleRate: number): number {
  // Simple spectral tilt: ratio of energy in low band vs high band
  const N = 2048;
  const frame = samples.slice(0, Math.min(N, samples.length));
  if (frame.length < N) return 0;

  // Apply Hamming window
  const windowed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    windowed[i] = (frame[i] || 0) * (0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1)));
  }

  // Simple DFT magnitude for key frequency bands
  const lowBandEnd = Math.round((500 / sampleRate) * N);  // 0-500Hz
  const highBandStart = Math.round((2000 / sampleRate) * N); // 2000Hz+
  const highBandEnd = Math.round((4000 / sampleRate) * N);

  let lowEnergy = 0;
  let highEnergy = 0;

  for (let k = 1; k <= lowBandEnd; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += windowed[n] * Math.cos(angle);
      im -= windowed[n] * Math.sin(angle);
    }
    lowEnergy += re * re + im * im;
  }

  for (let k = highBandStart; k <= Math.min(highBandEnd, N / 2); k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      re += windowed[n] * Math.cos(angle);
      im -= windowed[n] * Math.sin(angle);
    }
    highEnergy += re * re + im * im;
  }

  if (highEnergy === 0) return -30; // Very steep tilt
  return 10 * Math.log10(highEnergy / lowEnergy); // Negative = steep tilt = exhaustion
}

/** Compute RMS energy (useful for sentence decay detection) */
function computeRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

/** Compute sentence decay — shimmer increasing over time (Metal/Lung indicator) */
function computeSentenceDecay(samples: Float32Array, sampleRate: number): number {
  const segmentDuration = 2; // 2-second segments
  const segmentSize = sampleRate * segmentDuration;
  const segments = Math.floor(samples.length / segmentSize);
  if (segments < 2) return 0;

  const energies: number[] = [];
  for (let i = 0; i < segments; i++) {
    const seg = samples.slice(i * segmentSize, (i + 1) * segmentSize);
    energies.push(computeRMS(seg));
  }

  // Linear regression slope of energy over time
  const n = energies.length;
  const xMean = (n - 1) / 2;
  const yMean = energies.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (energies[i] - yMean);
    den += (i - xMean) * (i - xMean);
  }

  return den === 0 ? 0 : num / den; // Negative slope = decay
}

// ─────────────────────────────────────────────
// AI ANALYSIS — Gemini for higher-level features
// ─────────────────────────────────────────────

interface DSPResults {
  f0_hz: number;
  jitter: number;
  shimmer: number;
  hnr_db: number;
  spectral_tilt_db: number;
  sentence_decay: number;
  rms_energy: number;
  duration_seconds: number;
}

interface AIAnalysis {
  speech_rate: string;          // "slow" | "normal" | "fast"
  speech_rate_syllables_per_sec: number;
  attack_transient: string;     // "soft" | "normal" | "hard"
  five_element: {
    primary: string;            // Wood/Fire/Earth/Metal/Water
    secondary: string | null;
    confidence: number;
    reasoning: string;
  };
  emotional_valence: number;    // 0-100 (spec: LLM output)
  cognitive_coherence: number;  // 0-100 (spec: LLM output)
  topic_drift: boolean;
  rumination_markers: boolean;
  emotional_summary: string;
  tcm_voice_quality: string;
}

async function runAIAnalysis(
  dspResults: DSPResults,
  transcription: string | null,
  audioBase64: string
): Promise<AIAnalysis> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const systemPrompt = `You are a voice analysis system for THE FIELD health diagnostics app. You analyze voice recordings using both Western bio-acoustics and Traditional Chinese Medicine (TCM) Five Element theory.

You will be given:
1. DSP measurements (F0, Jitter, Shimmer, HNR, Spectral Tilt, Sentence Decay)
2. A transcription of what was said (if available)

Your job is to classify:

## Speech Rate
- Estimate syllables/second from the transcription and duration
- Classify: "slow" (<3 syl/s), "normal" (3-5 syl/s), "fast" (>5 syl/s)
- TCM: Fast = Fire/anxiety, Slow = Cold/Damp/depression

## Attack Transient  
- Based on Jitter and the speech pattern: "soft", "normal", or "hard"
- Hard attacks (staccato, clipped word onsets) = Liver Yang Rising / Wood excess
- High jitter (>0.02) + hard attack = acute stress

## Five Element Voice Classification (TCM)
Map the voice to its dominant element:
- WOOD (Liver): Shouting quality, hard attacks, staccato rhythm, high tension
- FIRE (Heart): Laughing quality, rapid pitch changes, bright/scattered
- EARTH (Spleen): Singing/lilting quality, questioning tone; pathology = flat/monotone
- METAL (Lung): Weeping quality, sentence decay (energy fading through phrases)  
- WATER (Kidney): Groaning quality, deep/low F0, monotonous; thin/frozen = depletion

Key DSP-to-Element mappings:
- High Jitter + Hard Attack → Wood (Liver Qi Stagnation)
- High Speech Rate + Pitch Variance → Fire (Heart Fire if manic)
- Low energy + Flat prosody → Earth (Spleen Qi Deficiency)
- Negative Sentence Decay (energy fading) → Metal (Lung Qi Deficiency)
- Low F0 (<120Hz male, <180Hz female) + Monotonous → Water (Kidney Depletion)
- High Shimmer → Metal/Lung (rough, fading voice)
- Low HNR (<10dB) → reduced Vagal tone

## Emotional/Cognitive Analysis (from transcription)
- Emotional Valence: 0 (very negative) to 100 (very positive)
- Cognitive Coherence: 0 (scattered/confused) to 100 (clear/structured)  
- Topic Drift: Does the person jump between unrelated topics?
- Rumination: Does the person repeat the same worry/theme?

Respond ONLY with valid JSON matching this schema:
{
  "speech_rate": "slow"|"normal"|"fast",
  "speech_rate_syllables_per_sec": number,
  "attack_transient": "soft"|"normal"|"hard",
  "five_element": {
    "primary": "Wood"|"Fire"|"Earth"|"Metal"|"Water",
    "secondary": "Wood"|"Fire"|"Earth"|"Metal"|"Water"|null,
    "confidence": 0-100,
    "reasoning": "string"
  },
  "emotional_valence": 0-100,
  "cognitive_coherence": 0-100,
  "topic_drift": boolean,
  "rumination_markers": boolean,
  "emotional_summary": "string (1-2 sentences)",
  "tcm_voice_quality": "string (e.g. 'Shouting with hard attacks' or 'Singing, slightly flat')"
}`;

  const userContent = `## DSP Measurements
- F0 (fundamental frequency): ${dspResults.f0_hz.toFixed(1)} Hz
- Jitter (F0 perturbation): ${(dspResults.jitter * 100).toFixed(3)}%
- Shimmer (amplitude perturbation): ${(dspResults.shimmer * 100).toFixed(3)}%
- HNR (Harmonics-to-Noise Ratio): ${dspResults.hnr_db.toFixed(1)} dB
- Spectral Tilt: ${dspResults.spectral_tilt_db.toFixed(1)} dB
- Sentence Decay (energy slope): ${dspResults.sentence_decay.toFixed(4)}
- RMS Energy: ${dspResults.rms_energy.toFixed(4)}
- Duration: ${dspResults.duration_seconds.toFixed(1)} seconds

## Transcription
${transcription || "(No transcription available — analyze DSP features only)"}

Analyze and respond with JSON only.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("AI analysis error:", response.status, text);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = (jsonMatch[1] || content).trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    console.error("Failed to parse AI response:", content);
    // Return sensible defaults
    return {
      speech_rate: "normal",
      speech_rate_syllables_per_sec: 4,
      attack_transient: "normal",
      five_element: {
        primary: "Earth",
        secondary: null,
        confidence: 30,
        reasoning: "Could not classify — insufficient data",
      },
      emotional_valence: 50,
      cognitive_coherence: 50,
      topic_drift: false,
      rumination_markers: false,
      emotional_summary: "Analysis inconclusive",
      tcm_voice_quality: "Neutral",
    };
  }
}

// ─────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio_base64, transcription, scan_type } = await req.json();

    if (!audio_base64) {
      return new Response(
        JSON.stringify({ error: "audio_base64 is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Decode WAV and run DSP
    const { samples, sampleRate } = decodeWav(audio_base64);
    const durationSeconds = samples.length / sampleRate;

    console.log(`Processing ${durationSeconds.toFixed(1)}s of audio at ${sampleRate}Hz (${samples.length} samples)`);

    const dspResults: DSPResults = {
      f0_hz: computeF0(samples, sampleRate),
      jitter: computeJitter(samples, sampleRate),
      shimmer: computeShimmer(samples, sampleRate),
      hnr_db: computeHNR(samples, sampleRate),
      spectral_tilt_db: computeSpectralTilt(samples, sampleRate),
      sentence_decay: computeSentenceDecay(samples, sampleRate),
      rms_energy: computeRMS(samples),
      duration_seconds: durationSeconds,
    };

    console.log("DSP results:", JSON.stringify(dspResults));

    // Step 2: AI analysis (speech rate, attack, Five Element, emotional/cognitive)
    const aiAnalysis = await runAIAnalysis(dspResults, transcription || null, audio_base64);

    console.log("AI analysis:", JSON.stringify(aiAnalysis));

    // Step 3: Compute TCM organ signals from voice (per spec Section 18)
    const organSignals = {
      liver: {
        score: computeLiverSignal(dspResults, aiAnalysis),
        markers: [] as string[],
      },
      kidney: {
        score: computeKidneySignal(dspResults, aiAnalysis),
        markers: [] as string[],
      },
      spleen: {
        score: computeSpleenSignal(dspResults, aiAnalysis),
        markers: [] as string[],
      },
      heart: {
        score: computeHeartSignal(dspResults, aiAnalysis),
        markers: [] as string[],
      },
      lung: {
        score: computeLungSignal(dspResults, aiAnalysis),
        markers: [] as string[],
      },
    };

    // Add markers
    if (dspResults.jitter > 0.02) organSignals.liver.markers.push("High jitter — acute stress");
    if (aiAnalysis.attack_transient === "hard") organSignals.liver.markers.push("Hard voice attack — Liver Yang Rising");
    if (dspResults.f0_hz > 0 && dspResults.f0_hz < 130) organSignals.kidney.markers.push("Low F0 — possible Kidney depletion");
    if (aiAnalysis.five_element.primary === "Earth" && aiAnalysis.speech_rate === "slow")
      organSignals.spleen.markers.push("Flat/slow speech — Spleen Qi Deficiency");
    if (aiAnalysis.speech_rate === "fast") organSignals.heart.markers.push("Rapid speech — possible Heart Fire");
    if (dspResults.sentence_decay < -0.005) organSignals.lung.markers.push("Sentence decay — Lung Qi fading");
    if (dspResults.shimmer > 0.1) organSignals.lung.markers.push("High shimmer — vocal fatigue");

    // Step 4: Compute pillar contributions (per spec cross-pillar map)
    const pillarContributions = {
      energy: {
        breath_count_proxy: durationSeconds, // For Mirror Check, use as Mito proxy
      },
      stress: {
        emotional_valence: aiAnalysis.emotional_valence,
        cognitive_coherence: aiAnalysis.cognitive_coherence,
        vagal_tone_hnr: dspResults.hnr_db,
      },
      organs: organSignals,
      metabolic_cv: {
        vagal_secondary: dspResults.hnr_db,
      },
    };

    return new Response(
      JSON.stringify({
        dsp: dspResults,
        ai: aiAnalysis,
        organ_signals: organSignals,
        pillar_contributions: pillarContributions,
        scan_type: scan_type || "mirror_check",
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("voice-analyze error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ─────────────────────────────────────────────
// ORGAN SIGNAL SCORING (spec Section 11, 18)
// ─────────────────────────────────────────────

/** Liver signal: hard voice attack + jitter (spec: Purple tongue sides, Wiry pulse, hard voice attack) */
function computeLiverSignal(dsp: DSPResults, ai: AIAnalysis): number {
  let score = 0;
  if (ai.attack_transient === "hard") score += 40;
  if (ai.attack_transient === "normal") score += 10;
  // Jitter >2% is elevated
  score += Math.min(30, (dsp.jitter / 0.03) * 30);
  // Five Element Wood
  if (ai.five_element.primary === "Wood") score += 20;
  if (ai.five_element.secondary === "Wood") score += 10;
  return Math.min(100, score);
}

/** Kidney signal: low F0, deep/monotonous (spec: Pale tongue root, Deep pulse, low voice F0) */
function computeKidneySignal(dsp: DSPResults, ai: AIAnalysis): number {
  let score = 0;
  // Low F0 (below typical range indicates Water/Kidney)
  if (dsp.f0_hz > 0) {
    if (dsp.f0_hz < 120) score += 40;
    else if (dsp.f0_hz < 150) score += 20;
    else if (dsp.f0_hz < 180) score += 10;
  }
  if (ai.five_element.primary === "Water") score += 30;
  if (ai.five_element.secondary === "Water") score += 15;
  // Deep spectral tilt (lots of low freq energy)
  if (dsp.spectral_tilt_db < -15) score += 20;
  return Math.min(100, score);
}

/** Spleen signal: flat voice, monotone (spec: Thick coating + tooth marks, Soggy pulse, flat voice) */
function computeSpleenSignal(dsp: DSPResults, ai: AIAnalysis): number {
  let score = 0;
  if (ai.five_element.primary === "Earth") score += 30;
  if (ai.five_element.secondary === "Earth") score += 15;
  if (ai.speech_rate === "slow") score += 20;
  // Low energy voice
  if (dsp.rms_energy < 0.02) score += 20;
  return Math.min(100, score);
}

/** Heart signal: scattered speech, rapid (spec: Red tongue tip, Rapid pulse, scattered speech) */
function computeHeartSignal(dsp: DSPResults, ai: AIAnalysis): number {
  let score = 0;
  if (ai.five_element.primary === "Fire") score += 30;
  if (ai.five_element.secondary === "Fire") score += 15;
  if (ai.speech_rate === "fast") score += 25;
  if (ai.topic_drift) score += 20;
  if (ai.cognitive_coherence < 40) score += 15;
  return Math.min(100, score);
}

/** Lung signal: sentence decay, fading voice (spec: Dry tongue front, Weak pulse, sentence decay) */
function computeLungSignal(dsp: DSPResults, ai: AIAnalysis): number {
  let score = 0;
  if (ai.five_element.primary === "Metal") score += 30;
  if (ai.five_element.secondary === "Metal") score += 15;
  if (dsp.sentence_decay < -0.005) score += 30;
  if (dsp.shimmer > 0.1) score += 20;
  return Math.min(100, score);
}
