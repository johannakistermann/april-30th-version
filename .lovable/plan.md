## Goal

Pilot the Energy4Life brand spec on the Home screen (`/home`) only. Other screens stay on the existing dark/glass theme until we validate this on real content. No E4L logo — the screen stays GEM-branded.

## Approach: scoped brand layer

To avoid touching the global dark theme (which the rest of the app depends on), introduce the E4L design tokens as a **scoped block** rather than overriding `:root`. Wrap the Home page in a `<div className="brand-e4l">` and define all spec tokens under that selector. Components inside read the same semantic tokens (`--background`, `--foreground`, `--primary`, `--card`, `--border`, `--muted-foreground`) but resolve to the E4L palette.

This means:
- No changes to `tailwind.config.ts` color names — semantic tokens get remapped within the wrapper.
- Existing shadcn components (Button, Card) automatically pick up the new look on Home.
- Other routes are completely untouched.

## Files to change

### 1. `src/index.css` — add E4L scoped layer

Add fonts (Cormorant Garamond, DM Sans, JetBrains Mono) and a `.brand-e4l` block that overrides:
- `--background` → Ivory `#FAF8F5`
- `--foreground` → Deep Earth `#1A1A17`
- `--card` → White, `--card-foreground` → Deep Earth
- `--primary` → Amber Signal `#C9A96E`, `--primary-foreground` → Deep Earth
- `--muted` / `--muted-foreground` → warm cream / `#3D3A35`
- `--border` → `rgba(0,0,0,0.06)`
- `--success` / `--warning` / `--destructive` → keep but re-tune toward warm tones (Deep Teal for success, Amber for warning, Burnt Ember for destructive) so existing zone components don't clash with the warm palette
- `--radius` → `0` for primary CTAs only (via a `.brand-e4l .cta-rect` utility, keep card radius)

Also add inside the scope:
- `.brand-e4l` body font → DM Sans, weight 300, line-height 1.8
- `.brand-e4l h1, h2, h3, .font-display` → Cormorant Garamond
- `.brand-e4l .label-caps` → DM Sans 10px, uppercase, tracking 0.25em, amber
- `.brand-e4l .equation` → JetBrains Mono italic, equation-gold
- `.brand-e4l .hex-bullet::before` → hex glyph in amber
- A `.brand-e4l .impact-band` utility → Walnut bg, white text, for the hero/Vitality block

All colors written in HSL via the existing token system (per design rules).

### 2. `src/pages/Home.tsx` — apply brand wrapper and restructure visuals

Wrap top-level container with `className="brand-e4l ..."`. Then:

**Greeting block**
- Replace small caps date with a gold `label-caps` tagline ("TODAY · WEEK 2")
- Greeting in Cormorant 28px light, sentence case

**Last Scan / GEM strip**
- Switch from filled glass cards to white cards with hairline `0.5px` borders
- Status label uses `label-caps` style, value in Cormorant

**Vitality hero — promote to "impact band"**
- Wrap in `.impact-band` (Walnut background, white text)
- Add atmospheric equation watermark `V = (I×V)/(R×E)` top-right at 7% opacity
- Score number → Cormorant 56px light
- "Vitality Score" → Cormorant 22px
- Subtitle "Information × Voltage / Resistance" → JetBrains Mono italic, equation-gold
- I × V / R chips: keep semantics, swap colors to Plum (I), Deep Teal (V), Burnt Ember (R), all with low-alpha bg
- Baseline establishing pill → cream bg, plum text

**3 pillar tiles**
- White cards with hairline border, hex bullet before pillar name
- Score in Cormorant; zone label as `label-caps` in zone color
- Recovery split-color indicator stays (teal/ember instead of success/destructive)

**Bioenergetic Priorities**
- White card; "THIS WEEK'S BIOENERGETIC PRIORITIES" as `label-caps` amber
- "Control · 78" in Cormorant
- Sub-score rows with hex bullets, monospace numerals

**This week's 5 Infoceuticals**
- Section header Cormorant 20px; "View all ›" amber `label-caps`
- Rows white with hairline; confidence chip swapped to muted plum/teal/cream tints

**Today's program card**
- Replace green gradient with Walnut `.impact-band` styling + amber accent line + Plum-Light tint (this is the "Protect" product accent per spec)
- "Start now" CTA → rectangular gold button, uppercase, `tracking-cta`

**Ask the Coach**
- White card, plum accent border, hex icon
- CTA pattern: amber arrow + uppercase label

**Weekly scan streak**
- White card, segmented progress bar in amber
- Streak count in Cormorant

**Footer (new)**
- Add small disclaimer at the bottom of `/home` per spec section 11, in `text-muted-foreground` 11px

### 3. Memory updates

After implementation, update `mem://index.md` Core block:
- Add note: "Brand pilot: `.brand-e4l` scoped tokens on Home only (Ivory canvas, Walnut impact bands, Cormorant + DM Sans + JetBrains Mono, amber CTAs, hex bullets). Other screens unchanged. No E4L logo."

Add a new memory file `mem://style/e4l-brand-pilot` with: scope (Home only), token mapping summary, anti-patterns to avoid (no green, no pure black/white, no rounded CTAs, no bold body), and a pointer to the source spec.

## Out of scope (explicitly)

- Tailwind config color names — not changing
- Other routes (Dashboard, Scan, Coach, Learn, Shop, Profile, Onboarding, Splash) — untouched
- ENERGY4LIFE wordmark — not added (memory rule preserved)
- Equation library beyond the single Vitality equation watermark on the hero
- Flipping the global theme to light mode — not happening; this is a scoped pilot

## Validation after build

1. Visit `/home` — confirm light Ivory canvas, Walnut impact bands, Cormorant headlines, gold rectangular CTAs, hex bullets, equation watermark, no green tones leaking through.
2. Visit `/dashboard`, `/scan`, `/coach`, `/learn`, `/shop`, `/profile` — confirm they look identical to before (dark glass theme intact).
3. Confirm interactive states (button hovers, active scaling) still work.

## Open follow-ups (after pilot)

- If approved, roll out the `.brand-e4l` wrapper to remaining authenticated screens one section at a time (Dashboard → Scan → Coach → Learn → Shop → Profile), then Onboarding/Splash/Auth.
- Decide whether to retire the dark/glass theme entirely or keep it as the "impact band" treatment only.
