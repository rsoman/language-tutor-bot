# React + TypeScript conventions (frontend)

Applies to everything under `frontend/` (created in the first frontend spec).

## Stack

- React + TypeScript + Vite, built as a static site for S3 + CloudFront.
- Package manager: pnpm. Commit `pnpm-lock.yaml`; CI uses `pnpm install --frozen-lockfile`.
- Routing: React Router. Server state: TanStack Query. No global state library until a spec needs one.
- API types are generated from the backend OpenAPI schema with `openapi-typescript`. Do not hand-write API types.
- Lint: ESLint (typescript-eslint, react-hooks, jsx-a11y). Format: Prettier.
- Unit and component tests: Vitest + Testing Library. End-to-end: Playwright.

Why not Next.js: the app sits behind a login (no SEO need), FastAPI already serves the API and
streaming, and Next needs a Node server, which costs money and adds a second backend. Revisit if
public marketing pages are added. See an ADR if this changes.

## TypeScript

- `strict: true`, plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow.
- No `// @ts-ignore`. If `// @ts-expect-error` is needed, add a comment saying why.

## Components

- Function components only. One component per file, file named after the component (`ChatPanel.tsx`).
- Folder by feature: `src/features/<feature>/` holds its components, hooks and tests.
  Shared pieces go in `src/components/`.
- Props are typed with a `type <Name>Props`. Avoid prop drilling deeper than two levels; lift to a hook or context.
- Keep components presentational where possible. Data fetching lives in hooks (`useConversation`).

## Styling and design

- Design tokens (colours, spacing, radii, fonts) are CSS variables in `src/styles/tokens.css`,
  taken from the design canvas. Components never hard-code a hex colour.
- Breakpoints: mobile under 640px, tablet 640 to 1024px, desktop 1024px and up. Mobile first.
- Every screen must work at all three breakpoints. Check `docs/design/` before changing a layout.

## Accessibility

- Semantic HTML first (`button`, `nav`, `main`, `label`). ARIA only when HTML cannot express it.
- Every interactive element is reachable and usable by keyboard, with a visible focus style.
- Text contrast meets WCAG 2.1 AA (4.5:1 for body text).
- Tests query by role and label (`getByRole`), not by test id, unless there is no accessible name.

## Language-agnostic rule

UI copy that depends on the target language (sample words, level names, article colours) comes
from the API or per-language data, never hard-coded in components.
