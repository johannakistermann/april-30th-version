## Phase 1 — Rebrand to GEM + Rename Pillars

This is the foundational pass from spec v5.2. It changes the visible identity of the app and the names of the Four Pillars everywhere they appear, but does **not** touch scoring math, scan flow, subscriptions, or recommendations (those come in later phases).

### What changes

**Branding: "THE FIELD" → "GEM"**
- `src/pages/Splash.tsx` — welcome line "Welcome to THE FIELD" → "Welcome to GEM"
- `src/pages/BioIdentity.tsx` — header chip "THE FIELD" → "GEM"
- `src/pages/GuestResults.tsx` — "Download THE FIELD for complete insights" → "Download GEM for complete insights"
- `index.html` — page `<title>` and meta description updated to GEM
- Update memory: `mem://index.md` Core line "App & Branding: THE FIELD" → "GEM"

The dark theme, glassmorphism style, logos, and tagline copy stay as-is.

**Four Pillars rename (spec section 10–13)**

| # | Old name | New name | New id |
|---|----------|----------|--------|
| 1 | Energy & Recovery | **Control** | `control` |
| 2 | Organs & Inflammation | **Energy** | `energy` |
| 3 | Stress & Nervous System | **Stress & Nervous System** (unchanged) | `stress-nervous` |
| 4 | Metabolic & CV | **Recovery** | `recovery` |

Files touched:
- `src/pages/Home.tsx` — `PILLARS` array (4 entries: ids, names, kept icons/colors)
- `src/pages/Dashboard.tsx` — `PILLARS` array (same shape)
- `src/pages/PillarDetail.tsx` — pillar config map, tab list, formula labels
- `src/pages/Onboarding.tsx` — the 4 pillar bullets shown to new users

Icons stay mapped sensibly (Control → Gauge, Energy → Zap, Recovery → Heart, Stress → Brain). Scores/trends remain mocked at their current values for now.

**Routes**
The route `/pillar/:pillarId` keeps working — it just receives the new ids. Anything still linking to `energy-recovery`, `organs-inflammation`, `metabolic-cv` gets updated to the new ids in the same pass.

### What does NOT change in this phase

- Vitality Score formula (still shown as a generic health score)
- Scan flow (Mirror Check + Deep Scan stay split)
- Subscription tiers, pricing, recommendations engine
- Practitioner portal
- Daily Energy Pattern / Body State Engine logic
- Database schema

### Out of scope (future phases — for your awareness)

| Phase | Scope |
|-------|-------|
| 2 | Vitality Score formula (Voltage × Resistance Efficiency), Daily Energy Pattern from 3-state Body State Engine, sub-scores per pillar |
| 3 | Single weekly Scan replaces Mirror Check + Deep Scan; new capture protocols |
| 4 | Consumer Recommendation Engine (29-candidate Infoceutical pool, EDs/EIs/ESR, 4-witness fusion) |
| 5 | $24 vs $97 subscription model + practitioner $97 tier and revenue share (deferred per your direction) |
| 6 | Correct & Protect Cloud API integration (BLE/WiFi device orchestration) |

### Risks / notes

- The pillar ids change, so any stored pillar references (analytics, deep links shared externally) would break — there are none persisted in the DB today, so this is safe.
- Memory file `mem://features/dashboard/detect-view` references "2x2 Four Pillars grid" which stays accurate; only the Core branding line needs updating.
