# CLAUDE.md (frontend)

Read the root `CLAUDE.md` first. This file adds frontend rules.

- Conventions: `docs/conventions/react.md`. Testing: `docs/conventions/testing.md`.
- Before building or changing a screen, check `docs/design/` and the design canvas linked there.
  Accepted design records are rules, not suggestions.
- Stack: React + TypeScript (strict) + Vite, pnpm. Run commands from `frontend/`.
- Checks before a PR: `pnpm lint && pnpm typecheck && pnpm test` (and `pnpm e2e` when Playwright tests exist).
- Colours, spacing and fonts come from `src/styles/tokens.css`. Never hard-code a hex value in a component.
- Target-language content (words, level names, articles) comes from the API, never from component code.
- API types are generated (`pnpm gen:api`), never hand-written.

The app itself is created by the first frontend spec. Until then this folder holds only this file.
