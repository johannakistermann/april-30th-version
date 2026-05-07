## Simplify Vitality breakdown — drop Information, promote Voltage & Resistance

Edit `src/pages/detect/VitalityBreakdown.tsx` and update the Vitality hero subtitle on `src/pages/Dashboard.tsx`. UI/presentation only — no scoring engine changes.

### 1. `src/pages/detect/VitalityBreakdown.tsx`

- **Data**: remove the `information` object from `data`, and drop the `information` series from `data.trend`. Keep `vitality`, `voltage`, `resistance`, pillar rows, and the trend arrays for vitality + voltage.
- **Header description**: rewrite to two factors only — e.g. *"Your Vitality reflects two things: how much energy your body is producing and storing (Voltage), and how much friction it's fighting (Resistance)."*
- **Section 1 — How it's computed**: remove the Information circle and the leading `×` operator. New row reads `Voltage  /  Resistance  =  Vitality` (3 circles + 2 operators). Drop the trailing paragraph about Information modulating ±10%.
- **Section 2 — Information**: delete the entire card (including the two `Constitutional Pattern` and `Cross-Modal Agreement` PillarRows).
- **Section 3 (Voltage)** and **Section 4 (Resistance)**: keep as-is. They are now the two top-level dedicated scores.
- **Section 5 — 6-week trend**: remove the Information dashed path and its legend entry. Keep Vitality (amber, thick) and Voltage (teal). Drop the secondary axis helper `yI` and the `PURPLE` constant if unused. Update the "Open in Trends" link query to `?series=vitality,voltage`.
- **Section 6 — auto insight**: rewrite copy to reference only Voltage and Resistance (no Information multiplier).
- **Section 7 — Coach prompt**: change label/aria to *"Ask Coach about Voltage or Resistance"*.
- Clean up: remove now-unused `PURPLE` constant and any imports that are no longer referenced.

### 2. `src/pages/Dashboard.tsx`

- In the Vitality hero card, replace the italic subtitle `"Information × Voltage / Resistance"` with `"Voltage / Resistance"` so the formula tag matches the new model.

### Out of scope

- No changes to `src/lib/scoring/*` — the underlying `computeVitality` already uses Voltage × Resistance Efficiency and never surfaced Information as a multiplier; this edit just brings the breakdown UI in line with that model.
- No route or navigation changes.
