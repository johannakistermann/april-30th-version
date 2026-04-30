## Multi-bundle implementation pass

Per your instructions:
- **P1**: UI mock only, no backend
- **P2**: Full implementation
- **P3**: UI mock only (for reference/testing)
- **P4**: Full implementation
- **P5**: Skipped
- **P6**: UI only (for UX testing)

---

### P1 — Recommendation Engine (UI mock)

Goal: surface the spec §24 "5 Weekly Infoceuticals" output without building the real 29-candidate signature engine.

**New file `src/lib/recommendations/mockRecommendations.ts`**
- Static list of 8–10 plausible Infoceutical names (e.g. ESR, Liver Driver, Source, Cell, Nervous System, Heart, Lung, Kidney, Energy, Stress).
- `getWeeklyRecs(userId)` → deterministic pick of 5 using existing `rngFor` seed. Each item: `{ id, name, category, witnessSource: "voice"|"tongue"|"face"|"hrv", confidence: "High"|"Medium"|"Low", rationale: string }`.
- Tagged "Mock data — Phase 1 UI" in a code comment.

**New component `src/components/recommendations/WeeklyRecsCard.tsx`**
- Glass-card tile titled **"Your 5 Weekly Infoceuticals"** with a "Mock" pill badge.
- Each row: name, witness chip (color-coded), confidence dot, one-line rationale, a disabled "Add to basket" ghost button (since no shop wiring yet).
- Empty state if no scan yet → "Take a Weekly Scan to unlock recommendations."

**Wire into `Dashboard.tsx`**
- Insert below the GEM strip / above the pillar grid.

No backend, no DB.

---

### P2 — Scoring polish (full implementation)

Goal: bring `src/lib/scoring/` to spec §5–6 fidelity.

**New `src/lib/scoring/baseline.ts`**
- Sliding-scale baseline: `scanCount` 1–4 widens uncertainty bands, narrows from scan 5+. Returns `{ baselineLabel: "Establishing 1/4" | "Established", confidenceMultiplier }`.
- 4-scan "Establishing" badge data exposed via `useVitality()` (already has `baselineRemaining`, just needs label).

**New `src/lib/scoring/severity.ts`**
- `applyEdEiSeverity(subScore, signatures)` — fixed deductions per spec §6: −3 (mild), −8 (moderate), −15 (severe).
- Mock signatures: extend `mockWitnesses.ts` to emit a small `signatures: { id, severity }[]` array per pillar from the seeded RNG.

**Update `vitality.ts` and `pillars.ts`**
- Pipe severity deductions into pillar fusion before zoneFor().
- Vitality formula already correct — just clamp to [0,100] explicitly and surface `voltage`/`resistanceEfficiency` rounded for the dashboard tile.

**UI surface**
- `Dashboard.tsx`: add an "Establishing 2/4" small chip under the Vitality score when `baselineRemaining > 0`.
- `PillarDetail.tsx`: new collapsed "Severity hits this week" row showing the −X deductions transparently.

**Acute flag** (spec §6 "acute event")
- If any sub-score drops >15 vs trend, add `acuteFlag: true` to `SubScore`, render a small amber dot in `PillarDetail.tsx`.

---

### P3 — Subscription / tier UI (UI mock only)

Goal: visual scaffolding for $24 / $97 tiers and Stripe; no real payment, no DB.

**New `src/lib/subscription/mockTier.ts`**
- `useTier()` hook reading `localStorage.getItem("mockTier")` → `"free" | "consumer" | "practitioner"` (default `"consumer"`).
- `setTier(tier)` writes to localStorage and dispatches an event so UI re-renders.

**New page `src/pages/Subscription.tsx`** (route `/subscription`)
- Three pricing cards: Free (Guest scan only), Consumer $24/mo (5 weekly recs, Coach), Practitioner $97/mo (82-pool, client console).
- "Select plan" buttons just call `setTier()` — show a toast "Mock tier change — no payment processed."
- Banner at top: "🧪 Demo billing — Stripe not connected."

**Dev surface**
- `DevGemToggle.tsx`-style floating helper: a small `DevTierToggle` component with 3 buttons to flip tier instantly while testing.
- Tier chip in `Profile.tsx` next to the user name.
- Lock icons in `Dashboard.tsx` Recommendation tile when `tier === "free"` (overlay "Upgrade to see your 5 weekly recs").

