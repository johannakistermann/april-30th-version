

# GEM Connection Strip: Non-clickable When Connected, Dual Actions When Not

## Changes — `src/pages/Dashboard.tsx` (lines 68-104)

### Connected state (lines 68-88)
- Change `<button>` to `<div>` — remove click handler, remove `active:scale` and hover styles
- Remove the `<ChevronRight>` icon
- Keep the green status indicator, "GEM Connected" label, and last reading info as-is

### Disconnected state (lines 89-104)
- Replace the single "Get yours" button with a `<div>` container holding **two side-by-side action buttons**:
  1. **"Get Yours"** — opens `https://shop.e4l.com` in a new tab (existing behavior), with `ExternalLink` icon
  2. **"Pair GEM"** — navigates to `/gem/detect` to start pairing, with `Bluetooth` icon

Layout: same glass-card wrapper, with a row of two compact buttons at the bottom (or right side) styled consistently with the existing design system.

| What | Detail |
|---|---|
| File | `src/pages/Dashboard.tsx` lines 68-104 |
| Connected | `<div>` instead of `<button>`, no click, no chevron |
| Disconnected | Two actions: "Get Yours" (external link) + "Pair GEM" (navigate to `/gem/detect`) |

