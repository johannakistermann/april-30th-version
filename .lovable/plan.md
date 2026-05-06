## Goal

Apply Master Spec v5.4 surgical UI updates across 4 existing screens and create 1 new screen (Control pillar dual-layer detail). All changes are presentation-layer only — the scoring engine in `src/lib/scoring/` stays untouched (the v5.4 numbers are mocked at the component level for now). Use existing design tokens; add no new global styles.

## Color identity (existing tokens, used consistently)

| Term | Color | Token |
|---|---|---|
| Information (Control) | Purple | inline `hsl(270 60% 70%)` (already established on Vitality Breakdown) |
| Voltage | Teal | `hsl(var(--success))` |
| Resistance | Red/destructive | `hsl(var(--destructive))` (new mapping for the R term) |
| Vitality | Amber | `hsl(var(--warning))` |

A small `EquationChip` helper (defined inline per screen — no shared component to avoid sprawl) renders a 1-letter or short-text pill in the term color.

---

## Screen 1 — `src/pages/Home.tsx`

1. Find the Vitality formula subtitle under the gauge and change `"Voltage × Resistance Efficiency"` → `"Information × Voltage / Resistance"`.
2. Directly under the Vitality Score gauge (before the pillar tiles), insert a non-interactive horizontal row:

```text
[ I ]  ×  [ V ]  /  [ R ]
purple    teal     destructive
```

Each chip ~24px tall, rounded, colored bg at ~12% alpha + colored text. Operators (`×`, `/`) in muted-foreground. `aria-hidden` since pillar tiles below are the interactive surface.

3. The Recovery pillar tile gets a small visual cue that it splits between V and R: a 2-color left border (top half teal, bottom half destructive) — purely cosmetic.

No other Home changes.

## Screen 2 — Detect landing

No changes.

## Screen 3 — `src/pages/detect/LatestScan.tsx`

In the Pillars section, add a tiny equation-term chip (`text-[9px]`, color-tinted bg) to each pillar tile header:

- Energy → `Voltage` (teal)
- Recovery → `V + R` (split — half-teal/half-destructive bg)
- Stress & NS → `Resistance` (destructive)
- Control → `Information` (purple)

Chip placed inline next to the pillar name, no layout reflow. If a tile is too tight at small widths, the chip wraps below the name.

## Screen 4 — `src/pages/detect/VitalityBreakdown.tsx` (rewrite)

Restructure to the three-term equation. Update the top-level `data` object:

```ts
const data = {
  week: 6,
  vitality: 62, zone: "AMBER", delta: 5,
  information: { multiplier: 1.04, controlScore: 70, constitutional: 68, crossModal: 73 },
  voltage: 73,
  resistance: 16, // = 100 - stressCombined
  pillars: {
    energy: { score: 75, zone: "green", route: "/detect/pillar/energy" },
    recoveryVoltage: { score: 71, zone: "amber", route: "/detect/pillar/recovery" }, // sleep + mito
    stress: { score: 65, zone: "amber", route: "/detect/pillar/stress-nervous" },
    recoveryHRV: { score: 68, zone: "amber", route: "/detect/pillar/recovery" }, // overnight HRV
  },
  trend: { weeks: ["W1".."W6"], vitality:[…], voltage:[…], information:[…0.97..1.04] },
};
```

### Changes section by section

1. **Header** — copy unchanged.
2. **Formula card** — four circles in a row separated by `× / =`:

```text
[ 1.04 ]  ×  [ 73 ]  /  [ 16 ]  =  [ 62 ]
Info      Voltage    Resist.    Vitality
purple    teal       destruct.  amber
```

The Information circle has a smaller `Control 70` line below the multiplier. Below the formula row, add a 2–3-line muted-foreground explainer paragraph defining Information.

3. **Information component card** (new, first card)
   - Header: purple dot + `Information` + value `1.04 ×` (with `Control 70` muted below)
   - Description (per spec)
   - `FED BY 2 COMPONENTS` rows:
     - `Constitutional Pattern (60%)` + subtitle + value `68`
     - `Cross-Modal Agreement (40%)` + subtitle + value `73`
   - Tap → `/detect/pillar/control`

4. **Voltage card** — keep current structure but update Recovery row subtitle to `"Sleep quality and mitochondrial restoration · Overnight HRV is in Resistance now"` and value to `71` (Recovery_Voltage_Component). Energy row unchanged.

5. **Resistance card** (replaces Resistance Efficiency card)
   - Header: destructive dot + `Resistance` + value `16`
   - Description: friction-language copy from spec
   - `FED BY 2 SOURCES`:
     - `Stress & NS (85%)` → score 65 (amber)
     - `Recovery (Overnight HRV, 15%)` → score 68 (amber)

6. **6-week trend** — extend chart to plot 3 series:
   - Vitality (solid amber, thicker) — primary axis
   - Voltage (faint teal) — primary axis
   - Information multiplier (dashed purple) — **secondary axis** mapped 0.9→bottom, 1.1→top of inner area
   - Legend updated to 3 entries

