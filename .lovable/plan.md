# Capture Quality Detail Screen

Replace the placeholder at `src/pages/detect/CaptureDetail.tsx` (route `/detect/latest/capture`) with a full per-modality breakdown of the latest scan. Reuse existing design tokens (`glass-card`, `bg-warning`, `bg-success`, `bg-destructive`, `text-muted-foreground`, font-display, ZONE_TEXT) — no new tokens.

## Layout (top → bottom)

### 1. Back nav bar
- Left: chevron-left + "Latest scan" → `navigate(-1)` (falls back to `/dashboard`)
- Center: "Capture quality" (text-sm, semibold)
- Right: `MoreHorizontal` overflow icon (no menu wired in V1)

### 2. Page header
- Eyebrow: `WEEK 6 · CAPTURED 17 MIN AGO` (text-[11px] uppercase tracking-wider muted)
- H1: **"4 of 5 clean"** — `font-display text-[32px] font-medium`
- Body: muted text explaining tongue lighting → Medium confidence on Liver/Stomach Driver recs

### 3. Per-modality breakdown
Section header `PER-MODALITY BREAKDOWN`. Five cards stacked, **warned card first**.

**Warned card (Tongue)** — `glass-card` with amber left-border accent (`border-l-4 border-warning`), larger padding:
- Top row: warning icon container (`bg-warning/15`), "Tongue capture" title + amber "WARNED" pill
- Subtitle: "Lighting was uneven across the tongue surface"
- Nested sub-card (`bg-muted/30 rounded-md p-3`): label `WHAT THIS AFFECTS`, body text with **Pillar 1 Headline Score**, **Liver Driver**, **Stomach Driver** styled `text-foreground font-medium` against muted surrounding text. Hardcoded for V1.
- Two buttons (grid-cols-2 gap-2):
  - "Retake now ›" — primary amber (`bg-warning text-warning-foreground`) → `/scan/retake/tongue`
  - "Tutorial ›" — secondary (`variant="outline"`) → `/detect/practice` (with `?modality=tongue`)

**Four clean cards** — compact rows (`glass-card p-3 flex items-center gap-3`):
- Small green check icon (`bg-success/15`)
- Modality name + green "CLEAN" pill (text-[10px])
- One-line muted subtitle
- ChevronRight on right
- Tap → `/detect/latest/capture/[modality]` (placeholder route, fine if it 404s in V1 — or send to existing CaptureDetail with query param)

Order + subtitles:
1. Voice resonance — "Quiet environment · clear voice signal"
2. Breath capacity — "Full inhale captured · steady exhale"
3. Face sweep — "Even lighting · 8 features detected"
4. GEM HRV — "Continuous overnight tracking · 7h coverage"

### 4. Capture health over time
Section header `CAPTURE HEALTH OVER TIME`. `glass-card`:
- Header row: "Clean captures last 6 weeks" (left) · "28 of 30" (right, `text-success`)
- Bar chart: 6 columns, each = 5 stacked horizontal segments (h-2 rounded-sm). Inline SVG or flex divs. Color per segment: success / warning / destructive.
  - W1, W3, W4, W5 = 5 green
  - W2 = 4 green + 1 amber (tongue)
  - W6 = 4 green + 1 amber (tongue), label highlighted (`text-foreground font-medium`); other labels muted
- Below: insight line — "Tongue lighting flagged in **2 of your last 6 scans** · worth checking your usual scan environment." with that fragment in `text-warning`.

### 5. Practice & tutorials card
Standard nav card (no section label):
- Teal icon (`bg-accent/15`, GraduationCap or BookOpen)
- Title "Practice & tutorials" + subtitle "Get cleaner captures across all 5 modalities"
- Right: blue "Open ›" pill (reuse `ActionPill` pattern from Dashboard) → `/detect/practice`

### 6. Coach prompt
Subtle full-width card (`glass-card` with coach accent border or `bg-primary/5`), smaller:
- MessageCircle icon
- "Should I retake or wait until next week?"
- ChevronRight
- Tap → `/ai-coach?context=capture-quality-week-6`

## Affordance / a11y
- All tappable cards: `role="button"`, `tabIndex={0}`, `aria-label`, `active:scale-[0.98] transition-transform`
- Buttons inside warned card stop propagation so chevron-tap of the parent doesn't fire (parent isn't tappable here — only buttons are)

## Files
- **Edit**: `src/pages/detect/CaptureDetail.tsx` — replace Placeholder with full implementation. All data hardcoded inline (no new lib files).
- **No routing changes** — `/detect/latest/capture` already wired in `App.tsx`.
- Per-modality detail routes (`/detect/latest/capture/[modality]`) are NOT added in this pass — clean cards link to those paths but they'll hit `NotFound`. Acceptable per brief ("placeholder routes are fine for V1"). Can add a single catch-all placeholder if you'd prefer; flag below.

## Out of scope (per brief)
- Image previews of captures
- Dynamic primary-witnesses → recs mapping (hardcoded)
- Per-modality detail pages

## Open question
Add a single placeholder route `/detect/latest/capture/:modality` → `Placeholder` so clean-card taps don't 404? Low effort; recommend yes.
