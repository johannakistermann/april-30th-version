// Spec v5.2 §11.3 — Daily Energy Pattern from GEM Body State Engine
import type { BodyState, DailyEnergyPattern } from "./types";
import { rngFor, clamp } from "./seed";

const SLOTS = 96; // 24h × 4 (15-min slots)
const SLEEP_START = 0; // 12am
const SLEEP_END = 28; // ~7am (28 * 15min)

/**
 * Generate a deterministic 24h state stream for a given user.
 * Sleep window is fixed (~midnight to 7am) and dominated by Recovering.
 * Waking hours are weighted toward Flow with bursts of Fired Up.
 */
export function generateDailyPattern(userId: string, hasGem: boolean): DailyEnergyPattern {
  if (!hasGem) {
    // Locked: still produce a "ghost" pattern for UI but mark invalid.
    return { states: [], flowPct: 0, firedUpPct: 0, recoveringPct: 0, sustainedFiredUp: false, subScore: 0 };
  }

  const rng = rngFor(userId, "body-state-v1");
  // User "personality" vector — biases the day toward stressed / balanced / depleted
  const stressLean = rng(); // 0..1, higher = more Fired Up
  const burnoutLean = rng(); // 0..1, higher = more Recovering during waking

  const states: BodyState[] = [];
  for (let i = 0; i < SLOTS; i++) {
    if (i >= SLEEP_START && i < SLEEP_END) {
      // Sleep window — almost entirely Recovering with rare Flow blips
      states.push(rng() < 0.95 ? "recovering" : "flow");
      continue;
    }
    const r = rng();
    // Base waking distribution: 55% flow, 25% fired-up, 20% recovering
    let firedUpThreshold = 0.25 + stressLean * 0.25; // up to 50%
    let recoveringThreshold = 0.20 + burnoutLean * 0.30; // up to 50%
    // Normalise so flow gets the rest
    const total = firedUpThreshold + recoveringThreshold;
    if (total > 0.85) {
      firedUpThreshold *= 0.85 / total;
      recoveringThreshold *= 0.85 / total;
    }
    if (r < firedUpThreshold) states.push("fired-up");
    else if (r < firedUpThreshold + recoveringThreshold) states.push("recovering");
    else states.push("flow");
  }

  // Compute proportions across waking hours only (per spec §11.3.1)
  const wakingStates = states.slice(SLEEP_END);
  const counts = { flow: 0, "fired-up": 0, recovering: 0 } as Record<BodyState, number>;
  for (const s of wakingStates) counts[s]++;
  const total = wakingStates.length;
  const flowPct = (counts.flow / total) * 100;
  const firedUpPct = (counts["fired-up"] / total) * 100;
  const recoveringPct = (counts.recovering / total) * 100;

  // Sustained fired-up: >12 consecutive 15-min slots = >3h
  let runningFired = 0;
  let sustainedFiredUp = false;
  for (const s of wakingStates) {
    if (s === "fired-up") {
      runningFired++;
      if (runningFired > 12) sustainedFiredUp = true;
    } else {
      runningFired = 0;
    }
  }

  // Score per spec §11.3.2
  let score = 100;
  if (flowPct < 30) score -= 20;
  else if (flowPct < 50) score -= 10;

  if (sustainedFiredUp) score -= 15;

  if (recoveringPct > 50) score -= 25;
  else if (recoveringPct >= 30) score -= 10;

  // Sleep recovery bonus: only if score otherwise above 60
  const sleepStates = states.slice(SLEEP_START, SLEEP_END);
  const sleepRecoveringPct = sleepStates.filter(s => s === "recovering").length / sleepStates.length;
  if (sleepRecoveringPct > 0.7 && score > 60) score = Math.min(100, score + 10);

  return {
    states,
    flowPct: Math.round(flowPct),
    firedUpPct: Math.round(firedUpPct),
    recoveringPct: Math.round(recoveringPct),
    sustainedFiredUp,
    subScore: clamp(score),
  };
}
