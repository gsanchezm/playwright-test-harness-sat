# AGENTS.md

Instructions for any AI agent (Claude Code or otherwise) working in this repository.
This is a **vertical-slice** Playwright + TypeScript E2E harness. Read this file
before creating or modifying any file.

## Folder Tree (generic, foundation stage)

```
harness/
├── AGENTS.md
├── PROJECT_BRIEF.md
├── TEST_PLAN.md              (created later, see prompts/03-test-plan.md)
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── .env.example
├── .gitignore
├── README.md
└── src/
    ├── core/
    │   ├── env.ts             (Singleton: frozen env config)
    │   ├── BasePage.ts        (Template Method: shared page behavior)
    │   ├── BaseService.ts     (Template Method: shared API client behavior)
    │   └── reporter.ts        (Observer: custom reporter hooks)
    ├── shared/
    │   ├── fixtures.ts        (DI: Playwright test/expect composition root)
    │   ├── types.ts           (generic reusable types)
    │   ├── data/               (shared JSON data-driven fixtures)
    │   └── MenuPage.ts         (created ONLY when TEST_PLAN.md confirms shared nav)
    └── features/
        └── <slice>/            (one folder per discovered feature, e.g. "cart", "checkout")
            ├── <slice>.page.ts        (POM, if the slice has UI)
            ├── <slice>.service.ts     (API client, if the slice has API calls)
            ├── <slice>.flow.ts        (Facade combining page/service steps)
            ├── <slice>.factory.ts     (only for complex discovered entities)
            ├── <slice>.spec.ts        (UI specs, co-located)
            └── <slice>.api.spec.ts    (API specs, co-located)
```

Specs are **co-located** inside their slice. There is **no** separate top-level
`tests/` folder. Every file a slice needs — page, service, flow, factory/builder,
specs, data — lives inside `src/features/<slice>/`.

## Mandatory Layout

The only children of `src/` are:
- `src/core/`
- `src/shared/` (with `src/shared/data/`)
- `src/features/<slice>/`

The only shared cross-feature POM allowed is a flat `src/shared/MenuPage.ts`,
created later, only when `TEST_PLAN.md` confirms a shared navigation component
exists. Never create a `src/shared/pages/` folder.

## Forbidden Layout

This is a vertical-slice harness, **not** a layered one. Never create:
- `src/pages/`
- `src/services/`
- `src/flows/`
- `src/data/`
- `src/tests/` (including `src/tests/ui/` and `src/tests/api/`)

If you catch yourself about to create any of these, stop and put the file
inside its feature slice instead.

## Playwright Projects

`playwright.config.ts` runs `fullyParallel` with a cross-browser + responsive
UI matrix:
- `ui-chromium`, `ui-firefox`, `ui-webkit`
- `ui-mobile-chrome`, `ui-mobile-safari` (responsive viewport, exercises the
  `-responsive` testid branch when one exists)
- `api` — a single, browserless project for `**/*.api.spec.ts`

## Pattern-to-Home Table

| Pattern            | Home                                   | When created                          |
|---------------------|-----------------------------------------|----------------------------------------|
| Page Object (POM)   | `src/features/<slice>/<slice>.page.ts`  | After UI discovery for that slice      |
| Shared nav POM      | `src/shared/MenuPage.ts`                | Only if TEST_PLAN.md confirms a menu   |
| Service/Adapter     | `src/features/<slice>/<slice>.service.ts` | After API discovery for that slice   |
| Flow (Facade)       | `src/features/<slice>/<slice>.flow.ts`  | From TEST_PLAN.md scenarios            |
| Factory/Builder     | `src/features/<slice>/<slice>.factory.ts` or `.builder.ts` | Only for complex discovered entities |
| Template Method     | `src/core/BasePage.ts`, `src/core/BaseService.ts` | Foundation stage (this file set) |
| Singleton           | `src/core/env.ts`                       | Foundation stage                       |
| Observer            | `src/core/reporter.ts`                  | Foundation stage                       |
| DI composition root | `src/shared/fixtures.ts`                | Foundation stage, expanded per slice   |

