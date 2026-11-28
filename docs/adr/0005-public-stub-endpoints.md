# 0005: Stub endpoints stay public until auth lands

- **Status:** accepted (2026-11-28, PR #20)
- **Date:** 2026-11-28
- **Supersedes:** none

## Context

`security.md` says every endpoint requires auth by default, with public endpoints on one allowlist,
and every protected endpoint has 401 and 403 tests. Specs 003 to 006 add endpoints (conversations,
word lookup, scenarios, grammar topics) whose logic the owner writes later. Until then they validate
input and answer 501, and they return no data. Auth (Neon Auth, ADR 0003) has no spec or code yet,
so there is nothing to test 401 or 403 against.

## Options considered

1. **Allow the 501 stubs to be public, with a guard test.** The frontend can be built against the
   contract now; the risk is a stub gaining logic while still public.
2. **Build auth first.** Rule-clean, but blocks specs 003 to 006 behind an auth spec that is not
   written yet.
3. **Allow it without a record.** The exception would live only in spec prose and be easy to forget.

## Decision

Option 1, chosen by the owner on 2026-11-28. An endpoint may sit on the public allowlist only while
it answers 501. The allowlist lives in one module in the backend, and each entry names the spec that
will protect it.

## Consequences

- **Guard test (blocking):** a backend test calls every allowlisted stub route with valid input and
  fails if it answers anything other than 501. Giving a stub real logic therefore breaks CI until
  the route leaves the allowlist and gets auth, 401 and 403 tests, and (for LLM endpoints) the
  per-user rate limit from `security.md`.
- Specs 003 to 006 list their endpoints under this exception in Out of scope.
- The auth spec removes these routes from the allowlist. When the allowlist holds no stubs, this
  record is superseded by that spec's ADR or marked done.
- `GET /health` and `GET /languages` are not stubs and are outside this record. Whether they stay
  public is for the auth spec to decide.
