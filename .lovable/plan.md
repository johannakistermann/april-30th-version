# Detect Hub redesign (/dashboard)

Replace the current `/dashboard` content with a navigation-first hub. Every card is tappable, follows existing design system (`glass-card`, zone colors `success/warning/destructive`, `active:scale-[0.98]` press state, font-display, lucide-react icons). Uses dummy data — no backend wiring.

## 1. Rewrite `src/pages/Dashboard.tsx`

Keep `TopMenu` + `BottomNav`. Remove all current GEM/Vitality/BioAge/Truth/Rewards content. New structure (all sections wrapped in `px-6 mb-4`, max-w mobile):

**Header**
- `h1` "Detect" + subtitle "Tap any card below to dig in"

**Section 1 — Next scan card**
- glass-card, label "NEXT SCAN IN 4 DAYS", date "Sunday, 10 May", "Last scanned 17 minutes ago", primary button "Start scan" → `/scan`

**Section 2 — Latest scan (hero)**
- Section label "YOUR LATEST SCAN"
- glass-card with stronger border (`border-primary/40 glow-primary`), top-right pill "TAP TO OPEN"
- Left: circular Vitality gauge (SVG ring) showing 62, amber color, "Amber" label
- Right: "Week 6 · Sunday", "Vitality Score", delta "▲ +5 vs last week"
- Body: "**Notable shift:** Recovery dipped 3 points · top rec changed Liver → Kidney"
- Footer chips: "capture quality", "all 5 recs", "retakes" prefixed by "Opens"
- Whole card → `/detect/latest`, role=button, aria-label

**Section 3 — Explore by pillar (2x2 grid)**
- Section label "EXPLORE BY PILLAR" + microcopy "Tap any pillar for trends, witnesses, related recs ›"
- 4 tiles `grid-cols-2 gap-3`. Each tile: pillar name, score (zone-colored), inline SVG sparkline (6 points) in zone color, ChevronRight in corner
- Energy 75 green ↑ → `/detect/pillar/energy`
- Recovery 70 amber peak-soft → `/detect/pillar/recovery`
- Stress & NS 65 amber ↑ → `/detect/pillar/stress-nervous`
- Control 68 amber peak-soft → `/detect/pillar/control`

**Section 4 — Explore over time (3 stacked rows)**
- Section label "EXPLORE OVER TIME"
- Each row: full-width glass-card, left icon tile, title + subtitle, right action pill "Open ›"
- Trends (LineChart icon) "Vitality + 4 pillar lines · 6 weeks" → `/detect/trends`
- Scan history (History icon) "All 6 scans · diff view · acute flags" → `/detect/history`
- Recommendation archive (LayoutGrid icon) "What you've been recommended · why" → `/detect/recs`

**Section 5 — Capture quality (2 stacked rows)**
- Section label "CAPTURE QUALITY"
- Row 1 warning state: `border-warning/40` card, AlertTriangle icon in warning bg, title "Last capture" + small "1 WARN" pill, subtitle "Tongue lighting flagged · retake or improve", right pill "Fix ›" in warning style → `/detect/capture/tongue-retake`
- Row 2 standard: GraduationCap icon, "Practice & tutorials", "Get cleaner captures · 5 modality guides", pill "Open ›" → `/detect/practice`

**Section 6 — Coach prompt (footer)**
- Smaller card (`p-3`), accent `border-primary/20 bg-primary/5`, MessageCircle icon, text "Ask Coach about any of the above", pill "Ask ›" → `/ai-coach`

**Affordance details applied to every card:** `active:scale-[0.98]`, ChevronRight or action pill, `role="button"`, `tabIndex={0}`, `aria-label`. Action pills: small rounded-full button with verb + ChevronRight.

## 2. Placeholder destination pages

Create one minimal placeholder component file each, all using `TopMenu` + `BottomNav` + a simple "Coming soon" card with back button to `/dashboard`:

- `src/pages/detect/LatestScan.tsx` → `/detect/latest`
- `src/pages/detect/Trends.tsx` → `/detect/trends`
- `src/pages/detect/ScanHistory.tsx` → `/detect/history`
- `src/pages/detect/RecArchive.tsx` → `/detect/recs`
- `src/pages/detect/Practice.tsx` → `/detect/practice`
- `src/pages/detect/TongueRetake.tsx` → `/detect/capture/tongue-retake`

Pillar tiles reuse existing `/pillar/:pillarId` route (already covers all 4 pillar ids — no new placeholders needed).

## 3. Register routes in `src/App.tsx`

Add 6 protected routes for the new placeholder pages above, mirroring existing `<Protected>` pattern.

## Notes
- All data is hardcoded dummy data inline in `Dashboard.tsx`.
- Sparkline = small inline `<svg>` polyline, no chart lib.
- No DB/auth changes.