## Export Naming Rules

- Page objects: `<DiscoveredName>Page`, e.g. `MenuPage`, `CartPage`.
- Services: `<DiscoveredName>Service`, e.g. `CartService`.
- Flows: `<DiscoveredName>Flow`, e.g. `CheckoutFlow`.
- Factories: `<DiscoveredEntity>Factory`, only when real test data creation is needed.
- Builders: `<DiscoveredEntity>Builder`, only when the entity is complex.
- `env.ts` exports a frozen `env` object (named export).
- `reporter.ts` uses a default export.

## Locator Rules

- Prefer `getByRole`, `getByLabel`, `getByTestId`, in that order of preference,
  over CSS/XPath selectors.
- Never use brittle selectors (nth-child, deep CSS chains) when a role/label/testid
  locator is available.
- No `waitForTimeout`. Use web-first, auto-retrying assertions
  (`expect(locator).toBeVisible()`, etc.) instead of manual waits.
- Locators belong inside page objects, never inline in spec files.

## API Rules

- All HTTP calls go through a `<Slice>Service` extending `BaseService`.
- Services never import Playwright's `Page`; they use Playwright's `APIRequestContext`.
- API base URL comes from `env.apiUrl`, never hard-coded.
- Specs assert on response status and shape, not on internal service implementation.

## SOLID / DRY / KISS Rules

- Single Responsibility: one page object per screen/component, one service per
  resource, one flow per user journey.
- Open/Closed: extend `BasePage`/`BaseService`, do not modify them for
  feature-specific behavior.
- Dependency Inversion: specs depend on fixtures (`src/shared/fixtures.ts`),
  never construct page objects/services directly.
- DRY: shared behavior lives in `src/core`; do not copy-paste waits or navigation
  logic across slices.
- KISS: no speculative abstractions. Build the simplest thing that satisfies the
  current TEST_PLAN.md scenario.

## Vertical Slicing Rules

- A "slice" is one discovered feature/domain area (e.g. `menu`, `cart`, `checkout`).
- Everything a slice needs lives inside `src/features/<slice>/`.
- Slices do not import from other slices. Cross-slice reuse goes through
  `src/shared/` or `src/core/` only, and only when genuinely generic.
- A new slice is created only when TEST_PLAN.md names it.

## Clean Code Rules

This is Clean Code practice, **not** layered Clean Architecture. Keep the
core/shared/features split; do not introduce architectural layers.

- Intention-revealing names for files, classes, functions, and variables.
- Small, single-purpose units: one class/function does one thing.
- Guard clauses / early returns instead of deep nesting.
- Avoid comments that restate the code; comment only non-obvious rationale, in Spanish.

## Test Design Rules

- Assert one behavior per test: 1 assertion, at most 2.
- Web-first sync waits (`expect(locator).toBeVisible()`) do **not** count toward
  the assertion limit, nor do named page/flow assertion methods (e.g. `expectLoaded()`).
- A unit object-shape test (builder/factory) uses a single object assertion
  (`toEqual`/`toMatchObject`).

## Data-Driven Rule

When test cases differ only by input, implement **one** parametrized test over
typed data from `src/shared/data/*.json`:

```ts
for (const c of cases) {
  test(`...${c.name}`, async () => { ... })
}
```

Do not write near-duplicate tests that differ only in literal values.

## Token Efficiency Rules

- Read only the files needed for the current task.
- Avoid re-reading large files that have not changed.
- Prefer targeted edits over full-file rewrites.
- Summarize long tool output instead of repeating it verbatim.

## Discovery Rule

Application features, auth strategy, shared menu/navigation, entities, and test
data are **not** known yet at this stage. They are discovered later from
`TEST_PLAN.md` (see `prompts/03-test-plan.md` and `prompts/04-slice-generator.md`).
Do not guess or pre-build app-specific code before that file exists.
