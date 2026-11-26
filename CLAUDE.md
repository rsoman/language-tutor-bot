# CLAUDE.md

Rules for Claude Code working in this repo. Read this before every task, then the
conventions file for the area you are touching.

## What this repo is

Vaikhari, a study project: a language tutor chat bot (German A1 first, more languages later).
The owner is learning AI engineering, Python and FastAPI. Generated code must be
readable and teachable, not clever.

## Where the rules live

| Area | File |
|---|---|
| Python and FastAPI | `docs/conventions/python.md` |
| React and TypeScript | `docs/conventions/react.md` and `frontend/CLAUDE.md` |
| Testing (strict TDD, BDD) | `docs/conventions/testing.md` |
| ADRs and design decisions | `docs/conventions/adr-and-design.md` |
| Architecture decisions | `docs/adr/` |
| UI and product rules | `docs/design/` |

## Who writes what

Claude generates: frontend, FastAPI boilerplate (routers, schemas), infra templates,
CI plumbing, test scaffolding.

The owner hand-writes (do NOT implement these unless a spec explicitly says so):
- LLM provider layer, prompts, orchestration, tool definitions
- RAG: chunking, embeddings, retrieval
- Eval datasets, graders, rubrics
- Guardrails and token budget logic

If a task touches these areas, stop and describe what you would do instead of writing it.

## Workflow

1. Every feature starts from a spec in `specs/NNN-name.md` (copy `specs/_template.md`).
2. Work on a branch, one spec per PR. Fill in `.github/pull_request_template.md`.
3. Strict TDD: write the tests from the spec first, show them failing, then implement.
4. Make the spec's acceptance tests pass. Do not change acceptance criteria to make tests pass.
5. Check `docs/adr/` and `docs/design/` before changing architecture or UI. If a change contradicts
   an accepted record, propose a new record instead.

## Language-agnostic rule

Never hard-code a target language (e.g. "German") in code, prompts or tests outside
`backend/src/tutor/languages.py` and per-language data folders. Look things up by language code.
Levels belong to each language's own level system; never assume CEFR.

## Cost rules

- Tests in CI must not call paid APIs. Mock the LLM provider.
- Paid evals run only via the nightly or labelled workflow (added in Phase 1).
- Never commit secrets or `.env`.
