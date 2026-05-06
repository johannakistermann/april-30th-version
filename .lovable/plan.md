## Goal

Reflect the GEM device's true behavior in the UI: it takes a reading every ~15 minutes and, when connected, syncs that reading to the app on the same cadence. Any "last sync / last reading / next sync" copy should be consistent with that 15-minute cycle.

## Findings — current state of GEM time copy

| Where | Current copy | Issue |
|---|---|---|
| `src/pages/Home.tsx` (lines 79–90) | Seeds `lastGemSyncDate` to **30 min ago** on first load; shows `Synced Xm ago` indefinitely without ever advancing | Stale — never ticks. With a 15-min cycle, "30 min ago" implies a missed sync. |
| `src/pages/gem/GemDetect.tsx` (line 22) | Hard-coded `GEM · Last reading: 2h ago` | Wrong cadence — should be ≤15 min when connected |
| `src/pages/MyClients.tsx` (mock rows + line 186) | `gem_last_sync` set to dates days old, label `GEM synced Mar 15` | Practitioner view of a connected client should show recent (<15 min) sync, not a date |
| `src/components/gem/GemSyncCountdown.tsx` | Manual sync animation (label "Syncing to GEM…") | Fine — used for explicit user-triggered sync from Protect, not the background 15-min cycle |
| `src/pages/ProtectHub.tsx` | Manual "Sync to GEM device" CTA | Keep, but reword to clarify it's a *force* sync on top of the automatic 15-min cycle |

There is no central source of truth for "when did the GEM last sync" — every screen invents its own copy.

## Plan

### 1. Add a tiny shared GEM sync clock

New file: `src/lib/gem/syncClock.ts`

- Exports `GEM_SYNC_INTERVAL_MS = 15 * 60 * 1000`.
- `useGemSync()` hook: returns `{ lastSyncAt: Date, nextSyncAt: Date, minutesSinceLast: number, minutesUntilNext: number, label: string }`.
- Reads/writes `lastGemSyncDate` in localStorage. If missing or older than 15 min AND `isGemConnected` is true, it auto-advances `lastSyncAt` to the most recent 15-min boundary (simulates the background sync that "just happened").
- Re-renders every 30 s via a `setInterval` so labels stay fresh.
- `label` formats as: `"Just synced"` (<1 min), `"Synced Xm ago · next in Ym"` (1–14 min), `"Syncing now…"` during the simulated tick.

### 2. Update consumer-facing copy to use the hook

- **`src/pages/Home.tsx`** — replace the manual `formatDistanceToNow` block with `useGemSync().label`. Drop the 30-min-ago seed.
- **`src/pages/gem/GemDetect.tsx`** — replace `Last reading: 2h ago` with `Last reading: {label}`. When disconnected, fall back to "GEM not connected".
- **`src/pages/ProtectHub.tsx`** — under the "Sync to GEM device" CTA add a one-line subtext: `Auto-syncs every 15 min · Last: {label}`. Reword the manual button to "Force sync now".

### 3. Update practitioner view

- **`src/pages/MyClients.tsx`** — for mock clients with `has_gem: true`, change `gem_last_sync` to a relative timestamp (e.g. `Date.now() - 4 * 60 * 1000`) and render with the same hook output: `GEM synced 4m ago` instead of a calendar date. Clients without recent activity ("Emma Rodriguez") show `GEM offline · Last sync 2d ago`.
- **`src/pages/ClientDetail.tsx`** — same treatment if it shows GEM sync time (verify in implementation).

### 4. DevGemToggle interaction

When the dev toggle flips GEM **OFF**, leave the last sync timestamp frozen (so "Synced 7m ago · GEM offline" reads correctly). When flipped **ON**, snap to "Just synced". This lives in `useGemSync` reacting to `useGemConnection()`.

## Out of scope

- No real Bluetooth, no real backend sync. The 15-min cycle is simulated on the client.
- No changes to scan-time copy ("Last scanned 17 minutes ago" on Dashboard) — that's a separate concept (manual scan, not GEM passive reading).
- No design-token, color, or layout changes.

## Verification

- Load `/home` with GEM ON → label reads `Just synced` or `Synced Xm ago · next in (15-X)m`. Wait 30 s → label updates.
- Toggle GEM OFF via dev pill → label freezes and gains `· offline` suffix. Toggle ON → snaps to `Just synced`.
- `/gem/detect` and `/protect` show the same label.
- `/clients` shows minute-level recency for connected clients, date-level only for stale ones.
