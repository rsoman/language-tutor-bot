# React + TypeScript conventions (frontend)

Applies to everything under `frontend/`. Shared rules (comments, naming, size, new-tech gate) are
in `code-style.md`. **B** = blocking, **N** = non-blocking.

## Stack

- React + TypeScript + Vite, built as a static site for S3 + CloudFront.
- Package manager: pnpm. Commit `pnpm-lock.yaml`; CI uses `pnpm install --frozen-lockfile`.
- Routing: React Router. Server state: TanStack Query. No global state library until a spec needs one.
- **B** API types and Zod schemas are generated from the backend OpenAPI schema, and API responses
  are validated with Zod at runtime. Do not hand-write API types, except `src/api/tutorTypes.ts`
  (the owner's LLM-output models, until they land).
- Lint: ESLint (typescript-eslint, react-hooks, jsx-a11y). Format: Prettier.
- Unit and component tests: Vitest + Testing Library. End-to-end: Playwright.

Why not Next.js: the app sits behind a login (no SEO need), FastAPI already serves the API and
streaming, and Next needs a Node server, which costs money and adds a second backend. Revisit if
public marketing pages are added. See an ADR if this changes.

## TypeScript

- **B** `strict: true`, plus `noUncheckedIndexedAccess`. No `any`; use `unknown` and narrow.
- **B** No `!` (non-null assertion) without a comment saying why.
- **B** No `// @ts-ignore`. If `// @ts-expect-error` is needed, add a comment saying why.

## Components

- Function components only. One component per file, file named after the component (`ChatPanel.tsx`).
- Folder by feature: `src/features/<feature>/` holds its components, hooks and tests.
  Shared pieces go in `src/components/`.
- Props are typed with a `type <Name>Props`. Avoid prop drilling deeper than two levels; lift to a hook or context.
- **B** Components never call `fetch`. API access goes only through `src/api`, and data fetching
  lives in hooks (`useConversation`).
- **B** Server data through TanStack Query; local UI state through `useState` or `useReducer`.
  A global store needs an ADR.

## Styling and design

- **B** Styling with CSS Modules and design tokens (CSS variables in `src/styles/tokens.css`, the
  only file where hex colours may appear). No inline styles except values computed at runtime.
- Breakpoints: mobile under 640px, tablet 640 to 1023px, desktop 1024px and up (D0004). Mobile first.
- Every screen must work at all three breakpoints. Check `docs/design/` before changing a layout.

## Accessibility

- Semantic HTML first (`button`, `nav`, `main`, `label`). ARIA only when HTML cannot express it.
- Every interactive element is reachable and usable by keyboard, with a visible focus style.
- Text contrast meets WCAG 2.1 AA (4.5:1 for body text).
- **B** Every control has an accessible label, and axe reports no violations.
- **N** Tests query by role and label (`getByRole`), not by test id, unless there is no accessible name.

## Security

- **B** LLM output renders as text. No `dangerouslySetInnerHTML`. Tokens never in `localStorage`.
  More in `security.md`.

## Language-agnostic rule

UI copy that depends on the target language (sample words, level names, article colours) comes
from the API or per-language data, never hard-coded in components.
