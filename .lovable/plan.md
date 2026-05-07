## Home page density refinements (v5.4 delta)

All edits live in `src/pages/Home.tsx`. No tokens, routes, or scoring logic change. Existing Information purple (`hsl(270 60% 70%)`), `success` (Voltage/teal), and `destructive` (Resistance/red) tokens carry the new stripe colors.

### 1. Strip down each pillar tile (lines ~195–298)

Inside each of the four pillar tiles, remove:

- the equation-term chip (`<TermChip>`)
- the equation-term word ("Information" / "Voltage" / "Resistance" / "split")
- the `ESTABLISHING` / zone status label

Replace the existing left-edge Recovery split bar (`w-1`) with a unified left-edge stripe pattern applied to **every** tile:

- Control: solid Information purple (`hsl(270 60% 70%)`)
- Energy: solid `bg-success` (Voltage)
- Recovery: top half `bg-success`, bottom half `bg-destructive`, hard transition (keep current split implementation, just standardized to ~3px / `w-[3px]`)
- Stress & NS: solid `bg-destructive` (Resistance)

Also drop the bottom-center Control connector tab (lines 287–293) — the matching purple stripe on the Priorities card below now does that visual job.

Tile interior collapses to:

- Score: large, `font-display font-medium`, `text-foreground` during baseline, `ZONE_TEXT[tk]` after baseline locks
- Pillar short name: smaller, `text-muted-foreground`, beneath the score
- Chevron: stays bottom-right corner
- Whole `<button>` remains the press target with `active:scale-[0.98]` and existing `aria-label`

Tile background tint stays as-is (`ZONE_TILE_BG[tk]`).

### 2. Soften Bioenergetic Priorities sub-cluster scores during baseline (lines ~320–342)

Currently sub-cluster scores always render in `ZONE_TEXT[sZone]`. Make them baseline-aware to match the pillar tiles:

- During `baseline.isEstablishing`: score renders `text-foreground`
- After baseline locks: score reverts to `ZONE_TEXT[sZone]`

Sub-cluster name text and tile chrome unchanged. Locked (`s.locked`) state still shows `—`.

### 3. Add Information-color left stripe to the Bioenergetic Priorities card (lines ~302–344)

Add a 3px-wide vertical stripe along the full left edge of the Priorities card at ~50% opacity of the Information purple. Implementation: relative wrapper + absolutely-positioned `span` with `background: hsl(270 60% 70% / 0.5)`, `aria-hidden`. Card tint and `rounded-t-none` shape unchanged. No `(I)` chip in the header.

### 4. Shorten the Priorities subtitle (line 318)

Change subtitle text from:

> From Control · sub-scores from voice scan, drives your recommendations

To:

> From Control · drives your recommendations

### Out of scope (unchanged)

Vitality hero (gauge, formula subtitle, `I × V / R` chips, baseline callout), "Four Pillars" header, sub-cluster grid layout (stays 2×2), This Week's 5 Infoceuticals, Today's GEM Program, Ask the Coach, Weekly Scan Streak, Find a Practitioner, top/bottom nav, routing, scoring.

### Affordance / a11y preserved

- Whole pillar tile + whole Priorities card + each sub-cluster tile remain `<button>` with `active:scale-[0.98]` and descriptive `aria-label`
- All stripes (pillar left edges, Priorities card left edge) are `aria-hidden="true"` decoration
- `I × V / R` chips under Vitality Score stay non-interactive

### Tradeoff to flag (no code change now)

After this delta, the colored stripes on the pillar tiles rely on the `I × V / R` chips under the Vitality Score as the only equation key. If usability testing shows users miss the link, the lightest fallback is a one-line caption under the "Four Pillars" header — not added pre-emptively.