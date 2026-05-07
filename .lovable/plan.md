## Remove Scan button from /dashboard

In `src/pages/Dashboard.tsx`, remove the "Start scan" button from Section 1 (Next scan card). Users will use the bottom-nav Scan tab to start a scan instead.

### Change
- Delete the `<button onClick={() => navigate("/scan")}>...Start scan</button>` block (lines 89–95).
- Keep the surrounding card with "Next scan in 4 days / Sunday, 10 May / Last scanned 17 minutes ago" as informational content.
- Remove the now-unused `Scan` icon import (line 4) if no other usage remains.

### Out of scope
- No changes to bottom nav, routing, or other Dashboard sections.