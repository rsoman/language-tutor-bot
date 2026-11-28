# CLAUDE.md (frontend)

Loaded when Claude works on files under `frontend/`. Read the root `CLAUDE.md` first.

- Stack: React + TypeScript (strict) + Vite, pnpm. Run commands from `frontend/`.
- Checks before a push: `pnpm lint && pnpm typecheck && pnpm test`, plus `pnpm e2e` for UI changes.
- Before building or changing a screen, check `docs/design/` and the design canvas linked there.
  Accepted design records are rules, not suggestions.
- API Zod schemas are generated with orval (`bash scripts/export-openapi.sh`, ADR 0004), and types
  come from them with `z.infer`. Never hand-write them, except `src/api/tutorTypes.ts` (see root
  `CLAUDE.md`, who writes what). After a backend API change, run the script and commit
  `openapi.json` and `src/api/generated/`. CI fails if they are out of date.
- BDD scenarios live in `e2e/features/` (copied word for word from the spec), steps in `e2e/steps/`.
  Tests use fake languages (`xx`, `yy`; `qaa` for axe), never real ones.

@../docs/conventions/code-style.md
@../docs/conventions/react.md
@../docs/conventions/testing.md
@../docs/conventions/security.md
