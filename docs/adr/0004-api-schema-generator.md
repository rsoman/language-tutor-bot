# 0004: Generate frontend types and Zod schemas with orval

- **Status:** proposed
- **Date:** 2026-11-28
- **Supersedes:** none

## Context

`react.md` and `architecture.md` (schema consistency, blocking) say the frontend's API types and
Zod schemas are generated from the backend's OpenAPI schema, API responses are validated with Zod
at runtime, and CI fails when the committed output is out of date. Until now the frontend (spec
002, PR #3) used `openapi-typescript`, which generates types only. The owner chose on 2026-11-28 to
add Zod in spec 002 and PR #3. Picking a generator falls under the new-technology gate.

## Options considered

1. **orval** (8.x): generates TypeScript types, Zod schemas, fetch or TanStack Query clients and
   MSW mocks from one config. Stable major version. Larger config surface than we need today.
2. **Hey API** (`@hey-api/openapi-ts`, 0.99): types, a fetch client and a Zod plugin. Still before
   1.0, so breaking changes between minor versions are likely.
3. **openapi-typescript plus a separate Zod generator** (for example `openapi-zod-client`): keeps
   today's types, but two tools can drift from each other on the same schema.

## Decision

Proposed: use orval to generate Zod schemas only, and take the TypeScript types from them with
`z.infer`, so types and runtime checks have one source. Drop `openapi-typescript`. The API client
stays our own small `fetch` wrapper, which parses every response with the generated schema.

## Consequences

- `pnpm gen:api` runs orval instead of `openapi-typescript`. Output is committed, and CI
  regenerates it and fails on any difference.
- A response with the wrong shape throws a typed error, which the screens show as their normal
  failure state (for example "Languages unavailable"). Spec 002 has a scenario for it.
- The owner's LLM-output models stay hand-mirrored in `src/api/tutorTypes.ts` until they land, as
  `react.md` already allows. They get hand-written Zod schemas there too.
- orval's client and MSW generators are not used yet. Turning either on later needs only a note in
  the PR, not a new ADR.
- `react.md` gets a short orval section in the same PR (new-technology gate).
- Not verified yet: that orval's Zod output handles our nullable fields and enums cleanly. Check it
  in #3 before accepting this record; if it does not, fall back to option 2.
