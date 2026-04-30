// Spec v5.2 §6 — fixed-deduction severity model for ED/EI signatures.
// Mild: −3, Moderate: −8, Severe: −15.

export type Severity = "mild" | "moderate" | "severe";

export interface Signature {
  id: string; // e.g. "ED4-Nervous"
  label: string; // human-readable
  severity: Severity;
  pillarHint: "control" | "energy" | "recovery" | "stress-nervous";
}

export const SEVERITY_DEDUCTION: Record<Severity, number> = {
  mild: 3,
  moderate: 8,
  severe: 15,
};

export interface SeverityHit {
  id: string;
  label: string;
  severity: Severity;
  deduction: number;
}

export function applySeverity(
  baseScore: number,
  signatures: Signature[],
): { score: number; hits: SeverityHit[] } {
  const hits: SeverityHit[] = signatures.map((s) => ({
    id: s.id,
    label: s.label,
    severity: s.severity,
    deduction: SEVERITY_DEDUCTION[s.severity],
  }));
  const total = hits.reduce((a, h) => a + h.deduction, 0);
  return { score: Math.max(0, Math.min(100, Math.round(baseScore - total))), hits };
}

// Detect acute event: sub-score drops > 15 vs trend baseline.
export function isAcute(currentScore: number | null, trendBaseline: number): boolean {
  if (currentScore === null) return false;
  return trendBaseline - currentScore > 15;
}
