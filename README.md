# HaloSpark M01 Blue Ocean Research | Standalone demo build

This is a **working, isolated implementation** inspired by the supplied 4m47s HaloSpark EverBee API review video. It reproduces the dark navy / electric blue / teal UI pattern and makes the **M01 research workflow interactive**.

**Not the in-progress HaloSpark repository.** No access to the owner's local Vibe Code/Claude Code worktree was available, so no existing module or frozen contract was modified.

## Start on Windows

Requirement: Node.js **20 or newer**. No `npm install` is required.

1. Unzip the archive to any folder outside your existing HaloSpark project.
2. Double-click `RUN_M01_DEMO_WINDOWS.cmd`.
3. Open `http://127.0.0.1:4177` in Chrome or Edge.
4. Choose **Product Research** (M01) and click **Run EverBee Research**.
5. Inspect Blue Ocean KPI cards, ranking bars, scatter chart, and results table.
6. Click a keyword row; inspect score breakdown and evidence. Click **Approve Demo Opportunity**.
7. Open **Product Handoff** to export `ProductCreationResearchBrief.demo.v1` JSON for M02.

Or use PowerShell:

```powershell
cd 'C:\path\to\HaloSpark_M01_BlueOcean_Demo_Build'
node server.mjs
```

## Implemented

- Responsive demo theme, navigation, API trace panel and Overview.
- M01 market/brand/niche/family/seed research UI.
- Fourteen+ synthetic sample COLORING keywords plus PUZZLE and STICKER families.
- Deterministic normalization, duplicate detection and scored 0-100 Blue Ocean dimensions.
- Demand-adjusted competition, demand, estimated sales signals, growth, product fit.
- Evidence completeness and explicit INCOMPLETE states when metrics are unavailable.
- KPI summary, bars, scatter plot, filters, sorting, row detail, CSV export.
- M01-only research handoff brief for M02. No SKU issuance, canonical CORE data or M04 SEO evidence emitted by M01.
- Standalone M04 **mock illustration** to show the separate research job after M02/M03; not a production SEO implementation.
- A server-side EverBee transport module prepared for future approved integration (disabled by default and not wired to this demo), with sanitized 401/403/429 behavior.
- Twelve automated Node unit tests; no external packages required.

## Safety and current limitations

**MOCK MODE ONLY.** All on-screen market metrics are *fabricated demo fixtures*, not actual Etsy/EverBee measurements. No live calls to EverBee or Etsy are made, and no secret needs to be entered.

App approval and installation credentials are needed before a live EverBee integration can be tested. The existing CORE/brand routing authority and M01 signed contracts have not been connected. The score profile `BO-DEMO-0.1` is experimental and does **not** replace the nine-dimensional M01 scoring profiles already agreed.

This build uses dependency-free browser JavaScript and a Node.js HTTP server to remain executable without internet access. To integrate into HaloSpark's TypeScript/Electron/React architecture, port its components and algorithms through the existing UI, adapter, IPC, CORE data and contract governance. Do not replace frozen modules wholesale.

## Test

```powershell
npm test
npm run check
```

Browser automation was attempted in the building environment but Chromium blocked navigation (`ERR_BLOCKED_BY_ADMINISTRATOR`), including `data:` URLs. Thus the interactive browser smoke test is included in `tests/browser_smoke.py` but **cannot be marked PASS** in this environment. Please launch on Windows for visual and interaction confirmation.

## Integration instructions

See `INTEGRATION_HANDOFF.md`. The theme tokens are in `THEME_TOKENS.json`.


## Hosting for EverBee App Demo reviewer

For mandatory **Production URL + Username + Password**, see [DEPLOY_EVERBEE_REVIEW.md](DEPLOY_EVERBEE_REVIEW.md). This revised package supports reviewer-only login and Render deployment via `render.yaml`. No public URL can exist until you actually deploy.
