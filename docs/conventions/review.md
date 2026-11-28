# Code review rules

Every PR gets two reviews: the reviewer agent (automated, `.github/workflows/review.yml`) and the
owner. Same rules for hand-written and generated code, Claude's PRs included.

## Severity

- **Blocking:** breaks a **B** rule in any conventions file, a spec criterion, an accepted ADR or
  design record, or is a bug or security hole. The PR cannot merge.
- **Non-blocking:** an **N** rule, a readability suggestion or a nit. The author decides.

Every finding names the rule or spec line it comes from. A finding without a source is a nit.

## What the review checks

Load only the files the diff touches: `python.md` and `architecture.md` for `backend/`,
`react.md` for `frontend/`, plus always `code-style.md`, `testing.md`, `security.md` and
`delivery.md`.

1. **Spec match.** Every acceptance criterion and spec detail (contract, fields, errors, copy) is
   implemented, and nothing outside the spec's scope was added. List each criterion with the test
   that covers it.
2. **Functional verification.** The code does what the scenarios say, including negative and edge
   cases. Look for wrong conditions, missing error handling, off-by-one, race conditions.
3. **Technical verification.** Layering, schema consistency, anti-patterns (`architecture.md`),
   and style rules the linters cannot catch.
4. **Tests.** Red evidence is present. Tests cover positive, negative and edge cases. No skipped
   tests. Coverage of changed lines is at least 80%.
5. **Checks.** Lint, format, types, build and tests passed in CI. Read the test report, not just
   the green tick.
6. **Security.** `security.md`, especially secrets, auth on new endpoints, and LLM output rendering.
7. **Ownership.** Owner-only areas (root `CLAUDE.md`) untouched unless the spec allows it.
8. **Gates.** No new tech without ADR and style section. No hard-coded target language.

## Output format

Post one summary comment:

```
Verdict: BLOCKED | PASS
Blocking: N   Non-blocking: M

Spec criteria
- <criterion> -> <test name> (ok | missing)

Blocking
1. <file:line> <finding> (rule: <file#section>)

Non-blocking
1. ...
```

Put file-specific findings as inline comments too. Do not repeat what the linters already report.

## For the owner

The agent's PASS does not replace your review. Check the spec match and the design first; the
agent is weakest at "is this the right thing to build".
