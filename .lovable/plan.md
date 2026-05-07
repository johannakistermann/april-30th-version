## Goal

Rewrite `src/pages/detect/ControlPillarDetail.tsx` so it fully matches the v5.4 dual-layer Control spec. The current file already has the right skeleton (header, headline layer, sub-scores layer, "why two layers?", recs, coach prompt) but is missing several spec details: a back-nav title, a per-feature impact column, a real cross-modal score viz, a section-1 explainer that names the ±10% Vitality multiplier behavior, witness chips with three states (✓/—/✗), an "All recs ›" link, and a few copy/data tweaks. No business logic, no new design tokens, no router changes.

## Files

- **Edit** `src/pages/detect/ControlPillarDetail.tsx` (only file changed)
- All visuals via existing design tokens (`hsl(var(--success|warning|destructive|info))`, `glass-card`, etc.) and the established Information purple `hsl(270 60% 70%)` already used on Vitality Breakdown.

## Section-by-section changes

### 1. Top nav bar
- Add a centered title `Pillar` and a right-side overflow icon (`MoreVertical` from lucide) next to the existing back button.
- Back button label: derive from `document.referrer` / `location.state?.from`; fall back to navigating to `/dashboard`. Visible label not required (icon only is fine — matches rest of app).

### 2. Page header
- Keep `VITALITY PILLAR · WEEK 6` eyebrow + title `Control` + purple `→ Information` chip.
- Move the score, zone, and delta into a **single header row** under the title (not a separate hero card): large `70` left, `AMBER` zone label color-coded warning, right-aligned `▲ +2 vs week 5` in success.
- Replace intro copy with the spec's exact paragraph: "Control measures how clearly your body's signaling system is operating. It has two layers: an overall coherence score that feeds Vitality, and four focus areas that drive your weekly recommendations."

### 3. Section 1 — Headline Layer
- Rename section eyebrow to `HEADLINE SCORE · FEEDS YOUR VITALITY`.
- Update explainer to: "Built from absolute, slowly-changing structural patterns in your tongue and face. Coherent signaling here multiplies your Vitality up to +10%; distorted signaling can pull it down up to −10%."

**Constitutional Pattern card (60%)**
- Add a `FEATURES READ THIS SCAN` mini-label above the feature grid.
- Each feature row gets a 3-column layout: name · value · impact chip. Impact values per spec:
  - Tongue body color → "Light red" → `neutral`
  - Tongue cracking → "Centre crack present" → `moderate −`
  - Tongue swelling → "Tip + edges clear" → `none`
  - Teeth marks → "Slight" → `small −`
  - Nasolabial fold → "Within range" → `none`
  - Vertical liver line → "Faint" → `moderate −`
  - Earlobe Frank's sign → "Absent" → `none`
  - FaceAge delta → "+1 year" → `small −`
- Impact chip color: `none`/`neutral` muted, `small −` warning at low alpha, `moderate −` destructive at low alpha.
- Rows remain non-interactive — explicitly no chevron and no hover state, matching spec.

**Cross-Modal Agreement card (40%)**
- Keep header + bar viz.
- Above the pattern list, add a small numeric badge `73 / 100` next to the bar (existing data-viz primitive — text + bar).
- Replace the current 2-state Indicator with a 3-state `WitnessChip` rendered inline in this file:
  - `✓` → success
  - `—` → muted-foreground
  - `✗` → destructive
- Update mock data so 4 of 5 patterns are `tongue:✓ face:✓` and 1 is `tongue:✓ face:—` (per spec's "4 of 5 corroborate fully, 1 neutral").
- Sub-label `PATTERNS CHECKED` above the pattern list.

### 4. Section 2 — Sub-Scores Layer
- Eyebrow already correct. Update the four rows' subtitle to use ED notation per spec:
  - Vitality & Constitution 25% · 78 · `ED1, ED2 · 4 witnesses`
  - Digestion & Metabolism 30% · 62 · `ED8, ED11, ED15 · 6 witnesses`
  - Detox & Elimination 25% · 58 · `ED11, ED12, ED10 · 5 witnesses`
  - Immunity & Defence 20% · 80 · `ED13, ED14 · 3 witnesses`
- Routes unchanged.

### 5. Section 3 — Why two layers?
- No structural change; copy already matches spec. Keep collapsed by default.

### 6. Section 4 — Recommendations targeting Control
- Add an `All recs ›` right-aligned link in the section header that routes to `/detect/latest#recommendations`.
- Reformat each rec row to match the Latest Scan recommendations row pattern (position number badge, name, plain-English why, confidence chip, chevron, tappable). Route `/detect/rec/[id]` (placeholder; current `RecDetail` route already accepts an id param).
- Mock 3 rows: Liver Driver → Detox & Elimination, Pancreas → Digestion & Metabolism, Source → Vitality & Constitution.

### 7. Section 5 — Coach prompt
- No change beyond what's already there. Confirm route is `/ai-coach?context=control-pillar` (it is).

## Out of scope

- No changes to the scoring engine, data hooks, or any other screen.
- No new shared components — `WitnessChip` and impact chip are inline helpers in this file.
- Sub-cluster detail screen still resolves to the existing placeholder route.
- "Learn more" links on structural features deferred to V1.x per spec.

## Verification

- Header shows score `70`, `AMBER`, `▲ +2 vs week 5` in one row, with `→ Information` chip near the title.
- Section 1 explainer mentions the ±10% Vitality multiplier behavior.
- Each Constitutional Pattern row shows three columns (name · value · impact) with no chevron.
- Cross-Modal pattern rows show 3-state witness chips; 4 of 5 fully corroborate.
- Section 2 ED notation matches spec.
- Section 4 has `All recs ›` and chevron-tappable rec rows.
- All routes resolve without 404.