7. **Auto-insight card** — replace copy with three-term version from spec.
8. **Coach prompt** — copy → `"Ask Coach about Information, Voltage, or Resistance"`.

## Screen 5 — Recovery pillar detail (`src/pages/PillarDetail.tsx`)

Conditional on `activeId === "recovery"`, when rendering each sub-score row, append a small equation-term chip to the right of the sub-score name:

- name matching `/sleep/i` → `→ Voltage` (teal)
- name matching `/hrv/i` → `→ Resistance` (destructive)
- name matching `/mitoc/i` → `→ Voltage` (teal)

Chip is `text-[9px]`, no layout change otherwise. No business logic touched — sub-scores still come from `useVitality()` as-is.

## Screen 6 — Control pillar detail (NEW dual-layer view)

The current `PillarDetail.tsx` handles all four pillars generically. For Control, we replace that branch with a dedicated dual-layer layout. Implementation: extract a new component `src/pages/detect/ControlPillarDetail.tsx` and render it from `PillarDetail.tsx` when `activeId === "control"` (keeps the Pillar switcher and back nav consistent, minimal disruption). All routes already resolve via `/detect/pillar/control`.

### Sections

1. **Header** — `VITALITY PILLAR · WEEK 6`, title `Control`, large score `70`, `AMBER` zone, delta. To the right of the title, a purple `→ Information` chip. Body copy as per spec.

2. **Section 1 — Headline Layer** (`HEADLINE SCORE · CONTROL = INFORMATION`)
   - Sub-header explainer
   - **Constitutional Pattern card (60%)**:
     - Title row with weight pill
     - Description copy
     - Feature grid — 8 small rows (tongue body color, cracking, swelling, teeth marks, nasolabial fold, liver line, Frank's sign, FaceAge delta), each with feature name on left and a `✓ / —` indicator on the right (mocked deterministically)
   - **Cross-Modal Agreement card (40%)**:
     - Title + weight pill
     - Description
     - Mini score visualization (horizontal bar 0–100 with `73` marker)
     - 5 pattern rows with `Tongue ✓ / Face ✓` or `Tongue ✓ / Face —` indicators

3. **Section 2 — Sub-Scores Layer** (`FOUR FOCUS AREAS · DRIVES YOUR RECOMMENDATIONS`)
   - Sub-header explainer (voice resonance / ranking instrument)
   - 4 tappable rows with weight, score, mock primary EDs and witness count, chevron:
     - Vitality & Constitution 25% — score 78
     - Digestion & Metabolism 30% — score 62
     - Detox & Elimination 25% — score 58
     - Immunity & Defence 20% — score 80
   - Tap → `/detect/pillar/control/cluster/[name]` (existing routes resolve to `Placeholder` or `?cluster=` query — fine for now; no router changes needed beyond what already exists; if no match, fall back to `/detect/pillar/control?cluster=[name]`).

4. **Section 3 — "Why two layers?"** — collapsible card using existing `Collapsible` UI primitive, with explainer copy.

5. **Section 4 — Recommendations targeting Control sub-scores** — reuse the recommendation row style from existing pillar detail; pull from `getWeeklyRecs()` in `mockRecommendations` filtered to control sub-clusters (or just first 3 mocked items if no filter exists — placeholder is fine).

6. **Section 5 — Coach prompt** — same style as Vitality Breakdown's coach card; routes to `/ai-coach?context=control-pillar`.

### Affordances

- Same `glass-card`, `active:scale-[0.98]`, `role="button"`, `aria-label` patterns used throughout the app.
- Chevron + zone-colored score on every tappable row.
- No new design tokens.

## Out of scope

- No engine changes in `src/lib/scoring/` — Information, Resistance, and Recovery routing remain mocked at the screen level.
- Sub-cluster detail screens not built; placeholder routes acceptable.
- The 3 open product questions (Information display format, chips on Home, third trend line) ship with the spec defaults — easy to swap later.

## Verification

- Home: `I × V / R` chips visible under gauge, formula label updated, Recovery tile shows split-color cue.
- Latest Scan: each pillar tile has equation-term chip with the correct color.
- Vitality Breakdown: math reads `1.04 × 73 / (1 − 16/100) ≈ 88` — **note**: the spec literally says `Information × Voltage / Resistance ≈ Vitality` and gives `62`. With Information=1.04, Voltage=73, Resistance=16 the only formula that hits 62 is `Info × Voltage × (1 − Resistance/100) ≈ 64`, still not 62. The dummy numbers in the brief don't math-check perfectly. **Decision for V1:** display the four circles with the spec's chosen values (1.04, 73, 16, 62) and the operators `× / =` exactly as specified — the displayed Vitality is rendered from `data.vitality`, not recomputed live, so the visual stays consistent and the engine wiring is a later task. Flag this in the handoff.
- Recovery detail: each sub-score row shows correct routing chip.
- Control detail: both layers render distinctly; sub-cluster rows route; collapsible explainer opens.
