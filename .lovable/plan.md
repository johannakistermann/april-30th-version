## Problem

Both floating dev toggles still exist in code and are mounted in `src/App.tsx`, but they're invisible in the Lovable preview:

- **`DevGemToggle`** (GEM ON/OFF pill, bottom-right) renders only when `import.meta.env.DEV` is true OR `localStorage["dev-bypass-auth"] === "true"`. In the published/preview build `DEV` is false, and if you've signed in normally the bypass flag isn't set — so it disappears.
- **`DevTierToggle`** (CreditCard button that opens Free / Consumer / Practitioner) is gated by `if (import.meta.env.PROD) return null;` — so it's hidden in the preview build entirely.

The Profile page also has the "I am a Practitioner" switch, but that's buried inside `/profile`, not a quick floating toggle like before.

## Plan

Make both floating toggles visible in the Lovable preview without shipping them to a real production deploy.

1. **`src/components/DevTierToggle.tsx`** — replace the `import.meta.env.PROD` guard with the same pattern `DevGemToggle` uses:
   ```ts
   if (!import.meta.env.DEV && localStorage.getItem("dev-bypass-auth") !== "true") return null;
   ```
   So it shows in local dev AND whenever the dev-bypass flag is on.

2. **`src/components/DevGemToggle.tsx`** — keep the existing guard (already correct), but it currently sits at `bottom-28 right-4`, which on small screens stacks under the tier toggle (`bottom-24 right-4`). Bump GEM toggle to `bottom-40 right-4` so the two pills stack cleanly above the bottom nav (which is ~`h-16`/`bottom-0`) without overlapping each other.

3. **Add a small floating "Role" pill** next to the tier toggle that flips the practitioner role via the existing `usePractitionerRole().togglePractitioner()` hook. New file `src/components/DevRoleToggle.tsx`, same visibility guard as #1, positioned at `bottom-24 right-16` (left of tier toggle) showing `Role: Consumer` / `Role: Practitioner`. Mount it in `src/App.tsx` alongside the other two.

   Rationale: the user explicitly asked for "switch between different user roles" as a quick toggle. The Profile screen switch stays as the canonical control; this is just the floating dev shortcut they're used to.

4. No design-token changes, no business logic changes, no route changes. Pure presentation/dev-tooling restoration.

## Verification

- Reload `/home` in preview → expect three floating controls bottom-right: Role pill, Tier (CreditCard), GEM ON/OFF, stacked so none overlap the bottom nav.
- Click each → state updates and persists in localStorage; Profile screen reflects the same role/tier.
