# Merge Detect Dashboard with Latest Scan

`/dashboard` (Detect) and `/detect/latest` (Latest Scan) overlap heavily — both show Vitality, the 4 pillars, capture quality, and a coach prompt. This plan consolidates them into a single Detect screen at `/dashboard`, deprecating the separate Latest Scan route.

## New unified Detect page (`/dashboard`)

Replace the current `Dashboard.tsx` body with a merged layout. Order, top → bottom:

1. **Header** — `Detect` title + "Week 6 · Sun 3 May · 9:42 AM · captured 17 min ago" subtitle (from LatestScan's page header, replacing the generic "Tap any card below" copy).

2. **Vitality hero** — Larger version of the current dashboard hero. Keep:
   - Circular gauge (62, Amber)
   - "Week 6", "▲ +5 vs last week"
   - Notable shift one-liner (Recovery dipped 3 · Liver → Kidney)
   - "I × V / R" italic caption (from LatestScan)
   - Tap → `/detect/latest/vitality` (Vitality Breakdown), with a secondary "Notable shift ›" link → `/detect/latest/notable-shift`.

3. **Capture quality strip** — From LatestScan: 5-column Voice/Breath/Face/Tongue/GEM check icons + the warning row ("Tongue lighting was uneven · Retake ›"). Replaces the dashboard's separate "Last capture" card and absorbs its retake CTA. "Details ›" → `/detect/latest/capture`.

4. **Explore by pillar** — Keep the dashboard's 2×2 pillar grid (with sparklines) as the canonical pillar surface. Drop LatestScan's redundant pillar grid (its delta + term-chip data is preserved by adding a small delta indicator under each sparkline; term identity is already conveyed via the Home page stripes and pillar detail screens, so we don't reintroduce term chips here).

5. **Your 5 Infoceuticals** — Port the full recs list from LatestScan (5 rows, witness subtitle, High/Medium confidence chip). Each → `/detect/rec/:id`.

6. **Explore over time** — Keep the dashboard's three rows: Trends, Scan history, Recommendation archive.

7. **Quick actions** — From LatestScan: Compare to last week, View on Trends, Share with practitioner.

8. **Practice & tutorials** — Keep dashboard's row → `/detect/practice`.

9. **Ask Coach** — Single combined coach card → `/ai-coach?context=scan-week-6`.

## Routing changes

- `/detect/latest` → redirect to `/dashboard` (replace `LatestScan` route element with a `<Navigate to="/dashboard" replace />`). The drill-in routes (`/detect/latest/vitality`, `/detect/latest/notable-shift`, `/detect/latest/capture`) stay intact.
- Update the `LatestScan.tsx` file: either delete it and remove the import, or leave a thin redirect component. Plan: delete the file and remove the import from `App.tsx` for cleanliness.
- Anywhere else linking to `/detect/latest` (e.g. the dashboard hero currently navigates there) gets repointed to the appropriate sub-route or stays on `/dashboard`.

## Out of scope

- No changes to `/home`, pillar detail pages, Vitality Breakdown, Notable Shift, Capture Detail, Rec Detail, Trends, History, Recs Archive, or scoring logic.
- No new design tokens; reuse existing `glass-card`, zone colors, typography.

## Technical notes

- Edit `src/pages/Dashboard.tsx` to compose the merged sections (mostly a copy-port of JSX from `LatestScan.tsx` interleaved with existing dashboard sections).
- Edit `src/App.tsx`: remove `LatestScan` import + route, or replace the route's element with `<Navigate to="/dashboard" replace />` from `react-router-dom`.
- Delete `src/pages/detect/LatestScan.tsx`.
- Keep accessibility: every tappable card retains `role="button"`, `aria-label`, `active:scale-[0.98]`.
