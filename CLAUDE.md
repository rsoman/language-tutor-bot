# CLAUDE.md

Rules for Claude Code working in this repo. Read this before every task.

## What this repo is

A study project: a language tutor chat bot (German A1 first, more languages later).
The owner is learning AI engineering, Python and FastAPI. Generated code must be
readable and teachable, not clever.

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
2. Work on a branch, one spec per PR.
3. Make the spec's acceptance tests pass. Do not change acceptance criteria to make tests pass.

## Language-agnostic rule

Never hard-code a target language (e.g. "German") in code, prompts or tests outside
`backend/src/tutor/languages.py` and per-language data folders. Look things up by language code.

## Backend conventions

- Python 3.12+, managed with `uv`. Run commands from `backend/`.
- Lint/format: `uv run ruff check . && uv run ruff format --check .`
- Types: `uv run pyright` (strict for `src/`, standard for tests). No `Any` without a comment explaining why.
- Tests: `uv run pytest`. New endpoints need tests using `TestClient`.
- Config only via `tutor.config.Settings` (env prefix `TUTOR_`). Never commit secrets or `.env`.

## Cost rules

- Tests in CI must not call paid APIs. Mock the LLM provider.
- Paid evals run only via the nightly or labelled workflow (added in Phase 1).
