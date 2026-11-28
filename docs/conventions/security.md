# Security rules

Applies to all code and infrastructure. **B** = blocking, **N** = non-blocking.

## Secrets (B)

- Never commit secrets, keys or `.env`. New settings go in `.env.example` with a safe example value.
- CI secrets live in GitHub Actions secrets. Runtime secrets live in AWS SSM Parameter Store
  (standard tier).
- gitleaks runs in the pre-push hook and in CI. GitHub push protection is on.
- Logs never contain tokens, keys or passwords.

## Dependencies

- **B** Lockfiles are committed (`uv.lock`, `pnpm-lock.yaml`). CI installs from them only.
- **B** `pnpm audit --audit-level high` runs in CI. `pip-audit` runs too and fails on any known
  vulnerability, since it has no severity filter.
- **N** Dependabot opens update PRs weekly.
- **B** Every new dependency has a one-line reason in the PR. A new tool or framework goes through
  the new-technology gate (`code-style.md`).

## Authentication and authorization (B)

- Every endpoint requires auth by default. Public endpoints are listed in one allowlist.
- The backend checks the JWT signature, expiry, issuer and audience against the provider's JWKS.
- Ownership checks live in the service layer.
- Every protected endpoint has a test for 401 (no or bad token) and 403 (another user's data).
- Frontend: tokens stay in memory or HttpOnly cookies, never `localStorage`.

## Input and LLM output (B)

- Pydantic models put length and value limits on every user-supplied field.
- User text never goes into a system prompt. It goes only in user turns.
- LLM output renders as text. No `dangerouslySetInnerHTML`, no Markdown-to-HTML without a sanitizer.
- Prompt-injection defenses and token budgets are the owner's guardrails area.

## Web (B)

- A CloudFront response headers policy sets CSP, HSTS, `X-Content-Type-Options` and
  `Referrer-Policy`.
- Cookies are HttpOnly, Secure and SameSite=Lax.
- CORS stays off, since the API is same-origin (ADR 0003).

## Privacy (B)

- Store the minimum PII: email only.
- Logs and traces never hold raw conversations with PII. Redact before sending anything to an
  observability tool.
- Deleting an account deletes its data.

## Static analysis (B)

- ruff's `S` (bandit) rules are on for backend code.
- CodeQL runs on every PR. High or critical findings block.

## Cost abuse (B)

- LLM endpoints have a rate limit per user.
- AWS budget alarms at $5 and $10.
