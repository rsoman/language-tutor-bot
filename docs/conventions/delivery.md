# Delivery: threads, branches, PRs, CI and deployment

Applies to every change. **B** = blocking, **N** = non-blocking.

## One task per conversation (B)

- One spec (or one fix) per Claude thread. The thread ends when its PR is merged.
- Hand off through files, not chat: the spec, the PR description and project memory. A new thread
  reads those, not old conversations.
- Follow-ups on a PR (CI, review fixes) stay in that PR's thread.

Why: every turn re-sends the whole conversation, so cost grows with context size times turns, and
compaction loses detail that then gets re-read.

## Feature flow

1. Spec-only PR with the scenarios (`testing.md`). Owner approves.
2. Code PR: red tests first, then implementation, then refactor.
3. Verify before push (below), open the PR from the template, assign the owner.
4. Reviewer agent and owner review. Fixes go as new commits; no history rewrites on pushed work.
5. Merge.

## Branches (B)

- Short-lived branches off `main`, merged quickly.
- Stack a PR on another only when it truly depends on it, at most two deep.

## Pull requests

- **B** Merge needs: CI green, no blocking findings from the reviewer agent, and the owner's approval.
- **N** About 400 changed lines at most, not counting generated files and lockfiles. Bigger needs a
  reason in the PR or a split.
- **B** Fill in `.github/pull_request_template.md`, including red evidence and, for UI changes,
  a link to the screenshots.
- **B** Screenshots are not committed. The frontend CI job takes Playwright screenshots of the
  changed screens at the three D0004 breakpoints and uploads them as a run artifact (a zip). The PR
  links to the run for "after" and to the latest `main` run for "before" (none for a new screen).
  GitHub deletes artifacts after 90 days by default, so the screenshots are review evidence only,
  not a record.

## Verify before push (B)

"Done" means the checks passed, not "I think it works". The pre-push hook (`.githooks/pre-push`)
runs on every push:

- conflict markers in tracked files
- gitleaks (if installed)
- backend, when `backend/` changed: ruff, ruff format check, pyright, pytest
- frontend, when `frontend/` changed: lint, typecheck, unit tests

Turn it on once per clone: `git config core.hooksPath .githooks`. Never bypass it with `--no-verify`.
Run e2e tests yourself before pushing UI changes; they are too slow for the hook.

## CI

Pipelines are listed in `testing.md`. Workflows live in `.github/workflows/`:

- `ci.yml`: sanity checks on every PR, regression on `main`.
- `codeql.yml`: static analysis.
- `review.yml`: the reviewer agent (`review.md`).

## Deployment

- Two environments. `dev` deploys on every merge to `main`. `prod` deploys from a tagged release,
  by hand at first.
- Rollback means redeploying the previous tag.
- Database migrations run before the app deploys, and must work with the previous app version
  (add first, remove later).
