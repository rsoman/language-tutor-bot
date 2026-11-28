# Architecture guide (backend and system)

A living guide: how we build here. ADRs in `docs/adr/` record why. When a rule here comes from an
ADR, it links it. Frontend structure rules are in `react.md`.
**B** = blocking, **N** = non-blocking.

## System shape

- Static React app on S3 + CloudFront. The API is served on the **same origin** under `/api/*`
  through CloudFront (ADR 0003). No CORS.
- FastAPI backend on AWS. Data in Neon Postgres with pgvector (ADR 0002). Auth by Neon Auth
  (ADR 0003), with Cognito Essentials as the fallback.
- Neon: one project per environment, `vaikhari-dev` (plus a branch per PR) and `vaikhari-prod`.

## Backend layers (B)

Dependencies point inward. A layer may import only the layers below it.

| Layer | Folder | Does | Never does |
|---|---|---|---|
| Routers | `src/tutor/routers/` | HTTP only: parse the request, call one service, map domain errors to HTTP errors | Business logic, SQL, LLM calls |
| Services | `src/tutor/services/` | The tutor's logic, as plain functions or small classes | Know about HTTP, tokens or SQL |
| Adapters | `src/tutor/adapters/` | Talk to the outside world (LLM provider, database, vector store, auth keys), each behind a `Protocol` | Hold business rules |

- Ports and adapters only where we expect to swap something (LLM provider, storage, auth).
  Elsewhere, plain functions.
- Wiring happens in `create_app()` and FastAPI dependencies, so tests can override any adapter.

## Auth (B)

- A FastAPI dependency checks the JWT against the provider's JWKS on each request and hands the
  router a plain `User`. Services never see tokens.
- Every router requires auth by default. Public endpoints are listed in one allowlist.
- Ownership checks (does this user own this conversation?) live in services.
- On the frontend, sign-in goes through one auth module. Details: `security.md`.

## Data (B)

- Services call repository interfaces (`MistakeHistory.save()`), not the database.
- API models (Pydantic `*In` / `*Out`) stay separate from storage models, so a table change does
  not break the API contract.
- Schema changes go only through migrations. The migration tool is picked when the first table
  lands, through the new-technology gate.

## Schema consistency (B)

One source of truth: Pydantic models produce the OpenAPI schema, which generates the frontend's TS
types and Zod schemas. The frontend validates API responses with Zod at runtime. CI regenerates
and fails if the committed output differs. The exception is the owner's LLM-output models, mirrored
in `frontend/src/api/tutorTypes.ts` until they land (root `CLAUDE.md`).

## AI-specific rules (B)

- The LLM provider sits behind a `Protocol`. No provider SDK import outside its adapter.
- Prompts live in their own files, never as inline strings in code.
- Every LLM call has a timeout, a retry policy and a token cap.
- LLM output is parsed and validated against a schema before use. Never trust raw text.
- These areas are the owner's to write (root `CLAUDE.md`). Claude describes, does not implement.

## Anti-patterns (B unless marked)

- Business logic in routers.
- Loose dicts crossing a layer boundary instead of models.
- Prompts as inline strings, LLM calls without timeout, retry or cost cap.
- Trusting LLM output without schema validation.
- Global mutable state (module-level caches, singletons that change).
- Catching broad exceptions and carrying on silently.
- **N** Abstractions with one implementation and no planned second one.

This list grows. Add to it when a review finds a new one.
