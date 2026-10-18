# Implementation handoff: M01 Blue Ocean UI into active HaloSpark

**Intent:** Use the user's demo video and this standalone working code as the **visual and behavior reference**, not as a replacement of approved production architecture.

## Mandatory integration sequence for Claude Code in the actual Windows repo

1. Audit current branch, worktree, `CLAUDE.md`, current active M01 code, approved scoring profiles and UI regression tests. Confirm protected Dashboard/Settings and AI Gateway boundaries.
2. Create a new isolated worktree or approved feature branch. Never overwrite partially completed code or private databases.
3. Create an approved centralized `HaloSpark Dark Research` theme overlay using `THEME_TOKENS.json`, with token ownership and visual regression snapshots. Apply to M01 first; reuse elsewhere only after UI owner approval.
4. Adapt `public/index.html`, `public/styles.css` and `public/app.js` UI behavior into existing React/TypeScript components, keeping consistent left navigation, center workspace and right Request Trace. No new competing CORE Brand/Niche authority.
5. Port `src/scoring.mjs` into the existing deterministic analytics layer, with explicit calculation provenance and versioned scoring profile. Preserve the previously approved M01 nine-dimensional profile: `BO-DEMO-0.1` remains an optional experimental analysis, never an implicit replacement.
6. Replace synthetic fixtures with validated, permissioned EverBee Research API responses after app approval. Adapt field mapping from actual OpenAPI and LIVE responses; never assume fabricated sales/growth fields appear in keyword endpoints.
7. Plug `src/everbee-client.mjs` behind the application's existing encrypted-secret vault and backend IPC/API boundary; never expose credentials to renderer. Account for response header quota / error handling, terms and storage policy.
8. Use canonical CORE-owned Brand/Niche/Shop IDs and versioned routing rules; `f-brand` demo string input must become lookup-only canonical mapping when integrated.
9. M01 exports ONLY a versioned approved Product Intelligence ResearchOpportunity to M02. No SEO tags/title/description bundle at M01. M02 creates product / SKU after QC; M03 finalizes Product Facts; M04 independently researches SEO using final SKU + short product keyword, then M05 handles listings.
10. Run standalone tests, existing M01/M02 architecture tests and UI regression snapshots before proposing merge. Do not merge without owner approval.

## Done when

- M01 reproduces the supplied demo's UI visual language and interaction model in the main app.
- Actual API authorization and real response schemas have been verified; mock/live data never mix silently.
- Scores are deterministic, explainable, versioned, and incomplete metrics cannot silently become zeros.
- Research opportunities are linked to canonical Shop/Brand/Niche IDs without overriding the CORE authority.
- All existing protected features and existing approved contracts remain intact.
- M04 SEO remains separate with a fresh query on finalized SKU/product.
