# Notable Shift Detail Screen

Replace the placeholder at `src/pages/detect/NotableShift.tsx` (route `/detect/latest/notable-shift`) with a parameterized week-over-week shift narrative. Reuse `glass-card`, `bg-warning`, `bg-success`, `bg-destructive`, `text-primary`, font-display, and the `ActionPill`/`SectionHeader` patterns established in `Dashboard.tsx`.

## Data shape (hardcoded V1, structured for V1.x)

```ts
type ShiftKind = "rec-reshuffle" | "pillar-dip" | "subcluster" | "acute-flag";
type Magnitude = "routine" | "notable" | "acute";
type ShiftRow = { label: string; before: string; after: string; afterTone?: "success" | "warning" | "destructive" | "primary"; note?: string };
type RecRow = { rank: number; before: string; after: string; moved?: "new-top" | "demoted" | "stable" };
```

Single mock object for this week (`rec-reshuffle`, magnitude `routine`):
- headline: "Recovery softened, top focus shifted to your kidneys"
- eyebrow: "WEEK 5 → WEEK 6"
- magnitude callout copy: "A 3-point Recovery dip with one recommendation reshuffle is within normal weekly variation — no need to act differently this week."
- diff rows: Vitality 67 → 72 (success), Recovery 73 → 70 (warning, with sub-note about sleep/HRV), Top recommendation "Liver Driver" → "Kidney Driver" (primary)
- Why section: 2-3 sentences about voice resonance + overnight HRV pointing to NS recovery, closing reassurance "The Liver Driver signal hasn't gone away (it's still #2)."
- Full rec list: 5 positions, W5 → W6, Liver↔Kidney swapped at #1/#2, others stable
- Coach prompt: "Why did Kidney Driver overtake Liver?"

## Layout (top → bottom)

### 1. Back nav bar
Sticky bar matching `CaptureDetail`:
- Left: chevron-left + "Latest scan" → `navigate(-1)` fallback `/dashboard`
- Center: "Notable shift"
- Right: `MoreHorizontal` (no menu wired)

### 2. Headline
- Eyebrow: `WEEK 5 → WEEK 6` (text-[11px] uppercase tracking-wider muted)
- H1: `font-display text-[28px] font-medium leading-tight` — story sentence, not stats

### 3. Shift magnitude indicator
`glass-card p-4`:
- Top row: label `SHIFT MAGNITUDE` (left) + zone pill on right (`ROUTINE` green / `NOTABLE` amber / `ACUTE FLAG` red)
- 3-segment horizontal bar (h-2 rounded-full, gap-1, grid-cols-3): the active segment fills with the zone color at full opacity, inactive at `/15`. Small labels under each segment: `Routine` / `Notable` / `Acute flag` (10px, current bold)
- Body copy underneath (text-sm muted, leading-relaxed)

For `acute-flag`: copy turns to "This change is larger than your usual weekly variation. Worth paying attention to." Pill + active segment use `destructive`.

### 4. What changed (before/after diff)
SectionHeader `WHAT CHANGED`. `glass-card divide-y divide-border overflow-hidden`:

Each row (`p-3`):
- Top line: row label (text-xs muted uppercase tracking-wider, e.g. "Vitality", "Recovery", "Top recommendation")
- Two-column grid (`grid-cols-[1fr_auto_1fr] items-center gap-3`):
  - Left: `WK 5` micro-label + value (text-foreground/60, font-display)
  - Center: `→` arrow (ChevronRight, muted)
  - Right: `WK 6` micro-label + value styled by `afterTone` (e.g. `text-warning` for Recovery, `text-success` for Vitality, `text-primary font-medium` for the new top rec)
- Optional `note` line below (text-xs muted) — Recovery row gets "Sleep quality and overnight HRV both softened slightly. Your other three pillars are stable."

### 5. Why this happened
SectionHeader `WHY THIS HAPPENED`. `glass-card p-4`:
- Small icon (`Sparkles` or `Activity`) in `bg-primary/15`
- 2-3 sentence explanation, last sentence is the reassurance line styled `text-foreground` (others `text-muted-foreground`)

### 6. Full recommendations comparison
SectionHeader `RECOMMENDATIONS · WEEK 5 → WEEK 6` with right action "Latest scan ›" → `/dashboard`.

`glass-card divide-y divide-border overflow-hidden`. 5 rows, each `p-3 flex items-center gap-3`:
- Rank number (`#1`..`#5`, font-display, w-6, muted)
- Two-column rec name diff: before (text-muted-foreground) → after (primary `text-foreground font-medium` for the new #1, muted for stable)
- Right: tiny tag — "NEW #1" (primary pill) on the row that took #1, "↓" muted arrow on the demoted, nothing on stable rows

### 7. Coach prompt
Same compact card pattern as `CaptureDetail`:
- MessageCircle in `bg-primary/15`
- Contextual question text (varies by `kind`)
- ChevronRight
- Tap → `/ai-coach?context=notable-shift-week-6`

Coach prompt copy table (in component constant):
- `rec-reshuffle`: "Why did {newTop} overtake {oldTop}?"
- `pillar-dip`: "Why is {pillar} softer?"
- `subcluster`: "What's driving the {cluster} shift?"
- `acute-flag`: "Should I be worried about this?"

## Affordance / a11y
- Cards/buttons: `role="button"`, `tabIndex={0}`, `aria-label`, `active:scale-[0.98] transition-transform`
- Magnitude bar: `role="img"` with `aria-label="Shift magnitude: routine"`

## Files
- **Edit**: `src/pages/detect/NotableShift.tsx` — replace Placeholder with full implementation. Mock data + types defined inline.
- **No routing changes** — `/detect/latest/notable-shift` already wired.

## Out of scope (per brief)
- Real shift-classification logic (V1 hardcodes `routine` unless an acute flag is present)
- Per-rec drill-in from the comparison list (rows are display-only in V1)
- Wiring the four shift-kind variants to live data — only the `rec-reshuffle` mock renders for V1, but the data shape and conditional styling support all four
