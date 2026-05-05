## Match Home layout to mockup exactly

Restructure `src/pages/Home.tsx` cards to mirror the mockup's proportions, hierarchy, and exact wording. No new data sources.

### Specific changes

**1. Status strip (Last Scan / GEM)**
- Remove the small "LAST SCAN" caption above the value. Show only the relative time ("17 minutes ago") as the primary `text-sm font-medium` value.
- Right tile: replace `"● GEM Connected"` with uppercase `"CONNECTED"` (success color, small caps), and show `"Synced 30m ago"` as the bold primary value below.
- Both tiles taller (`py-3.5`) to match mockup.

**2. Vitality hero**
- Two-column layout: ring left (size unchanged), right column contains:
  - Title `Vitality Score` at `text-base font-display font-medium`.
  - Subtitle `Voltage × Resistance Efficiency` on two lines, `text-xs text-muted-foreground`.
  - Primary-tinted info box (`bg-primary/15 rounded-lg p-2.5`) with text `Your baseline locks after 4 weekly scans (X of 4)` — only when `baseline.isEstablishing`.
- Border stays `border-primary/40`.

**3. Bioenergetic Priorities card**
- Header label uppercase `THIS WEEK'S BIOENERGETIC PRIORITIES` at `text-[11px] tracking-wider`, allowed to wrap to two lines.
- Title row: `Control · 65` + small `AMBER` (zone-coloured) inline.
- Replace inner 2×2 of solid pill cells with bordered cells (`border border-border/60 rounded-lg px-3 py-2.5`), name left-aligned `text-xs`, score right-aligned in zone color, no background fill.

**4. Infoceuticals list**
- Keep current structure but increase row padding to `py-3` and rationale to `text-[11px]` to match the mockup's airier spacing.
- Confidence pill stays as today.

**5. Today's GEM program**
- Make the `Start now` CTA a taller two-line button (wrap text on two lines) using `whitespace-pre-line` with content `"Start\nnow"`, padding `px-4 py-2.5`, to match the mockup's stacked button.

No changes to: greeting, 3 pillar tiles, Ask the Coach card, Weekly streak card, Find a practitioner, or any data hooks.

### File
- `src/pages/Home.tsx` (only file touched)