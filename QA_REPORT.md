# QA report

Build: `HaloSpark_M01_BlueOcean_Demo_Build` · 2026-10-18

## PASS

- `npm run check` syntax validation for server, frontend, scoring.
- Deterministic scoring unit tests, bounded score 0–100.
- Keyword normalization and duplicate removal.
- Missing sales or growth yields `INCOMPLETE`, no invented score.
- ResearchBrief export shape is noncanonical, has no SKU or real shop ID.
- Live adapter disabled by default; no network when disabled.
- Live adapter request-header names, quota header parsing and safe 401 error classification (with mocked fetch).
- HTTP `/api/health` responded with MOCK and 0 live requests.

## NOT VERIFIED in this environment

- Real browser interaction test: Chromium launched but all navigations blocked by environmental administrator policy, including `data:` navigation. The Playwright smoke script is included for environments where it is allowed.
- Real EverBee Research API: no approved live installation/credentials provided.
- Integration with current protected HaloSpark repository: repository was not attached/accessible.

## Explicit warnings

- Demo results and 0–100 scores come from fabricated fixtures; they are not Etsy/EverBee research findings.
- Experimental `BO-DEMO-0.1` must not replace agreed M01 scoring rules without review.
- M04 page is a synthetic workflow preview. It does not validate live SEO keyword market evidence.

## HTTP integration smoke test

**PASS** after restarting the mock server:
- 11 mandala-related keyword rows normalized from fixtures.
- 9 sample `RECOMMENDED` rows; 1 `INCOMPLETE` row.
- Unknown keyword returned empty results, not unrelated suggestions.
- `/api/live` returned 403 and made no external calls.
- Frontend JavaScript served with HTTP 200.
