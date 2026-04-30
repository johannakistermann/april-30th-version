// Spec v5.2 §9A — Vitality = Voltage × Resistance Efficiency.
// Inputs: Energy, Recovery, Stress pillar scores. Control is excluded.
import type { PillarScore, VitalityScore } from "./types";
import { zoneFor } from "./pillars";

export function computeVitality(
  energy: PillarScore,
  recovery: PillarScore,
  stress: PillarScore,
  trendDelta: number,
  hasGem: boolean,
): VitalityScore {
  const voltage = (energy.score + recovery.score) / 2;
  const resistanceEfficiency = Math.max(0, Math.min(1, stress.score / 100));
  const score = Math.max(0, Math.min(100, Math.round(voltage * resistanceEfficiency)));
  return {
    score,
    voltage: Math.round(voltage * 10) / 10,
    resistanceEfficiency: Math.round(resistanceEfficiency * 100) / 100,
    zone: zoneFor(score),
    confidence: hasGem ? "High" : "Medium",
    trend: trendDelta >= 0 ? `+${trendDelta}` : `${trendDelta}`,
  };
}
