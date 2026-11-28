# CLAUDE.md

Rules for Claude Code in this repo. This file holds only the rules that apply everywhere.
Area rules load on demand: `backend/CLAUDE.md` and `frontend/CLAUDE.md` load when you touch files
there, and pull in their rulebooks. The same rules bind the owner's hand-written code.

## What this repo is

Vaikhari, a study project: a language tutor chat bot (one language at A1 first, more later).
The owner is learning AI engineering, Python and FastAPI. Code must be readable and teachable,
not clever.

## Rulebook

| Area | File | Loaded |
|---|---|---|
| Shared code style, new-tech gate | `docs/conventions/code-style.md` | by both folder CLAUDE.md files |
| Python and FastAPI | `docs/conventions/python.md` | by `backend/CLAUDE.md` |
| Backend and system architecture | `docs/conventions/architecture.md` | by `backend/CLAUDE.md` |
| React and TypeScript | `docs/conventions/react.md` | by `frontend/CLAUDE.md` |
| Testing (scenarios first, strict TDD, BDD) | `docs/conventions/testing.md` | by both |
| Security | `docs/conventions/security.md` | by both |
| Threads, branches, PRs, CI, deploy | `docs/conventions/delivery.md` | read before any git or PR step |
| Code review | `docs/conventions/review.md` | by the `review` skill |
| ADRs and design records | `docs/conventions/adr-and-design.md` | read before writing one |

Architecture decisions are in `docs/adr/`, UI and product rules in `docs/design/`.

## Blocking rules everywhere

1. **One task per thread.** Hand off through the spec, the PR and project memory.
2. **Spec first.** Every feature starts from `specs/NNN-name.md`, whose test scenarios (positive,
   negative, edge) the owner approves in a spec-only PR before any code.
3. **Strict TDD.** Tests from the spec first, shown failing, then the code. Never change acceptance
   criteria to make tests pass. Never skip a test to get green.
4. **Verify before push.** The pre-push hook must pass (`git config core.hooksPath .githooks`).
5. **Decisions.** Check `docs/adr/` and `docs/design/` before changing architecture or UI. To go
   against an accepted record, propose a new one.
6. **New-tech gate.** No new language, framework or tool without an ADR and its own style section.
   Remind the owner when new tech comes up.
7. **Language-agnostic.** Never hard-code a target language in code, prompts or tests outside
   `backend/src/tutor/languages.py` and per-language data folders. Levels belong to each
   language's own level system; never assume CEFR.
8. **Cost.** CI never calls paid APIs; mock the LLM provider. Paid evals run only nightly or on a label.
9. **Secrets.** Never commit secrets or `.env`.

## Who writes what

Claude generates: frontend, FastAPI boilerplate (routers, request models, plain data response
models), infra templates, CI plumbing, test scaffolding.

The owner hand-writes (do NOT implement these unless a spec explicitly says so):
- LLM provider layer, prompts, orchestration, tool definitions
- Pydantic models for the tutor's LLM output (tutor messages, feedback cards, turn replies) and for
  word lookup results. Specs describe their shape; routes use `response_model=None`.
- RAG: chunking, embeddings, retrieval
- Eval datasets, graders, rubrics
- Guardrails and token budget logic

If a task touches these areas, stop and describe what you would do instead of writing it.
