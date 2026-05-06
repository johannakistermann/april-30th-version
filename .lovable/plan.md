
# Detect > Latest Scan screen

Replace the current `src/pages/detect/LatestScan.tsx` placeholder with a full single-scan breakdown screen, plus add placeholder destinations for every drill-through.

## 1. Rewrite `src/pages/detect/LatestScan.tsx`

Standard layout: `TopMenu` + content + `BottomNav`, dark bg, `pb-24`. All dummy data inline. Reuse `glass-card`, zone colors (`success`/`warning`/`destructive`/`primary`), `font-display`, `active:scale-[0.98]`, lucide icons.

**Back nav bar** (sticky at top of content, below TopMenu)
- Left: ArrowLeft + "Detect" → `navigate('/dashboard')`
- Center: "Latest scan" (font-display, weight 500)
- Right: MoreHorizontal icon (no-op for now)

**Page header**
- Row: "Week 6" (text-2xl, font-medium) | right-aligned "Sun 3 May · 9:42 AM" (text-xs muted)
- Subtitle: "Captured 17 min ago · baseline locked" (text-xs muted)

**Reusable section header pattern** — every section starts with:
- Left: `text-[11px] uppercase tracking-wider text-muted-foreground` label
- Right: small button "{Verb} ›" (text-xs, primary color) — tappable, routes to deeper destination

**Section 1 — Capture quality**
- Header: "CAPTURE QUALITY" / "Details ›" → `/detect/latest/capture`
- 5-col grid (`grid-cols-5 gap-2`), tiles: Voice/Breath/Face/Tongue/GEM. Each tile = small glass square, modality label, status icon (CheckCircle2 success-green; AlertTriangle warning-amber for Tongue)
- Inline warning callout below grid (border-warning/40 bg-warning/5): "Tongue lighting was uneven" + right link "Retake ›" → `/scan/retake/tongue`

**Section 2 — Vitality**
- Header: "VITALITY" / "Breakdown ›" → `/detect/latest/vitality`
- Tappable glass-card → `/detect/latest/vitality`. Two columns:
  - Left: SVG circular gauge (62, amber stroke), "Amber" label below
  - Right: "Vitality Score" (text-xs muted), "▲ +5 vs week 5" (success-green arrow), "Voltage × Resistance Efficiency" (text-[11px] muted italic)

**Section 3 — Pillars**
- Header: "PILLARS" / "Tap any pillar ›" (right text is just microcopy, not a link)
- 2×2 grid (`grid-cols-2 gap-3`). Each tile glass-card with ChevronRight in top-right corner:
  - Top row: pillar name (left) | score (right, zone-colored, font-bold)
  - Bottom row: zone label (left, muted) | delta with arrow (right, green/red)
- Energy 75 Green ▲+2 → `/detect/pillar/energy`
- Recovery 70 Amber ▼−3 → `/detect/pillar/recovery`
- Stress & NS 65 Amber ▲+2 → `/detect/pillar/stress-nervous`
- Control 68 Amber ▼−1 → `/detect/pillar/control`

**Section 4 — Notable shift callout**
- Tappable glass-card with Coach accent (`border-primary/30 bg-primary/5`) → `/detect/latest/notable-shift`
- Inside: header row "NOTABLE SHIFT" (uppercase muted) / "More ›"
- Body: "Recovery dipped 3 points and Liver moved out of your top recommendation — Kidney Driver took its place."

**Section 5 — Your 5 Infoceuticals**
- Header: "YOUR 5 INFOCEUTICALS" / "Tap any rec ›"
- 5 stacked glass-cards (`space-y-2`). Each card:
  - Left: large muted "1." prefix + name (font-medium) on first line, witness summary (text-xs muted) below
  - Right: confidence chip (rounded-full px-2 py-0.5 text-[10px], green/amber bg) + ChevronRight
- Data: Kidney Driver/High, Liver Driver/High, Emotional stress relief/Medium, Heart meridian/Medium, Stomach Driver/Medium
- Each → `/detect/rec/{id}` (slugs: kidney-driver, liver-driver, emotional-stress-relief, heart-meridian, stomach-driver)

**Section 6 — Quick actions**
- Header: "QUICK ACTIONS" (no right link)
- Single grouped glass-card with 3 rows separated by `divide-y divide-border`. Each row: label left, ChevronRight right, full-width tappable, py-3 px-4
- "Compare to last week" → `/detect/history/diff`
- "View on Trends chart" → `/detect/trends?highlight=current`
- "Share with practitioner" → `/share/scan/current`

**Section 7 — Coach prompt**
- Smaller glass-card (`p-3`, `border-primary/20 bg-primary/5`) → `/ai-coach?context=scan-week-6`
- Row: MessageCircle icon + "Ask Coach about this scan" + ChevronRight

**A11y on every tappable card:** `role="button"`, `tabIndex={0}`, `aria-label` describing what + destination, `active:scale-[0.98]` press state.

## 2. New placeholder destination pages

Reuse existing `src/pages/detect/Placeholder.tsx`. Create:

- `src/pages/detect/CaptureDetail.tsx` → `/detect/latest/capture`
- `src/pages/detect/VitalityBreakdown.tsx` → `/detect/latest/vitality`
- `src/pages/detect/NotableShift.tsx` → `/detect/latest/notable-shift`
- `src/pages/detect/RecDetail.tsx` → `/detect/rec/:recId` (reads param, shows name placeholder)
- `src/pages/detect/HistoryDiff.tsx` → `/detect/history/diff`
- `src/pages/scan/RetakeTongue.tsx` → `/scan/retake/tongue`
- `src/pages/share/ShareScan.tsx` → `/share/scan/:scanId`

`/detect/trends` already exists (query param ignored by placeholder). `/ai-coach` already exists (context param ignored). Pillar routes already exist.

## 3. Register routes in `src/App.tsx`

Add 7 new protected routes mirroring existing `<Protected>` pattern.

## Notes

- All dummy data inline in `LatestScan.tsx`.
- Vitality gauge = inline SVG (two `<circle>` elements, stroke-dasharray for progress), no chart lib.
- A future iteration option (not done now): swap order of Notable Shift and Pillars sections if usability testing shows the bottom sections are under-engaged.
- No DB/auth changes.
