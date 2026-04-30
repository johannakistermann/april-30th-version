// Spec v5.2 — scoring engine types

export type Zone = "green" | "amber" | "red";
export type Confidence = "Low" | "Medium" | "High";
export type BodyState = "fired-up" | "flow" | "recovering";
export type PillarId = "control" | "energy" | "recovery" | "stress-nervous";

export interface SubScore {
  name: string;
  score: number | null; // null = locked
  weight: number; // 0..1, post-redistribution
  baseWeight: number; // 0..1, as defined in spec
  locked: boolean;
  confidence: Confidence;
  message?: string;
  trend?: "up" | "flat" | "down";
}

export interface PillarScore {
  id: PillarId;
  name: string;
  score: number; // 0..100
  zone: Zone;
  trend: string; // "+3", "-2", "+0"
  confidence: Confidence;
  question: string;
  insight: string;
  formula: string;
  subScores: SubScore[];
}

export interface VitalityScore {
  score: number; // 0..100
  voltage: number; // (Energy + Recovery) / 2
  resistanceEfficiency: number; // Stress / 100
  zone: Zone;
  confidence: Confidence;
  trend: string;
}

export interface DailyEnergyPattern {
  // 96 slots × 15 min = 24h
  states: BodyState[];
  flowPct: number;
  firedUpPct: number;
  recoveringPct: number;
  sustainedFiredUp: boolean;
  subScore: number; // 0..100
}

export interface ScoringContext {
  userId: string; // seed for deterministic mocks
  hasGem: boolean;
  scanCount: number;
  lastScanAt: Date | null;
}
