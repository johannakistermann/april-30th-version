
# Make the app responsive across all screen sizes

Today every screen is built mobile-first inside a `max-w-md` (~448px) centered column. On tablet/desktop that column stays tiny and a lot of screen real estate is wasted. The fix is **two layers**: a shared responsive container that widens on larger breakpoints, and per-screen layout tweaks where a single column starts to feel wrong on wide viewports.

We keep the mobile design exactly as-is — only `sm` (≥640px) and above change.

## 1. Shared responsive container

Add a small util component `src/components/PageContainer.tsx`:

```tsx
// max-w-md (mobile) → 2xl (tablet) → 4xl (desktop)
className = "w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto px-0"
```

Pages opt in by wrapping their content area with `<PageContainer>` instead of the current `<div className="max-w-md mx-auto">`.

Also widen `BottomNav` inner content from `max-w-md` to the same breakpoint scale so it lines up with the page container on every viewport. `TopMenu` already uses `max-w-5xl`, fine as-is.

## 2. Page updates

Rather than rewrite every screen, make **one pass** across all pages and apply the container + a few responsive grid bumps. Concretely:

**A. Wrap content** — replace any `max-w-md mx-auto` (or missing wrapper directly under `min-h-screen`) with `<PageContainer>`. Affected pages (~25): Home, Dashboard, all `detect/*`, `gem/*`, `mihealth/*`, Profile, Learn, Shop, ShopCategory, Basket, Checkout, Protect, ProtectHub, Bookings, ScanHub, BioIdentity, Longevity, Nutrition, Leaderboards, AICoach, MyClients, MyPractitioner, FindPractitioner, ClientDetail, Subscription, Community, PillarDetail, NotFound.

Auth/onboarding/scan-flow screens (Auth, Onboarding, Splash, GuestScan, GuestResults, MirrorCheck, DeepScan, VoiceTest, TongueTest, ResultsLoading, AcceptInvite) stay narrow (`max-w-sm/md` centered) — those are intentionally focused single-column flows, no change.

**B. Responsive grids** — bump column counts on `md:` and `lg:` for the few pages where the cramped 2-column mobile grid looks too sparse on a wide column:

- Home: pillar 3-tile row stays `grid-cols-3`; bioenergetic priorities `grid-cols-2 md:grid-cols-4`; recommendations list `space-y-1.5 md:grid md:grid-cols-2 md:gap-2 md:space-y-0`.
- Dashboard (Detect hub): pillar tiles `grid-cols-2 md:grid-cols-4`; "Explore over time" rows stay stacked.
- LatestScan: capture quality stays `grid-cols-5`; pillars `grid-cols-2 md:grid-cols-4`; recs list `md:grid md:grid-cols-2 md:gap-2`.
- Shop / ShopCategory / Learn / MyClients lists: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for card lists.

**C. Padding scales up** — pages currently using `px-5` / `px-6` get `sm:px-8 md:px-10` so side margins breathe on wider viewports.

## 3. Notes

- No design-token, color, or copy changes.
- No changes to fixed nav positioning behavior.
- Mobile (<640px) layout is byte-identical to today.
- Scan capture flows keep their fixed narrow width — required for camera framing UX.
