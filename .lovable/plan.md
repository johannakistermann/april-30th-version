## Apply v5.4 changes to GEM Home page

All changes are surgical edits to `src/pages/Home.tsx`. No new files, no scoring/business logic changes — visual + structural only. Uses existing design tokens (success/warning/destructive/primary, Information purple already in use at line 168).

### 1. Promote Control to a peer pillar — 2×2 grid

Replace the existing 3-column pillar row (lines 188–211) with a 2×2 grid (`grid-cols-2`) of four equal tiles in this order: Control (top-left), Energy (top-right), Recovery (bottom-left), Stress & NS (bottom-right). Above the grid add a small `FOUR PILLARS` uppercase muted label.

All four tiles share one template:

- Score number (top, large)
- Pillar short name
- New equation-term identity row (see §2)
- Status label (zone label or `ESTABLISHING`)
- Bottom-right chevron
- Whole tile is a `button` routing to `/pillar/[id]` with `aria-label`

Recovery keeps its existing left-edge V/R split bar.

### 2. Equation-term identity row inside each tile

Reuses the chip style from the I × V / R chips already at lines 165–174. Non-interactive row sitting between score and status:

- Control: `(I)` purple chip + `Information`
- Energy: `(V)` success chip + `Voltage`
- Recovery: `(V)` success chip + `(R)` destructive chip + word `split`
- Stress & NS: `(R)` destructive chip + `Resistance`

### 3. Soften all four tiles during baseline weeks (1–3 of 4)

When `baseline.isEstablishing` is true:

- Score number rendered in `text-foreground` (not zone color)
- Status label reads `ESTABLISHING` in `text-muted-foreground` (not the green/amber/red zone label)
- Equation chips and pillar name stay full saturation

When baseline is locked, automatically switch back to zone-coloured score + zone label.

### 4. Tile chevron + tap target

Each pillar tile gets a small `ChevronRight` in its bottom-right corner. Whole card is the press target with existing `active:scale-[0.98]` motion. Routes:

- `/pillar/control`, `/pillar/energy`, `/pillar/recovery`, `/pillar/stress-nervous`

(matching existing route convention used elsewhere — `stress-nervous` is the existing pillar id; the brief's `/detect/pillar/stress` is a placeholder.)

### 5. Control tile bottom connector

A small purple (Information color) tab anchored at the bottom edge of the Control tile — small absolutely-positioned div that visually bridges into the Bioenergetic Priorities card directly below. Decorative only.

### 6. Restructure Bioenergetic Priorities card

Replace existing card (lines 213–248). New card sits flush below the 2×2 grid (no top margin, top corners square `rounded-t-none`) with subtle Information-tint background.

Header row:

- `BIOENERGETIC PRIORITIES` (small uppercase)
- Right-aligned `ChevronRight` link → `/pillar/control`

Subtitle:

- `From Control · sub-scores from voice scan, drives your recommendations`

(No `(I)` chip on this header — the visual link comes from the connector tab + tint, not a chip.)

Below: 2×2 grid of four sub-cluster tiles, each tappable, in this fixed order:

1. Detox & Elim. — 87 (success)
2. Digestion — 69 (warning)
3. Vitality & Const. — 93 (success)
4. Immunity — 85 (success)

Each tile routes to `/pillar/control?cluster=[name]` with proper `aria-label`. Score is color-coded by zone; uses existing `controlSubs` data already prepared at lines 97–102.

### 7. Vitality Score subtitle

Already correct at line 163 (`Information × Voltage / Resistance`). No change.

### 8. I × V / R chips under Vitality Score

Already present at lines 165–174. No change — they serve as the equation key the new pillar-tile chips reference.

### 9. Add "what unlocks at week 4" line to baseline callout

Inside the existing baseline pill (lines 175–180), add a second line beneath the existing scan count copy:

`Pillars firm up after 4 weekly scans · acute change detection unlocks at week 4`

Smaller text, same primary color family, slightly muted.

### 10. Update Weekly Scan Streak card

Update lines 343–362:

- Streak label: `{baselineWeek} of 4` (e.g. `1 of 4`) instead of `1 week`
- Helper text: `{4 - baselineWeek} more weekly scans to lock your baseline · next due Sunday.`

### Out of scope (no changes)

TopMenu/BottomNav, greeting + avatar row, Last scan / GEM strip, Today's GEM Program / Today's Protocol card, Ask the Coach card, Find a Practitioner card, empty state.

### Affordance + a11y rules applied

- Every pillar tile and sub-cluster tile: `<button>` with `active:scale-[0.98]`, descriptive `aria-label`
- I × V / R chips and equation-term chips: rendered as plain spans with `aria-hidden="true"` (decoration)
- Connector tab on Control tile: `aria-hidden="true"`

### Note on /home brand pilot

Project memory marks `/home` as the E4L brand pilot (Ivory/Walnut, `.brand-e4l`). The current `Home.tsx` still uses dark-theme tokens and the user's brief explicitly references the dark dummy data (Vitality 35, etc.) — so this plan keeps the existing dark visual layer and only restructures content per v5.4. If the brand pilot should also be re-skinned in this pass, flag it and a follow-up plan can layer that on.