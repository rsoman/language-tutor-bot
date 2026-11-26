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
- After a backend API change, run `bash scripts/export-openapi.sh` and commit `openapi.json` and `src/api/schema.d.ts`.
- BDD scenarios live in `e2e/features/` (copied word for word from the spec), steps in `e2e/steps/`.
  Tests use fake languages (`xx`, `yy`), never real ones.

The app was created by `specs/002-main-screen-shell.md`.
