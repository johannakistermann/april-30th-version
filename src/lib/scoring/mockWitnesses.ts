// Deterministic mock witness sub-scores per user.
// Matches the spec's pillar sub-score names exactly. Replace with real witness
// pipeline in Phase 3.
import { rngFor, pickInRange } from "./seed";
import type { Signature, Severity } from "./severity";

const SEVERITY_POOL: Severity[] = ["mild", "mild", "mild", "moderate", "moderate", "severe"];

function rollSignatures(
  rng: () => number,
  pillar: Signature["pillarHint"],
  candidates: { id: string; label: string }[],
): Signature[] {
  // Roll 0–2 signatures per pillar deterministically.
  const count = pickInRange(rng, 0, 2);
  const picks: Signature[] = [];
  const pool = [...candidates];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = pickInRange(rng, 0, pool.length - 1);
    const c = pool.splice(idx, 1)[0];
    const sev = SEVERITY_POOL[pickInRange(rng, 0, SEVERITY_POOL.length - 1)];
    picks.push({ id: c.id, label: c.label, severity: sev, pillarHint: pillar });
  }
  return picks;
}

export interface ControlWitnesses {
  vitalityConstitution: number;
  digestionMetabolism: number;
  detoxElimination: number;
  immunityDefence: number;
}

export interface EnergyWitnesses {
  cellular: number;
  vascular: number;
  movement: number;
  respiratory: number;
  // dailyEnergyPattern computed separately from BodyState engine
}

export interface RecoveryWitnesses {
  sleepQuality: number;
  overnightHrv: number; // ignored when locked
  mitochondrialRestoration: number;
}

export interface StressWitnesses {
  autonomicBalance: number;
  vagalTone: number;
  emotionalRegulation: number;
  hpaAxis: number;
}

export function mockWitnesses(userId: string) {
  const rngControl = rngFor(userId, "control");
  const rngEnergy = rngFor(userId, "energy");
  const rngRecovery = rngFor(userId, "recovery");
  const rngStress = rngFor(userId, "stress");

  const control: ControlWitnesses = {
    vitalityConstitution: pickInRange(rngControl, 55, 95),
    digestionMetabolism: pickInRange(rngControl, 50, 90),
    detoxElimination: pickInRange(rngControl, 50, 90),
    immunityDefence: pickInRange(rngControl, 60, 95),
  };

  const energy: EnergyWitnesses = {
    cellular: pickInRange(rngEnergy, 50, 90),
    vascular: pickInRange(rngEnergy, 55, 90),
    movement: pickInRange(rngEnergy, 45, 90),
    respiratory: pickInRange(rngEnergy, 60, 95),
  };

  const recovery: RecoveryWitnesses = {
    sleepQuality: pickInRange(rngRecovery, 50, 90),
    overnightHrv: pickInRange(rngRecovery, 45, 85),
    mitochondrialRestoration: pickInRange(rngRecovery, 50, 85),
  };

  const stress: StressWitnesses = {
    autonomicBalance: pickInRange(rngStress, 55, 90),
    vagalTone: pickInRange(rngStress, 60, 90),
    emotionalRegulation: pickInRange(rngStress, 55, 90),
    hpaAxis: pickInRange(rngStress, 50, 85),
  };

  // Trend deltas (vs previous scan)
  const deltaRng = rngFor(userId, "trend");
  const trends = {
    control: pickInRange(deltaRng, -5, 7),
    energy: pickInRange(deltaRng, -6, 6),
    recovery: pickInRange(deltaRng, -4, 8),
    stress: pickInRange(deltaRng, -5, 7),
    vitality: pickInRange(deltaRng, -5, 7),
  };

  // Mock signatures (spec §6) — used to apply fixed severity deductions.
  const sigRng = rngFor(userId, "signatures");
  const signatures = {
    control: rollSignatures(sigRng, "control", [
      { id: "ED8", label: "ED8 Digestion driver" },
      { id: "ED11", label: "ED11 Liver driver" },
      { id: "ED13", label: "ED13 Immune driver" },
    ]),
    energy: rollSignatures(sigRng, "energy", [
      { id: "ED3", label: "ED3 Cell driver" },
      { id: "ED5", label: "ED5 Vascular driver" },
      { id: "ED7", label: "ED7 Lung driver" },
    ]),
    recovery: rollSignatures(sigRng, "recovery", [
      { id: "ED4", label: "ED4 Nervous system driver" },
      { id: "EI7", label: "EI7 Restless sleep imprint" },
    ]),
    stress: rollSignatures(sigRng, "stress-nervous", [
      { id: "EI4", label: "EI4 Grief imprint" },
      { id: "EI10", label: "EI10 Shock imprint" },
      { id: "ED12", label: "ED12 Adrenal driver" },
    ]),
  };

  return { control, energy, recovery, stress, trends, signatures };
}
