// Spec v5.2 §10–13 — Pillar fusion formulas.
import type { PillarScore, SubScore, Confidence, Zone, DailyEnergyPattern } from "./types";
import { redistributeWeights, fuseScore } from "./redistribution";
import { mockWitnesses } from "./mockWitnesses";

export function zoneFor(score: number): Zone {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "red";
}

const fmtTrend = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

function buildSub(
  name: string,
  score: number | null,
  baseWeight: number,
  opts: { locked?: boolean; confidence?: Confidence; message?: string; trend?: SubScore["trend"] } = {},
): SubScore {
  return {
    name,
    score,
    baseWeight,
    weight: baseWeight,
    locked: opts.locked ?? false,
    confidence: opts.confidence ?? "Medium",
    message: opts.message,
    trend: opts.trend ?? "flat",
  };
}

export function buildAllPillars(userId: string, hasGem: boolean, dep: DailyEnergyPattern): {
  control: PillarScore; energy: PillarScore; recovery: PillarScore; stress: PillarScore;
} {
  const w = mockWitnesses(userId);

  // ---- Control (spec §10.1–10.2) ----
  const controlSubs = redistributeWeights([
    buildSub("Vitality & Constitution", w.control.vitalityConstitution, 0.25, { confidence: "Medium", message: "From ED1 (Source) + ED2 (Imprinter) signature" }),
    buildSub("Digestion & Metabolism", w.control.digestionMetabolism, 0.30, { confidence: "Medium", message: "ED8 / ED11 / ED15 + tongue coating witness" }),
    buildSub("Detox & Elimination", w.control.detoxElimination, 0.25, { confidence: "Medium", message: "ED11 / ED12 + face liver line witness" }),
    buildSub("Immunity & Defence", w.control.immunityDefence, 0.20, { confidence: "Medium", message: "ED13 / ED14 + tongue coating witness" }),
  ]);
  const controlScore = fuseScore(controlSubs);
  const control: PillarScore = {
    id: "control",
    name: "Control",
    score: controlScore,
    zone: zoneFor(controlScore),
    trend: fmtTrend(w.trends.control),
    confidence: "Medium",
    question: "Which bioenergetic drivers are setting the priorities for your system this week?",
    insight: controlScore >= 75
      ? "Your bioenergetic command layer is steady — drivers are well-coordinated."
      : controlScore >= 50
        ? "Several drivers are flagged — Digestion and Detox lead this week's priorities."
        : "Multiple drivers are distorted — focus on Source-level support and elimination.",
    formula: "Control = (Vitality × 0.25) + (Digestion × 0.30) + (Detox × 0.25) + (Immunity × 0.20)",
    subScores: controlSubs,
  };

  // ---- Energy (spec §11.1–11.2) ----
  const energySubs = redistributeWeights([
    buildSub("Cellular Vitality", w.energy.cellular, 0.25, { confidence: "Medium", message: "Breath count + ED3 (Cell) + ED1 (Source)" }),
    buildSub(
      "Daily Energy Pattern",
      hasGem ? dep.subScore : null,
      0.25,
      hasGem
        ? { confidence: "High", message: `${dep.flowPct}% Flow · ${dep.firedUpPct}% Fired Up · ${dep.recoveringPct}% Recovering` }
        : { locked: true, confidence: "Low", message: "Connect GEM to unlock 24h Body State pattern" },
    ),
    buildSub("Vascular Health", w.energy.vascular, 0.20, { confidence: hasGem ? "High" : "Medium", message: hasGem ? "RHR trend + ED5 + ED6" : "ED5/ED6 + face Frank's sign witness" }),
    buildSub("Movement Capacity", w.energy.movement, 0.15, { confidence: hasGem ? "High" : "Low", message: hasGem ? "GEM accelerometry + ED9" : "ED9 only — connect GEM for active minutes" }),
    buildSub("Respiratory Capacity", w.energy.respiratory, 0.15, { confidence: "Medium", message: "Breath count duration + ED7 (Lung)" }),
  ]);
  const energyScore = fuseScore(energySubs);
  const energy: PillarScore = {
    id: "energy",
    name: "Energy",
    score: energyScore,
    zone: zoneFor(energyScore),
    trend: fmtTrend(w.trends.energy),
    confidence: hasGem ? "High" : "Medium",
    question: "How much functional energy do I have right now to power my day?",
    insight: hasGem
      ? dep.recoveringPct > 50
        ? "Recovering pattern dominates your day — your system is asking for fuel and rest."
        : dep.firedUpPct > 50 || dep.sustainedFiredUp
          ? "Sustained Fired Up state — chronic stress signature detected."
          : "Healthy Flow-dominant day — energy expression is well-paced."
      : "Connect GEM to unlock the Daily Energy Pattern sub-score.",
    formula: "Energy = (Cellular × 0.25) + (Daily Energy Pattern × 0.25) + (Vascular × 0.20) + (Movement × 0.15) + (Respiratory × 0.15)",
    subScores: energySubs,
  };

  // ---- Recovery (spec §12.1–12.2) ----
  const recoverySubs = redistributeWeights([
    buildSub("Sleep Quality", w.recovery.sleepQuality, 0.45, { confidence: hasGem ? "High" : "Medium", message: hasGem ? "Wearable sleep stages + overnight HRV/RHR" : "rPPG morning HR + ED4 + ED1" }),
    buildSub(
      "Overnight HRV",
      hasGem ? w.recovery.overnightHrv : null,
      0.30,
      hasGem
        ? { confidence: "High", message: "RMSSD trend + sleep onset latency" }
        : { locked: true, confidence: "Low", message: "Connect GEM for overnight HRV trend" },
    ),
    buildSub("Mitochondrial Restoration", w.recovery.mitochondrialRestoration, 0.25, { confidence: "Medium", message: "HRV (SDNN) trend + ED3 (Cell) + breath count delta" }),
  ]);
  const recoveryScore = fuseScore(recoverySubs);
  const recovery: PillarScore = {
    id: "recovery",
    name: "Recovery",
    score: recoveryScore,
    zone: zoneFor(recoveryScore),
    trend: fmtTrend(w.trends.recovery),
    confidence: hasGem ? "High" : "Medium",
    question: "How well is my body restoring itself overnight and between exertions?",
    insight: recoveryScore >= 75
      ? "Your overnight restoration is solid — recovery capacity is intact."
      : recoveryScore >= 50
        ? "Sleep quality is reasonable but recovery depth is lagging."
        : "Restoration is shallow — overnight signals point to under-recovery.",
    formula: "Recovery = (Sleep × 0.45) + (Overnight HRV × 0.30) + (Mito Restoration × 0.25)",
    subScores: recoverySubs,
  };

  // ---- Stress & Nervous System (spec §13.1–13.2) ----
  const stressSubs = redistributeWeights([
    buildSub("Autonomic Balance", w.stress.autonomicBalance, 0.30, { confidence: hasGem ? "High" : "Low", message: hasGem ? "LF/HF + RMSSD + diurnal HRV" : "Connect GEM for LF/HF and diurnal HRV" }),
    buildSub("Vagal Tone", w.stress.vagalTone, 0.20, { confidence: "Medium", message: "RMSSD + HR recovery + ED4 (Nervous System)" }),
    buildSub("Emotional Regulation", w.stress.emotionalRegulation, 0.25, { confidence: "Medium", message: "ED4 + ED6 + EI4 (depression/grief) + EI10 (shock)" }),
    buildSub("HPA Axis Proxy", w.stress.hpaAxis, 0.25, { confidence: hasGem ? "High" : "Low", message: hasGem ? "Morning/evening HRV differential + ED12" : "ED12 + face dark under-eye witness" }),
  ]);
  const stressScore = fuseScore(stressSubs);
  const stress: PillarScore = {
    id: "stress-nervous",
    name: "Stress & Nervous System",
    score: stressScore,
    zone: zoneFor(stressScore),
    trend: fmtTrend(w.trends.stress),
    confidence: hasGem ? "High" : "Medium",
    question: "How balanced is my autonomic nervous system, and what's my current stress load?",
    insight: stressScore >= 75
      ? "Autonomic balance is steady — your nervous system has headroom."
      : stressScore >= 50
        ? "Stress load is elevated — vagal tone could use support."
        : "High stress load detected — HPA axis signals depletion.",
    formula: "Stress = (Autonomic × 0.30) + (Vagal × 0.20) + (Emotional × 0.25) + (HPA × 0.25)",
    subScores: stressSubs,
  };

  return { control, energy, recovery, stress };
}
