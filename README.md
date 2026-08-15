# OmniPizza E2E Harness

AI-driven Playwright + TypeScript E2E test harness. This workspace is the test
harness itself, not the application under test. See `PROJECT_BRIEF.md` for the
mission and `AGENTS.md` for the architecture rules an AI agent must follow here.

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm install:browsers
```

## Scripts

| Script                | Description                                      |
|------------------------|---------------------------------------------------|
| `pnpm test`            | Run the full test suite (all projects)            |
| `pnpm test:ui`         | Fast feedback loop, `ui-chromium` only            |
| `pnpm test:cross`      | Full UI matrix (chromium/firefox/webkit/mobile)   |
| `pnpm test:firefox`    | `ui-firefox` project only                         |
| `pnpm test:webkit`     | `ui-webkit` project only                          |
| `pnpm test:mobile`     | `ui-mobile-chrome` + `ui-mobile-safari`           |
| `pnpm test:api`        | `api` project only                                |
| `pnpm test:smoke`      | Tests tagged `@smoke`, `ui-chromium` only          |
| `pnpm test:headed`     | Run with a visible browser window                 |
| `pnpm typecheck`       | Type-check with `tsc --noEmit`                    |
| `pnpm report`          | Open the last HTML report                         |
| `pnpm install:browsers`| Install Playwright browsers and OS dependencies   |

## Status

This is the **foundation** only: core utilities, config, and fixtures. No
application-specific feature code exists yet.

## Next steps

1. Run `prompts/03-test-plan.md` to discover the SUT and produce `TEST_PLAN.md`.
2. Run `prompts/04-slice-generator.md` to generate feature slices from `TEST_PLAN.md`.
