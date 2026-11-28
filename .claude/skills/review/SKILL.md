---
name: review
description: Review a Vaikhari pull request or local diff against the project rulebook, with blocking and non-blocking findings. Use for every PR review, by hand or in CI.
---

# Review against the Vaikhari rulebook

1. Get the diff. For a PR: `gh pr diff <number>` and `gh pr view <number>`. Locally:
   `git diff origin/main...HEAD`.
2. Read `docs/conventions/review.md`. It says which other rule files to load for the folders the
   diff touches. Load only those.
3. Find the spec the PR names (`specs/NNN-name.md`). If a code PR has no approved spec, that is a
   blocking finding.
4. Work through the checklist in `review.md` in order: spec match, functional, technical, tests,
   checks, security, ownership, gates. For checks, read the CI results and test report.
5. Report in the format in `review.md`. Every finding cites the rule (file and section) or spec line
   it breaks. Mark it blocking only when it breaks a **B** rule, a spec criterion, an accepted record,
   or is a real bug or security hole.
6. Do not report what ruff, pyright, ESLint or Prettier already enforce.
7. If you are not sure a finding is real, say so and mark it non-blocking.
