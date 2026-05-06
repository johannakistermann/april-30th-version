## Goal

Replace the placeholder `src/pages/detect/VitalityBreakdown.tsx` with a full consumer-readable explanation of how Vitality is computed (Voltage × Resistance Efficiency), with all six sections, drill-throughs to existing routes, and dummy data that math-checks (73 × 0.85 ≈ 62).

## Single-file build

All work lives in `src/pages/detect/VitalityBreakdown.tsx`. No new routes, no new shared components, no design-token additions — uses what's already in `index.css` / Tailwind.

### Color identity mapping (using existing tokens)

| Concept | Token | Notes |
|---|---|---|
| Voltage = teal | `hsl(var(--success))` (the app's green-teal) | Already used for "green zone" — close enough to teal, no new token needed |
| Efficiency = purple | `hsl(var(--secondary))` ramped, plus inline `hsl(270 60% 65%)` for the dot/circle/line | Project has no purple token; keep purple inline only on this screen since it's a one-off explanatory visual key |
| Vitality = amber | `hsl(var(--warning))` | Already the amber zone |
| Coach card | `hsl(var(--info))` | Existing blue accent for the AI Coach card style elsewhere |

### Sections (top → bottom)

1. **Back nav bar** — back arrow + label "Latest scan" → `navigate(-1)` (fallback `/detect/latest`), centered title "Vitality breakdown", overflow `MoreVertical` icon (no menu wired, just an aria button placeholder).

2. **Page header** — uppercase `VITALITY SCORE · WEEK 6`; row with `62` (5xl), `AMBER` chip in warning, right-aligned `▲ +5 vs week 5` in success; body copy paragraph explaining Voltage and Resistance Efficiency.

3. **"How it's computed" formula card** — three circles in a row with `×` and `=` operators between them. Each circle ~64px, colored ring + value. Labels beneath. Math: 73 × 0.85 = 62.05.

4. **Voltage component card** — teal dot + title + value `73`; description; sub-label `FED BY 2 PILLARS`; two clickable rows:
   - Energy 75 (green) → `/detect/pillar/energy`
   - Recovery 70 (amber) → `/detect/pillar/recovery`

5. **Resistance Efficiency component card** — purple dot + title + value `85%`; description; same row pattern:
   - Stress & NS 65 (amber) → `/detect/pillar/stress-nervous`
   - Detox & elimination 58 (amber, sub-cluster note) → `/detect/pillar/control?cluster=detox`

6. **6-week trend** — header with "6-WEEK TREND" + "Open in Trends ›" link → `/detect/trends?series=vitality,voltage,efficiency`. Inline SVG line chart, three series (Vitality solid amber thicker, Voltage thinner teal, Efficiency dashed purple), W6 marker dot on Vitality, x-axis labels W1–W6. Legend row beneath.

7. **Auto-generated insight card** — subtle teal-tinted card with bold heading "What's driving this week's score" and the hardcoded explanation paragraph from the spec.

8. **Coach prompt card** — info-tinted, smaller, chat icon + "Ask Coach about Voltage or Efficiency" + chevron → `/ai-coach?context=vitality-breakdown`.

### Affordance details

- Every clickable card / row: `role="button"`, `tabIndex={0}`, descriptive `aria-label`, `active:scale-[0.98]` press state, `cursor-pointer`.
- Pillar rows: `flex` with name/subtitle on left, score (zone-colored) + chevron on right.
- All values pulled from a single `const data = { … }` object at the top of the file so the demo is easy to retune.

### SVG chart sketch

```text
W1 W2 W3 W4 W5 W6
amber Vitality:    55 58 60 57 57 62  (solid, stroke 2.5)
teal  Voltage:     65 67 70 70 71 73  (solid, stroke 1.5, opacity 0.7)
purple Efficiency: 80 82 83 81 80 85  (dashed, stroke 1.5)
```
Plotted in a ~140px-tall viewBox with a faint horizontal gridline at 50/75/100. W6 dot on amber line, radius 4.

## Out of scope

- No tooltip/onboarding overlay for "Voltage / Resistance Efficiency" first-time terms — flagged in handoff per spec, not built now.
- No real data wiring; the auto-generated insight stays hardcoded.
- No new icons beyond what's already in `lucide-react`.

## Verification

- Tap "Breakdown ›" on `/detect/latest` → lands on `/detect/latest/vitality`.
- Tap each pillar row → routes correctly.
- Tap "Open in Trends ›" → routes with the query string.
- Tap Coach card → routes to `/ai-coach?context=vitality-breakdown`.
- Math: 73 × 0.85 displays as `62`.
