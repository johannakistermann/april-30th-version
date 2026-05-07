## Add pillar switcher to Control Pillar Detail

The Control Pillar Detail screen (`src/pages/detect/ControlPillarDetail.tsx`) currently has no pillar switcher. The other pillars (Energy / Recovery / Stress) render through `src/pages/PillarDetail.tsx`, which shows a horizontal pill-style switcher with all four pillars (Control, Energy, Recovery, Stress) — tapping a pill navigates to `/pillar/:id`.

### Change

Add the same switcher row to `ControlPillarDetail.tsx`, placed directly under the top nav bar and above the "Vitality Pillar · Week 6" header, so users can jump between pillar detail screens consistently.

- Reuse the same icons (Gauge, Zap, Heart, Brain), labels, ordering, and styling as `PillarDetail.tsx`.
- Mark Control as the active pill (filled primary background).
- Tapping any non-active pill calls `navigate(`/pillar/${id}`)`, matching the existing behavior.
- No business logic changes; purely a presentational addition inside the same file.

### Out of scope

- No changes to `PillarDetail.tsx`.
- No changes to routing or to the rest of the Control screen content.
- No new shared component extraction (kept inline to match the current pattern).