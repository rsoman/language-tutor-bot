# language-tutor-bot

A chat bot for learning languages: conversation practice, grammar correction and vocabulary
drills. German at CEFR A1 comes first; the core is language-agnostic
([ADR 0001](docs/adr/0001-language-agnostic-core.md)).

This is a study project for AI engineering: LLM orchestration and tooling, RAG, evals and
observability, and production guardrails, built with Python and FastAPI. UI and boilerplate
are generated with Claude Code from specs; the AI-heavy parts are hand-written.

## Status

Phase 0 (foundations). Roadmap: 0 Foundations, 1 Orchestration, 2 RAG,
3 Evals and observability, 4 Guardrails and optimization.

## Layout

```
backend/     FastAPI app (Python, uv)
specs/       One spec per feature, the input to the Claude Code harness
docs/adr/    Architecture decision records
CLAUDE.md    Rules Claude Code follows in this repo
```

A `frontend/` (React + Vite) arrives in Phase 1.

## Run locally

Requires [uv](https://docs.astral.sh/uv/).

```bash
cd backend
uv sync
uv run uvicorn tutor.main:app --reload    # http://127.0.0.1:8000/docs
```

Checks (the same as CI):

```bash
uv run ruff check . && uv run ruff format --check .
uv run pyright
uv run pytest
```

## Harness workflow

1. Write or pick a spec in `specs/` (copy `specs/_template.md`).
2. Create a branch, then run Claude Code on the spec, or hand-write it if the spec says so.
3. CI runs lint, types and tests on the PR. Review, then merge.

## Cost safety (do before any AWS or API use)

- AWS Budgets alerts at $1, $5 and $8.
- A monthly spend limit on the Anthropic Console workspace, one API key per environment.
- CI never calls paid APIs; paid evals run only nightly or on a label.