**Routing**
- Add `/subscription` to `App.tsx` (protected) and link from `Profile.tsx`.

No Stripe SDK, no edge functions, no DB.

---

### P4 — AI Coach lab upload + reading access (full implementation)

Goal: real PDF/photo upload that Aria can actually read.

**Storage**
- New private Supabase Storage bucket `lab-uploads` with RLS: users can read/write only their own `user_id/...` prefix.
- Migration creates bucket + policies.

**New table `lab_documents`**
```
id uuid pk, user_id uuid not null, file_path text not null,
file_name text, mime_type text, parsed_text text, created_at timestamptz
```
RLS: owner-only select/insert/delete.

**New edge function `supabase/functions/parse-lab-upload/index.ts`**
- Accepts `{ filePath }`, downloads from storage, extracts text:
  - PDF → use `pdf-parse` style extraction via Deno-compatible lib, OR send the file bytes directly to Lovable AI Gateway (`google/gemini-2.5-pro`) with a "extract all lab values as plain text" prompt — preferred since it handles photos too.
- Writes `parsed_text` back to `lab_documents`.
- Returns `{ id, parsed_text }`.

**UI in `AICoach.tsx`**
- Paperclip button next to the input. Opens file picker (`accept=".pdf,image/*"`).
- Upload → call `parse-lab-upload` → on success, prepend a system-style assistant message: *"I've read your lab report (Vit D 18 ng/mL, Ferritin 22…). Want me to summarize?"*
- Lab references stored in a `useState<LabRef[]>` so subsequent chat calls include `parsedText` in the system prompt context (truncated to ~4k tokens).

**Coach proactive reading**
- Update `chat/index.ts` system prompt to incorporate latest pillar scores + any uploaded lab text passed in the request body.
- `AICoach.tsx` enriches the request with `{ context: { vitality, pillars, control, labText } }` from `useVitality()`.

**Surface in HealthSummary**
- Add an "Upload labs" card with paperclip icon and short copy.

---

### P6 — Correct & Protect hardware UX (UI only)

Goal: make the existing Correct/Protect screens *feel* like they're talking to BLE/WiFi devices, without implementing GATT/MQTT.

**New `src/lib/hardware/mockHardware.ts`**
- `useMockDevice(kind: "gem" | "mihealth")` hook returning `{ status, battery, signal, runProgram(name) }`.
- `runProgram` simulates a 30-second session with `setInterval`: `idle → connecting → broadcasting → completed`.
- Persists current session to localStorage so navigating away preserves the strip.

**Updated screens**
- `Protect.tsx` and `gem/GemCorrect.tsx` / `mihealth/MiHealthCorrect.tsx`: program tap → opens a **Session Sheet** (existing `Drawer` component) with:
  - Device name + battery + signal bars (mocked)
  - Big circular progress ring counting down 30s
  - "Broadcasting code: ESR-7" mock label
  - Stop / Pause buttons
- New global **Active Session Strip** component pinned above `BottomNav` when a mock session is running, showing program name + remaining time, tappable to reopen the sheet.

**Sync feedback**
- Toasts for "Connected to GEM", "Program loaded", "Session complete" — all triggered by the mock state machine.

**No real BLE/MQTT, no edge functions.** All client-side timers + localStorage. Memory `technical/gem-connection-management` already covers this pattern.

---

### Order of work / file count

```text
P2 scoring polish      ── 4 files edited, 2 new       (start here — pure logic, no UX risk)
P1 recommendations UI  ── 1 hook, 1 component, 1 edit
P6 hardware UX mock    ── 1 hook, 2 components, 3 edits
P3 subscription UI     ── 1 page, 1 hook, 1 dev tool, 2 edits
P4 lab upload (real)   ── 1 migration, 1 edge fn, 2 edits  (last — touches backend)
```

### Out of scope (deferred)

- Real 29-/82-candidate signature DB tables (P5 area + future P1 v2)
- Stripe SDK / webhook handler / tier enforcement on edge functions
- Real BLE GATT and WiFi MQTT protocols
- ED/EI/ET/ES/MB reference data seeding

### One thing to confirm before I start P4

For lab parsing, two options:
- **A**: Use Lovable AI Gateway (`google/gemini-2.5-pro`) to extract text directly from the uploaded PDF/image — handles photos of paper lab reports. **Default.**
- **B**: PDF-only via a Deno PDF text extractor — no photo support but cheaper.

I'll proceed with **A** unless you say otherwise.
