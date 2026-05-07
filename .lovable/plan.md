## Remove "Next scan" card from /dashboard

In `src/pages/Dashboard.tsx`, remove Section 1 entirely — the glass card showing "Next scan in 4 days / Sunday, 10 May / Last scanned 17 minutes ago" (lines ~81–97). This frees vertical space so the Latest scan hero appears higher on the page.

### Out of scope
- No changes to other Dashboard sections, nav, or routing.