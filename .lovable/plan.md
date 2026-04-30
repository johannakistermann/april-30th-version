## Phase 3 — Single Weekly Scan Flow

Per spec v5.2 §7–8 and §11 (witness capture), the consumer app should have **one canonical Scan**, taken weekly, that captures all four witnesses (face, voice, tongue, optional HRV from GEM) in a single guided flow. The current app has three separate entry points: Mirror Check (~60s), Deep Scan (~3min), and Guest Scan. Per the new spec, those collapse into:

- **The Weekly Scan** — the canonical capture for the logged-in user. Drives Vitality Score, pillar scores, and the Body State baseline.
- **Guest Scan** — kept as the standalone "party trick" install driver (spec §22). No account required, no save.

Mirror Check and Deep Scan as separate concepts go away.

### What gets built

**1. New unified Scan flow** — `src/pages/Scan.tsx` (NEW)

Single page with a 4-stage stepper, replacing both `MirrorCheck.tsx` and `DeepScan.tsx`:

```text
Prepare ──► Face (15s) ──► Tongue (2 photos) ──► Voice (15s + extended tasks) ──► Submit
```

- **Prepare**: live camera preview, soft tips (light, quiet, frame), single "Start Scan" CTA. Camera + mic permission requested up front (per memory `ux/hardware-access-interaction`).
- **Face capture**: reuses `FaceCapture` / `ScanVideoView`, 15s face video with the egg-shaped guide (per memory `style/scanning-ui`).
- **Tongue capture**: 2 photos, validated through existing `validate-tongue` edge function.
- **Voice capture**: combines the Mirror Check 15s recording with the Deep Scan extended tasks (Sustained Phonation 15s, Breath Count 25s, Rainbow Passage 30s) into one continuous voice block. Validated through existing `validate-voice`.
- Single shared progress bar across all 4 stages (the existing `ScanProgress` 3-step stepper extends to 4).
- Cancel (X) button persistent across all stages (per memory `style/scanning-ui`).

**2. Replace ScanHub with direct entry**

`src/pages/ScanHub.tsx` currently shows 3 cards (Mirror Check, Deep Scan, Guest Scan). Per new spec there is one Scan, so this hub becomes a thin landing:

- Hero card: **"Weekly Scan"** with last-scan timestamp, streak count, and big "Start Scan" CTA → `/scan`.
- Secondary link: **"Guest Scan"** small CTA at the bottom → `/guest-scan` (unchanged).
- If a scan was taken in the last 7 days: show "Next scan available in X days" + "Scan again anyway" link.

**3. Routing changes**

- `/scan` → new unified `Scan.tsx` page (currently routes to `ScanHub`).
- `/scan-hub` → `ScanHub.tsx` (renamed; bottom-nav "Scan" icon now points to `/scan-hub` so users see the weekly card before kicking off).

Actually simpler: keep bottom nav "Scan" → `/scan-hub` (the landing/status page), and `/scan` is the active capture flow. This matches existing memory `features/scanning/progress-stepper` of Prepare → Scan → Results.

- `/mirror-check` → redirect to `/scan` (preserve any external links).
- `/deep-scan` → redirect to `/scan`.

**4. Wire scan completion into the scoring engine**

After successful submit:
- Write `lastScanAt` + increment `scanCount` in localStorage.
- `useVitality()` already reads these — values become "fresh" and confidence label updates from Low → Medium/High per spec.
- Navigate to `/results-loading` → existing results screen.

**5. Cleanup**

- Delete `src/pages/MirrorCheck.tsx` and `src/pages/DeepScan.tsx` after redirects are in place.
- Remove the 3-card array in `ScanHub.tsx`.
- Update memory: `features/scanning/scan-types` becomes "Weekly Scan + Guest Scan" only.

### Files touched

| File | Change |
|---|---|
| `src/pages/Scan.tsx` (NEW) | Unified 4-stage scan flow |
| `src/pages/ScanHub.tsx` | Becomes weekly-scan landing (1 hero card + Guest link) |
| `src/App.tsx` | New `/scan-hub` route, `/scan` → `Scan.tsx`, redirects for old paths |
| `src/components/BottomNav.tsx` | Point "Scan" tab to `/scan-hub` |
| `src/components/ScanProgress.tsx` | Extend to 4 stages |
| `src/pages/MirrorCheck.tsx`, `src/pages/DeepScan.tsx` | Deleted (replaced by redirects) |
| `mem://features/scanning/scan-types` | Updated to reflect single weekly Scan |

### What does NOT change in this phase

- Validation edge functions (`validate-face`, `validate-tongue`, `validate-voice`) — reused as-is.
- `GuestScan.tsx` / `/guest-scan` — kept exactly as-is per spec §22.
- Results screen, scoring engine — already built in Phase 2; this phase just feeds it real timestamps.
- No DB schema (still localStorage; matches Phase 2 decision).

### Out of scope (later phases)

- HRV capture from GEM hardware (Phase 6 — Correct & Protect / hardware integration).
- Two-tier subscription gating (Phase 4 — already deferred).
- Recommendation Engine output beyond what's already shown (Phase 5).

### Open question before I start

The Voice block in the new unified Scan combines short voice (Mirror Check) and the 3 extended tasks (Deep Scan) — that's ~85 seconds of voice alone, making the full Scan ~2 minutes. Do you want:

- **A**: All voice tasks every weekly scan (~2 min total) — most spec-accurate, gives best signal.
- **B**: Short voice (15s) only on weekly scan; extended tasks become an optional "Deep Voice" add-on (~60s total Scan).

I'll default to **A** (spec-accurate) unless you say otherwise.
