// Mock data — Phase 1 UI only.
// Replace with real 29-candidate signature engine (spec §24) in P5.
import { rngFor, pickInRange } from "@/lib/scoring/seed";

export type WitnessSource = "voice" | "tongue" | "face" | "hrv";

export interface WeeklyRec {
  id: string;
  name: string;
  category: string;
  witnessSource: WitnessSource;
  confidence: "High" | "Medium" | "Low";
  rationale: string;
}

const POOL: Omit<WeeklyRec, "confidence" | "witnessSource" | "rationale">[] = [
  { id: "esr", name: "ESR", category: "Energetic Stress Release" },
  { id: "liver-driver", name: "Liver Driver", category: "Bioenergetic Driver" },
  { id: "source", name: "Source", category: "Foundation" },
  { id: "cell", name: "Cell", category: "Bioenergetic Driver" },
  { id: "ns", name: "Nervous System", category: "Bioenergetic Driver" },
  { id: "heart-driver", name: "Heart Driver", category: "Bioenergetic Driver" },
  { id: "lung", name: "Lung", category: "Bioenergetic Driver" },
  { id: "kidney", name: "Kidney", category: "Bioenergetic Driver" },
  { id: "energy", name: "Energy", category: "Foundation" },
  { id: "mind", name: "Mind", category: "Imprinter" },
];

const RATIONALES: Record<WitnessSource, string[]> = {
  voice: [
    "Voice jitter elevated — vagal tone needs support.",
    "Breath count under 22s — respiratory depletion signature.",
    "Prosody flattened in extended task — emotional regulation flag.",
  ],
  tongue: [
    "Coating thickness suggests digestive stagnation.",
    "Pale margins point to Spleen-qi depletion.",
    "Cracks in centre — yin-fluid deficit pattern.",
  ],
  face: [
    "Liver line + sclera tone flag detox load.",
    "Dark periorbital area — adrenal proxy elevated.",
    "Skin tone shift suggests vascular restriction.",
  ],
  hrv: [
    "Overnight RMSSD trending down — recovery deficit.",
    "LF/HF imbalance — sympathetic dominance signature.",
    "HR recovery slow post-exertion — vagal tone low.",
  ],
};

const SOURCES: WitnessSource[] = ["voice", "tongue", "face", "hrv"];
const CONFIDENCES: WeeklyRec["confidence"][] = ["High", "High", "Medium", "Medium", "Low"];

export function getWeeklyRecs(userId: string): WeeklyRec[] {
  const rng = rngFor(userId, "recommendations");
  const pool = [...POOL];
  const picks: WeeklyRec[] = [];
  for (let i = 0; i < 5 && pool.length; i++) {
    const idx = pickInRange(rng, 0, pool.length - 1);
    const item = pool.splice(idx, 1)[0];
    const witnessSource = SOURCES[pickInRange(rng, 0, SOURCES.length - 1)];
    const confidence = CONFIDENCES[pickInRange(rng, 0, CONFIDENCES.length - 1)];
    const rationales = RATIONALES[witnessSource];
    const rationale = rationales[pickInRange(rng, 0, rationales.length - 1)];
    picks.push({ ...item, witnessSource, confidence, rationale });
  }
  return picks;
}
