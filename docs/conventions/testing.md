# Testing conventions: strict TDD, BDD acceptance tests

Applies to all code, the owner's included. **B** = blocking, **N** = non-blocking.

## Scenarios first, approved before code (B)

1. The spec (`specs/NNN-name.md`) lists its test scenarios: positive, negative and edge cases,
   as Given/When/Then.
2. The spec goes in a **spec-only PR**. The owner approves it before any code PR for it starts.
3. The code PR implements exactly those scenarios. Changing a scenario means changing the spec,
   with the owner's approval. Never change acceptance criteria to make a test pass.

## Strict TDD (B)

Every change to behaviour follows red, green, refactor:

1. **Red.** Write the test first, from the spec. Run it and see it fail for the right reason
   (an assertion or a missing endpoint, not an import typo).
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Clean up with the tests still green.

Paste the red output into the PR under "Red evidence". For the owner's LLM code, TDD means unit
tests against a mocked provider. Quality of LLM behaviour is measured by evals, not unit tests.

Exempt: pure docs, formatting, dependency bumps and config without behaviour. Say so in the PR.

## Coverage gate (B)

- Every acceptance criterion has a test, named or tagged so the reader can match it to the spec.
- At least 80% of **changed lines** are covered. We do not gate on total coverage.

## Test layers and frameworks

| Layer | Checks | Backend | Frontend |
|---|---|---|---|
| Unit and component | One function, model or component | pytest (`tests/test_*.py`) | Vitest + Testing Library + MSW |
| Contract | API schema matches both sides | Schema drift check in CI | Zod validation of responses |
| Acceptance (BDD) | The spec's scenarios, through the public API or UI | pytest-bdd (`tests/features/*.feature`) | Playwright + playwright-bdd (`frontend/e2e/features/*.feature`, steps in `frontend/e2e/steps/`) |
| Accessibility | WCAG 2.1 AA | n/a | axe (`@axe-core/playwright`) |
| Evals | AI behaviour quality | Owner's choice (later) | n/a |

- Each acceptance scenario keeps the spec's wording, so spec and test can be matched by eye.
- Step definitions stay thin: call the API or UI and assert. Logic goes in fixtures or helpers.

## Pipelines

| Pipeline | When | Runs |
|---|---|---|
| Sanity | Every PR push | Lint, types, build, unit, contract, BDD tagged `@smoke` |
| Regression | Merge to `main` | Everything in sanity plus the full BDD and axe suites |
| Evals | Nightly, or the `run-evals` label | Evals (paid API, so never on every PR) |

Tag a scenario `@smoke` when it covers the main happy path of a feature. Aim for one or two per
feature, so sanity stays under about 5 minutes.

## General rules (B)

- Tests are deterministic. No network, no real clock, no randomness without a fixed seed.
- CI never calls paid APIs. Mock the LLM provider behind its Protocol.
- One behaviour per test. Name tests for the behaviour: `test_unknown_environment_is_rejected`.
- Fake languages in tests use made-up codes (`xx` Examplish, `yy` Samplese; `qaa` for axe), so
  tests do not depend on real language data.
- UI tests find elements by role and label. Test ids only when no role fits (**N**). Tests run in
  a fixed locale, so i18n does not break them.
- Never skip, disable or quarantine a test to get green.

Reference examples: `backend/tests/features/health.feature` with
`backend/tests/bdd/test_health_feature.py`, and `frontend/e2e/features/002-main-screen-shell.feature`
with `frontend/e2e/steps/`.

Frontend tests never call the backend: Vitest uses MSW (`src/test/server.ts`), Playwright uses
`page.route` (`e2e/steps/fixtures.ts`).
