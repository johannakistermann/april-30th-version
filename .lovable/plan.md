## Promote Voltage & Resistance to standalone scores

Vitality currently renders as one hero with Voltage/Resistance shown as inputs (formula chips, "Voltage / Resistance" subtitle, "How it's computed" circles). The user wants them displayed as separate, dedicated scores alongside Vitality — not as a formula. Information stays removed.

### 1. `src/pages/Home.tsx` — Vitality hero card

- Remove the "Information × Voltage / Resistance" subtitle (line 163) and the I × V / R chip row (lines 164–174).
- Replace the single Vitality circle layout with a 3-up score row:
  - Vitality (current ring + score) on the left, kept as the primary tile.
  - Two compact stat tiles to the right showing **Voltage** (`vitality.voltage`, teal/success accent) and **Resistance** (`100 - Math.round(vitality.resistanceEfficiency * 100)`, destructive accent), each with a small label and the score.
- Keep the trend / "establishing baseline" copy below.
- Whole block remains a single button navigating to `/dashboard`.

### 2. `src/pages/Dashboard.tsx` — Detect hero

- Keep the existing Vitality hero card (lines 138–178) but remove the italic "Voltage / Resistance" subtitle (lines 173–175). Vitality stands alone.
- Insert a new sibling row directly below the Vitality card (above the Notable Shift button) containing two side-by-side score tiles:
  - **Voltage** tile — score from `vitality.voltage`, teal accent, label "Voltage · energy & repair", taps through to `/detect/latest/vitality#voltage`.
  - **Resistance** tile — score `100 - vitality.resistanceEfficiency*100`, destructive accent, label "Resistance · friction & load", taps through to `/detect/latest/vitality#resistance`.
- Source data from `useVitality()` (already imported pattern; if not, add the hook to Dashboard like Home does and replace the hard-coded `62`/`Amber` with `vitality.score` / `vitality.zone` for consistency — minimal change, presentation-only).

### 3. `src/pages/detect/VitalityBreakdown.tsx` — restructure header

- Replace the single Vitality hero header (lines ~headers around line ~display of `data.vitality`) with a 3-up score header: **Vitality**, **Voltage**, **Resistance** as equally-weighted scores, each with its own zone color and value. Vitality keeps the WoW delta chip.
- Demote / remove the "How it's computed" circle row (Voltage / Resistance = Vitality). The three scores at the top now communicate this on their own; no formula UI needed.
- Add `id="voltage"` to the Voltage section card and `id="resistance"` to the Resistance section card so the Dashboard tiles can deep-link.
- Trend chart, auto-insight, and Coach prompt sections stay as-is.

### Out of scope

- No changes to `src/lib/scoring/*`. `vitality.voltage` and `vitality.resistanceEfficiency` are already computed; we're only re-presenting them.
- No routing changes beyond hash anchors.
- No changes to the Four Pillars grid on Home (the `stripe: "info"|"v"|"r"|"split"` accent system stays — it's about pillar contribution, not the Vitality formula).