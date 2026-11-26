# Testing conventions: strict TDD, BDD acceptance tests

## The rule: strict TDD

Every change to behaviour follows red, green, refactor:

1. **Red.** Write the test first, from the spec. Run it and see it fail for the right reason
   (an assertion or a missing endpoint, not an import typo).
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Clean up with the tests still green.

For Claude Code this means: commit or show the failing test run before writing the implementation,
and paste the red output into the PR under "Red evidence". A PR that adds behaviour without new
tests is not ready for review.

Exempt: pure docs, formatting, dependency bumps and config that has no behaviour. Say so in the PR.

## Two layers of tests

| Layer | What it checks | Backend | Frontend |
|---|---|---|---|
| Acceptance (BDD) | The spec's Given/When/Then criteria, through the public API or UI | pytest-bdd: `tests/features/*.feature` + `tests/bdd/test_*_feature.py` | Playwright with playwright-bdd: `frontend/e2e/features/*.feature` + `frontend/e2e/steps/*.ts` |
| Unit and component | One function, model or component | pytest: `tests/test_*.py` | Vitest + Testing Library |

- Each acceptance criterion in a spec becomes one Gherkin scenario. Keep the wording identical so
  a reader can match spec to test.
- Step definitions stay thin: they call the API or UI and assert. Logic goes in fixtures or helpers.
- Unit tests cover edge cases that would make the feature file noisy.

Whether every spec must have BDD scenarios is not enforced yet (decision deferred, 2026-11-26).
New specs should use Given/When/Then criteria anyway, so converting is cheap.

See `backend/tests/features/health.feature` and `backend/tests/bdd/test_health_feature.py` for
the backend reference example, and `frontend/e2e/features/002-main-screen-shell.feature` with
`frontend/e2e/steps/` for the frontend one (spec 002 chose playwright-bdd, 2026-11-26).

Frontend tests never call the backend: Vitest uses MSW (`src/test/server.ts`), Playwright uses
`page.route` (`e2e/steps/fixtures.ts`).

## General rules

- Tests are deterministic. No network, no real clock, no randomness without a fixed seed.
- CI never calls paid APIs. Mock the LLM provider behind its Protocol.
- One behaviour per test. Name tests for the behaviour: `test_unknown_environment_is_rejected`.
- Do not change a spec's acceptance criteria to make a test pass. Change the code, or raise it with the owner.
- Fake languages in tests use made-up codes (`xx`) so tests do not depend on real language data.
