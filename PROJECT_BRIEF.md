# Project Brief

## Mission
Build an external, AI-assisted end-to-end (E2E) test harness using Playwright and
TypeScript, driven by Claude Code, for the system under test (SUT) described below.
This workspace is the harness itself, not the application under test.

## Target System Under Test
- UI URL: https://omnipizza-frontend.onrender.com/
- API URL: https://omnipizza-backend.onrender.com

## Toolchain
- Node.js (LTS)
- pnpm as the package manager
- Playwright + TypeScript for E2E tests
- Claude Code as the AI driver, using the Playwright MCP server
- git for version control

## Architecture Goals
- Keep the harness generic: it must adapt to any SUT by changing UI_URL and API_URL.
- Do not hard-code application-specific feature names into shared harness code.
- Prefer small, composable, verifiable pieces (fixtures, page objects, API clients)
  over large, monolithic test files.
- Keep configuration (base URLs, timeouts, env-specific values) out of test bodies.

## Quality Rules
- Every change should be small and independently verifiable.
- Prefer clear, explicit failures over silent fallbacks.
- Do not commit secrets, credentials, or generated reports.
- Tests must be deterministic; avoid relying on fixed wait times where possible.

## Token Efficiency Rules
- Read only the files needed for the current task.
- Avoid re-reading large files that have not changed.
- Prefer targeted edits over full-file rewrites.
- Summarize long tool output instead of repeating it verbatim.

## Required Workflow
After the foundation (src/, package.json, playwright.config.ts) is created, and
before implementing any feature test slices, the AI must create TEST_PLAN.md.
TEST_PLAN.md must list the UI and API test cases to implement, and must confirm
the API endpoints to be used against the API URL above.
