# 0003: Neon Auth for sign-in

- **Status:** proposed
- **Date:** 2026-11-28
- **Supersedes:** none

## Context

The login design (Login and ForgotPassword boards) needs email and password, email one-time codes,
Google sign-in and password reset. The FastAPI backend must check who is calling. The database is
Neon Postgres (ADR 0002). Cost must stay near zero.

## Options considered

1. **Neon Auth (managed Better Auth):** generally available; 60,000 monthly active users free per
   project; users stored in our own database (`neon_auth` schema); email and password, email OTP,
   magic link, Google; React + Vite supported; tokens are JWTs checked against a JWKS endpoint.
   MFA is "coming soon" and separate frontend and backend domains are "coming soon"
   ([overview](https://neon.com/docs/auth/overview), [roadmap](https://neon.com/docs/auth/roadmap),
   [JWT guide](https://neon.com/docs/auth/guides/plugins/jwt)).
2. **Cognito Essentials:** 10,000 users free with no expiry, email OTP, passwordless, passkeys, MFA;
   AWS-native; awkward developer experience; email through SES
   ([pricing](https://aws.amazon.com/cognito/pricing)).
3. **Auth0:** 25,000 users free, but MFA and custom login screens are not on the free plan and the
   first paid plan is $35 a month ([pricing](https://auth0.com/pricing)).
4. Ruled out by the owner: Cognito Lite (no email OTP or passwordless), Supabase Auth (tied to
   Supabase's pausing database), writing our own (security risk).

## Decision

Use Neon Auth. Chosen by the owner on 2026-11-28. Cognito Essentials is the fallback.

## Consequences

- **Rule: the API is served on the same origin as the app** (CloudFront routes `/api/*` to the
  backend, as the Vite dev proxy already does), so Neon Auth's session cookies work without the
  separate-domain support that is still coming. If same origin turns out impossible, the frontend
  sends the JWT as a bearer token instead (tokens expire after 15 minutes, so it refreshes often).
- The backend checks tokens itself: fetch the JWKS, verify the EdDSA signature, issuer, audience and
  expiry. There is no official Python SDK, only a reference example, so this check gets its own
  tests. It lives behind an auth adapter; routers receive a plain `User`.
- Users live in our database, so app tables can reference `neon_auth.user` directly, and each
  database branch has its own users for tests.
- Production needs our own email provider: Neon's shared sender is rate-limited and cannot send
  verification links ([production checklist](https://neon.com/docs/auth/production-checklist)).
  Choosing it falls under the new-technology gate.
- Before launch: replace the shared Google OAuth credentials, turn off "Allow Localhost", turn on
  email verification (production checklist).
- No MFA or passkeys until Neon ships them. If they become a requirement first, supersede this
  record with Cognito Essentials; the auth adapter keeps that switch contained.
- Database and auth share one vendor. Better Auth is open source, which gives an exit path; its cost
  has not been checked.
