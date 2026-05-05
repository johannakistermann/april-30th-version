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

const SOURCES: WitnessSource[] = ["voice", "tongue", "face", "hrv"];
const CONFIDENCES: WeeklyRec["confidence"][] = ["High", "High", "Medium", "Medium", "Low"];
const LABEL: Record<WitnessSource, string> = { voice: "Voice", tongue: "tongue", face: "face", hrv: "HRV" };

function buildRationale(witnesses: WitnessSource[], confidence: WeeklyRec["confidence"]): string {
  // Capitalize first, lowercase rest, joined with " + "
  const names = witnesses.map((w, i) =>
    i === 0 ? LABEL[w].charAt(0).toUpperCase() + LABEL[w].slice(1).toLowerCase() : LABEL[w].toLowerCase()
  );
  const list = names.join(" + ");
  const verb =
    witnesses.length >= 3 ? "flagged" :
    witnesses.length === 2 ? "corroborated" :
    confidence === "High" ? "elevated" : "trending";
  return `${list} ${verb}`;
}

export function getWeeklyRecs(userId: string): WeeklyRec[] {
  const rng = rngFor(userId, "recommendations");
  const pool = [...POOL];
  const picks: WeeklyRec[] = [];
  for (let i = 0; i < 5 && pool.length; i++) {
    const idx = pickInRange(rng, 0, pool.length - 1);
    const item = pool.splice(idx, 1)[0];
    const confidence = CONFIDENCES[pickInRange(rng, 0, CONFIDENCES.length - 1)];
    // 1-3 witnesses, weighted toward 2
    const count = [1, 2, 2, 3][pickInRange(rng, 0, 3)];
    const sources = [...SOURCES];
    const witnesses: WitnessSource[] = [];
    for (let j = 0; j < count && sources.length; j++) {
      witnesses.push(sources.splice(pickInRange(rng, 0, sources.length - 1), 1)[0]);
    }
    const witnessSource = witnesses[0];
    const rationale = buildRationale(witnesses, confidence);
    picks.push({ ...item, witnessSource, confidence, rationale });
  }
  return picks;
}
