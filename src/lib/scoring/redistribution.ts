// Spec v5.2 §9, §11.4, §12.3 — proportional weight redistribution when
// a sub-score is locked (witness unavailable).
import type { SubScore } from "./types";

/**
 * Given an array of sub-scores (some possibly locked), redistribute the
 * locked weights proportionally across remaining unlocked sub-scores so
 * the total remains 1.0. Mutates returned objects.
 */
export function redistributeWeights(subs: SubScore[]): SubScore[] {
  const lockedWeight = subs.filter(s => s.locked).reduce((a, s) => a + s.baseWeight, 0);
  const unlocked = subs.filter(s => !s.locked);
  const unlockedBase = unlocked.reduce((a, s) => a + s.baseWeight, 0);

  return subs.map(s => {
    if (s.locked) return { ...s, weight: 0 };
    if (unlockedBase === 0) return { ...s, weight: 0 };
    const bonus = (s.baseWeight / unlockedBase) * lockedWeight;
    return { ...s, weight: s.baseWeight + bonus };
  });
}

export function fuseScore(subs: SubScore[]): number {
  const usable = subs.filter(s => !s.locked && s.score !== null);
  if (usable.length === 0) return 0;
  const total = usable.reduce((a, s) => a + (s.score as number) * s.weight, 0);
  return Math.round(total);
}
