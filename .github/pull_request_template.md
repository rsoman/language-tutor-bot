## Spec

Closes `specs/NNN-name.md` (or: no spec, because ...)

- [ ] Spec-only PR (scenarios for approval, no code), or
- [ ] Code PR for an approved spec: #<spec PR>

## What changed

-

## TDD

- [ ] Tests were written before the implementation.
- [ ] Each spec scenario (positive, negative, edge) has a matching test.
- [ ] At least 80% of changed lines covered.
- [ ] Not applicable: docs, formatting or dependency-only change.

### Red evidence

Paste the failing test output from before the implementation.

```
```

## Checks

- [ ] Pre-push hook passed (no `--no-verify`).
- [ ] UI change: before and after screenshots below, or not applicable.
- [ ] Under about 400 changed lines (excluding generated files and lockfiles), or reason: ...
- [ ] New dependency: one-line reason given. New tool or framework: ADR and style section added.

- [ ] Lint, format, types and tests pass locally.
- [ ] No target language hard-coded outside `languages.py` and per-language data.
- [ ] No paid API calls in tests. No secrets or `.env` committed.
- [ ] Hand-written areas (LLM layer, prompts, RAG, evals, guardrails) untouched, or the spec allows it.

## Decisions

ADRs or design records added or affected (`docs/adr/`, `docs/design/`):
