## Adapt "Today's program" card when GEM is disconnected

When `isGemConnected` is false, swap the "Today's GEM program" tile to a phone-only "Today's protocol" version, and add a small secondary upsell line inside the same card.

### Edit: `src/pages/Home.tsx` — Today's program card
- Title: `Today's GEM program` when connected, `Today's protocol` otherwise.
- Click target: `/correct` when connected, `/learn` otherwise.
- "Next" line:
  - Connected: `Next: Liver Driver` / `Scheduled 6:30 PM · in 2h` (current).
  - Disconnected: `Next: 4-min vagal breath` / `Guided · phone only`.
- Keep the same green gradient, progress bar (mock 40%), and stacked `Start / now` CTA in both states.
- Disconnected only: append a thin top-bordered footer row inside the card with text `Add a GEM for hardware-driven protocols` and a small `ChevronRight` in success color.

No other files changed; no new routes or data sources.