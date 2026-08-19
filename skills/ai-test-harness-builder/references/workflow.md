# Generic AI Test Harness Workflow

Tool-neutral process for bootstrapping and extending an AI-driven Playwright +
TypeScript E2E test harness for any web application. Works with any coding
agent that can read `AGENTS.md` (Claude Code, Codex, Antigravity, GitHub
Copilot, or a human following the same steps by hand).

This document is the portable core. It has no dependency on any one agent's
skill system, MCP config, or CLI.

## 1. Inputs

Three values fully parameterize a run. Nothing SUT-specific is hard-coded
anywhere else in the harness.

| Input | Meaning |
|---|---|
| `UI_URL` | Base URL of the application under test's UI |
| `API_URL` | Base URL of the application under test's API |
| `TARGET_DIR` | Directory that will hold the harness (existing or new repo) |

## 2. Bootstrap

- Create `PROJECT_BRIEF.md` in `TARGET_DIR`: mission, `UI_URL`/`API_URL`,
  toolchain (Node LTS, pnpm, Playwright + TypeScript, git), architecture goals
  (generic across any SUT, no SUT-specific names in shared code, small
  composable pieces, config out of test bodies), quality rules (small
  verifiable changes, no secrets/reports committed, deterministic tests), and
  the required-workflow note that `TEST_PLAN.md` must exist before any
  feature test slice.
- Create `CLAUDE.md` (or the equivalent instructions file for the agent in
  use): read `PROJECT_BRIEF.md` first, read `AGENTS.md` if present, read
  `TEST_PLAN.md` before creating test slices (create it first if missing), no
  app-specific test code before `TEST_PLAN.md` exists, small verified changes,
  no secrets/credentials/generated reports committed.
- Configure a Playwright-driving MCP server (or equivalent browser-automation
  tool) so the agent can explore the live UI during discovery.

## 3. Foundation

Generate `AGENTS.md` for the target repo. It **must**:

- Declare a **vertical-slice** layout: `src/core/`, `src/shared/` (with
  `src/shared/data/`), and `src/features/<slice>/` — one folder per
  discovered feature, holding everything that slice needs (page object,
  service/API client, flow/facade, factory/builder if needed, and co-located
  `<slice>.spec.ts` / `<slice>.api.spec.ts`).
- **Forbid layer folders** at the top level of `src/`: never `src/pages/`,
  `src/services/`, `src/flows/`, `src/data/`, `src/tests/`. A vertical slice
  means one feature folder owns its own page/service/flow/specs together —
  never a spec spread across separate layer folders by type.
- Allow exactly one shared cross-feature POM, `src/shared/MenuPage.ts`,
  created only when discovery (`TEST_PLAN.md`) confirms shared navigation
  exists — never a `src/shared/pages/` folder.
- Cover locator rules (`getByRole`/`getByLabel`/`getByTestId` over CSS/XPath,
  no `waitForTimeout`, web-first auto-retrying assertions), API rules (HTTP
  calls go through a `<Slice>Service`, base URL from config not hard-coded),
  and the data-driven rule (parametrize over typed data instead of
  near-duplicate tests).

Also create/verify:

- `package.json` with scripts: `test`, `test:ui`, `test:cross`,
  `test:firefox`, `test:webkit`, `test:mobile`, `test:api`, `test:smoke`,
  `test:headed`, `typecheck`, `report`, `install:browsers`.
- `playwright.config.ts` with `fullyParallel: true` and a cross-browser +
  responsive UI matrix: `ui-chromium`, `ui-firefox`, `ui-webkit`,
  `ui-mobile-chrome`, `ui-mobile-safari` — all sharing a `testIgnore` for
  `*.api.spec.ts` — plus one browserless `api` project (`testMatch` on
  `*.api.spec.ts`, no `devices` entry).
- `src/core/` (shared base classes/singletons: env config, base page object,
  base API client, reporter hooks).
- `src/shared/` (fixtures/DI composition root, generic reusable types,
  `src/shared/data/`).

## 4. Discovery

- Explore the live UI (`UI_URL`) with the browser-automation tool: identify
  screens, navigation, and user-visible entities.
- Discover the API (`API_URL`) via its OpenAPI/Swagger spec or docs if
  published; otherwise light, read-only probes against documented endpoints.
- From what was discovered, create `TEST_PLAN.md`: list the UI and API test
  cases to implement, confirm the concrete API endpoints to be used, and name
  each feature slice.
- If discovery finds a shared navigation component used across multiple
  slices, `TEST_PLAN.md` must call it out so `src/shared/MenuPage.ts` gets
  created in the slices stage.

## 5. Slices

- Slice names come only from `TEST_PLAN.md` — never invented ahead of
  discovery.
- For each confirmed slice, create its UI spec and/or API spec only once
  `TEST_PLAN.md` confirms that scenario exists; do not scaffold specs for
  unconfirmed behavior.
- Each slice is self-contained inside `src/features/<slice>/`; slices do not
  import from each other. Cross-slice reuse goes through `src/shared/` or
  `src/core/` only, and only when genuinely generic.

## 6. Verification

Run after every meaningful change, not just at the end:

- `pnpm typecheck`
- `pnpm test:api`
- `pnpm test:ui`

Small, checked steps — verify before moving to the next slice or stage.

## 7. Healing

When verification fails:

- Apply the minimal fix that addresses the root cause (locator drift, timing,
  wrong assertion, stale endpoint) — not a broad rewrite.
- Never make a test pass by weakening or faking the assertion. A test that
  can't validate real behavior should stay red (or be marked
  skipped/known-issue with a reason), not be edited into a false pass.

## 8. Delivery (optional)

- Commit the harness with the version control CLI available (e.g. `git`).
- Optionally create a remote repository and push to `main` using the
  available CLI (e.g. GitHub CLI `gh repo create`), then add a CI workflow
  that runs the verification commands (§6) on push/PR as a required check.
- Never commit secrets, `.env` files, credentials, or generated test reports
  (HTML reports, traces, screenshots from runs).
