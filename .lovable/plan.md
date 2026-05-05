## Home screen alignment

The current `src/pages/Home.tsx` already matches the screenshots structurally (greeting, status strip, vitality hero, 3 pillar tiles, Bioenergetic Priorities, Infoceuticals, GEM program, Ask the Coach, weekly streak, Find a practitioner). Two small deltas remain:

### 1. Bioenergetic Priorities sub-score order
Screenshot shows: **Detox & Elim. · Digestion · Vitality & Const. · Immunity** (left→right, top→bottom).
Current code uses `control.subScores.slice(0, 4)` which yields a different order.

Fix: pick by name in the explicit order above (fall back to first 4 if any missing).

### 2. Recommendation rationale style
Screenshot rationales read like witness corroboration tags:
- "Voice + tongue + face flagged"
- "Voice + face corroborated"

Current `mockRecommendations.ts` writes long sentences ("Voice jitter elevated — vagal tone needs support.") and only ever attaches one witness per rec.

Fix in `src/lib/recommendations/mockRecommendations.ts`:
- Pick 1–3 witness sources per rec (deterministic via existing seeded RNG).
- Build rationale as `"<Witness list> <verb>"` where verb is `flagged | corroborated | elevated | trending` based on count/confidence.
- Keep `witnessSource` (primary) for backwards compatibility; add `witnesses: WitnessSource[]`.
- Home only displays `r.rationale`, so no UI change needed beyond the new string shape.

### 3. Keep "Find a practitioner" wording
Screenshot 2 says "Find an E4L practitioner", but project memory forbids the E4L brand. Keep current "Find a practitioner" copy.

### Files to edit
- `src/pages/Home.tsx` — reorder `controlSubs`.
- `src/lib/recommendations/mockRecommendations.ts` — multi-witness rationale generator.

No backend, no schema, no new routes.