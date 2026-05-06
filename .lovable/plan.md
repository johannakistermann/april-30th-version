Update every auth-related redirect that still sends users to `/dashboard`, while leaving intentional Detect navigation alone.

1. Change the dev bypass in `src/pages/Auth.tsx`
- Update the dev button handler from `navigate("/dashboard")` to `navigate("/home")`
- Rename the label from `Skip to Dashboard (dev)` to `Skip to Home (dev)`

2. Fix the splash/login completion flow in `src/pages/Splash.tsx`
- Change the magic-link success redirect to `/home`
- Change the returning-user welcome-back redirect to `/home`
- Update the loading copy from `Loading your dashboard...` to `Loading your home...` or equivalent neutral wording

3. Fix the already-signed-in onboarding redirect in `src/pages/Onboarding.tsx`
- Change the authenticated redirect from `/dashboard` to `/home`

4. Fix the authenticated post-scan redirect in `src/pages/ResultsLoading.tsx`
- When a signed-in user finishes processing, navigate to `/home` instead of `/dashboard`
- Keep the unauthenticated branch going to `/auth` as-is

What will stay unchanged
- I will not change intentional in-app Detect links such as Home → Detect, pillar deep-dives, or other explicit `navigate("/dashboard")` actions that are part of normal app navigation rather than sign-in landing.

Technical details
- Files to update:
  - `src/pages/Auth.tsx`
  - `src/pages/Splash.tsx`
  - `src/pages/Onboarding.tsx`
  - `src/pages/ResultsLoading.tsx`
- Scope: only post-auth / post-entry redirects
- No router config changes are needed because `/home` already exists as a protected route in `src/App.tsx`