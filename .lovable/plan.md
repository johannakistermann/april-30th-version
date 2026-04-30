## Phase 2 — Vitality Score & Spec-Accurate Pillar Scoring

Implements spec v5.2 §9A (Vitality formula) and §10–13 (pillar fusion). All inputs are mocked in-app — no DB, no edge functions, no hardware reads. The math is real; the witness values are stubbed but realistic.

### What gets built

**1. New scoring engine module** — `src/lib/scoring/`
- `types.ts` — `WitnessInputs`, `SubScore`, `PillarScore`, `VitalityScore`, `BodyState`, `DailyEnergyPattern`
- `mockWitnesses.ts` — deterministic mock witness values per user (face/voice/tongue/HRV/ED/EI signatures), seeded by user id so the same user sees stable numbers
- `bodyState.ts` — generates a 24h sequence of 96 × 15-min slots with `Fired Up` / `Flow` / `Recovering` states + the 4-adjustment scoring per spec §11.3.2
- `pillars.ts` — implements all four fusion formulas exactly as spec'd:
  - Control = Vitality×0.25 + Digestion×0.30 + Detox×0.25 + Immunity×0.20
  - Energy = Cellular×0.25 + DailyEnergyPattern×0.25 + Vascular×0.20 + Movement×0.15 + Respiratory×0.15
  - Recovery = Sleep×0.45 + OvernightHRV×0.30 + Mito×0.25
  - Stress = Autonomic×0.30 + Vagal×0.20 + Emotional×0.25 + HPA×0.25
- `vitality.ts` — `Voltage = (Energy + Recovery)/2`, `ResistanceEfficiency = Stress/100`, `Vitality = Voltage × ResistanceEfficiency`. Plus zone bands (Green ≥75, Amber 50–74, Red <50) and confidence (Low/Medium/High based on witness coverage)
- `redistribution.ts` — when a sub-score is locked (e.g. no GEM = no Daily Energy Pattern, no Overnight HRV), its weight redistributes proportionally per spec §11.4 / §12.3
- `index.ts` — `useVitality()` hook returning `{ vitality, pillars, control, bodyState, hasScan, scanCount, isStale }`. Reads scan timestamp from localStorage, GEM connection from `useGemConnection()`

**2. Wire it into the UI**
- `src/pages/Home.tsx`
  - Replace hardcoded "Health Score" → "Vitality Score" (line 231)
  - Replace `PILLARS` array (line 18) with values from the hook
  - Show **3-pillar contributors** (Energy, Recovery, Stress) in the main row + **Control as a separate "This Week's Bioenergetic Priorities" tile** per spec §9A.4
- `src/pages/Dashboard.tsx`
  - Same: hero Vitality Score, three-pillar grid for contributors, Control tile alongside (not in grid)
  - Replace mocked `PILLARS` with hook values
  - Show one of the spec's worked examples explanation: "Energy + Recovery × Stress Efficiency"
- `src/pages/PillarDetail.tsx`
  - Drive `score`, `subScores[].score`, `trend`, `confidence`, `zone`, `formula` from the hook
  - Daily Energy Pattern sub-score in Energy shows a small 24h state strip (96 colored ticks: green=Flow, amber=Fired Up, blue=Recovering)
  - Locked sub-scores (when no GEM) show the spec-defined "Connect GEM to unlock" message and the redistributed weights
- `src/components/RewardsProgress.tsx` / Top nav — leave as-is (it's the rewards bar, not a Vitality readout)

**3. Body State Engine UI**
- `src/components/scoring/DailyEnergyStrip.tsx` — renders the 96-tick 24h pattern, with a legend (Fired Up / Flow / Recovering) and proportions
- Used inside the Energy pillar detail view, and a condensed version on Home below the Vitality hero

**4. Confidence & first-scan behavior**
- `scanCount < 4` → display "Scan weekly to establish your baseline (X of 4 scans)" copy in place of the trend arrow
- Confidence label drops to **Medium** without GEM (per spec); shown on each pillar card

### Files touched

| File | Change |
|---|---|
| `src/lib/scoring/*` (NEW) | 7 new files: engine + hook |
| `src/components/scoring/DailyEnergyStrip.tsx` (NEW) | 24h state strip |
| `src/pages/Home.tsx` | "Health Score" → "Vitality Score"; replace PILLARS with hook; pull Control out of grid |
| `src/pages/Dashboard.tsx` | Same wiring; Control as separate tile |
| `src/pages/PillarDetail.tsx` | Drive everything from hook; Daily Energy strip in Energy pillar |

### Reference — formulas exactly per spec

```text
Voltage             = (Energy_Score + Recovery_Score) / 2
ResistanceEfficiency = Stress_Score / 100
Vitality_Score      = Voltage × ResistanceEfficiency           // 0..100

Zones: Green ≥75 · Amber 50-74 · Red <50
```

Spec worked example (spot-check): Energy 85, Recovery 80, Stress 85
→ Voltage 82.5, RE 0.85, **Vitality 70 (Amber-high)** ✓

### What does NOT change in this phase

- Scan flow (Mirror Check + Deep Scan stay as-is — Phase 3)
- Recommendation Engine / Infoceuticals — Phase 4
- Subscription tiers — Phase 5
- Database schema (everything still in localStorage / in-memory)
- Edge functions (no new API calls)
- `BioIdentity`, `Splash`, `GuestResults` (already updated in Phase 1)

### Risks / notes

- The Control pillar moves out of the 4-pillar grid into its own tile. This visually changes Home and Dashboard — the grid becomes 3 cards + 1 distinct Control tile. Spec §9A.4 explicitly requires this layout.
- Mock witness values are seeded by user id so values are stable per user but vary across users — keeps demos coherent.
- When GEM isn't connected, the Daily Energy Pattern sub-score shows as locked (per spec §11.4) — Energy pillar score uses 4 sub-scores instead of 5 with redistributed weights. This is correct, not a bug.
