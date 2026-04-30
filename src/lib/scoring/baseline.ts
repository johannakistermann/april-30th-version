// Spec v5.2 §5 — sliding-scale baseline.
// Scans 1–4 are "Establishing": uncertainty bands wide, confidence reduced.
// Scan 5+ is "Established": full confidence multiplier.

import type { Confidence } from "./types";

export interface Baseline {
  label: string; // "Establishing 2/4" or "Established"
  isEstablishing: boolean;
  confidenceMultiplier: number; // 0..1 — multiplied into pillar confidence labels
  uncertaintyBand: number; // ± points around each score
}

export function getBaseline(scanCount: number): Baseline {
  if (scanCount <= 0) {
    return { label: "No baseline", isEstablishing: true, confidenceMultiplier: 0.4, uncertaintyBand: 12 };
  }
  if (scanCount < 4) {
    const step = scanCount; // 1..3
    return {
      label: `Establishing ${step}/4`,
      isEstablishing: true,
      confidenceMultiplier: 0.5 + step * 0.12, // 0.62, 0.74, 0.86
      uncertaintyBand: 12 - step * 2, // 10, 8, 6
    };
  }
  if (scanCount === 4) {
    return { label: "Establishing 4/4", isEstablishing: true, confidenceMultiplier: 0.95, uncertaintyBand: 5 };
  }
  return { label: "Established", isEstablishing: false, confidenceMultiplier: 1, uncertaintyBand: 4 };
}

export function downgradeConfidence(c: Confidence, baseline: Baseline): Confidence {
  if (!baseline.isEstablishing) return c;
  if (baseline.confidenceMultiplier < 0.65) return "Low";
  if (baseline.confidenceMultiplier < 0.9 && c === "High") return "Medium";
  return c;
}
