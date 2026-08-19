---
name: ai-test-harness-builder
description: Use when bootstrapping or extending a generic Playwright + TypeScript AI test harness from a UI URL and an API URL — covers setup files, foundation code, app discovery, TEST_PLAN.md, generated vertical-slice test slices, healing failing tests, CI, and optional GitHub repo create + push to main.
---

# AI Test Harness Builder

## Overview

Bootstraps and extends an **agent-driven, agent-agnostic** Playwright + TypeScript
E2E test harness for any web application, given only a `UI_URL` and an `API_URL`.
The harness is vertical-slice (one folder per discovered feature), never layered.

## Agent-Agnostic

The portable process lives in [references/workflow.md](references/workflow.md).
This `SKILL.md` is a thin wrapper for agents that support a skill system
(Claude Code, and any other agent that can load skills). Agents without a skill
system should read `references/workflow.md` together with the target repo's
`AGENTS.md` and follow the same steps directly — no skill loader required.

## When to Use

- Starting a brand-new AI test harness for a SUT (UI_URL + API_URL given).
- Extending an existing harness created by this workflow (new slices, healing
  failing tests, adding CI, or delivering via GitHub).
- Any time you need the generic, tool-neutral process instead of ad hoc test
  writing.

## How to Use

1. Read [references/workflow.md](references/workflow.md) in full before doing
   anything else — it is the source of truth for inputs, stage order, the
   vertical-slice layout, and the verification/healing loop.
2. Follow the target repository's own `PROJECT_BRIEF.md`, `CLAUDE.md`, and
   `AGENTS.md` (create them per the workflow if they don't exist yet) — those
   files carry the SUT-specific decisions; this skill only carries the
   reusable process.
3. Do not skip stages: bootstrap → foundation → discovery → `TEST_PLAN.md` →
   slices → verification → healing → delivery. Do not write feature-specific
   test code before `TEST_PLAN.md` exists.

## Key Constraint

The generated harness is **vertical-slice**, never layered: features live in
`src/features/<slice>/` with co-located specs. `src/pages/`, `src/services/`,
`src/flows/`, `src/data/`, `src/tests/` are forbidden. See
[references/workflow.md](references/workflow.md) for the full layout rule and
why it matters.
