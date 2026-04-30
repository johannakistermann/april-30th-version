// Deterministic mock witness sub-scores per user.
// Matches the spec's pillar sub-score names exactly. Replace with real witness
// pipeline in Phase 3.
import { rngFor, pickInRange } from "./seed";

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

  return { control, energy, recovery, stress, trends };
}
