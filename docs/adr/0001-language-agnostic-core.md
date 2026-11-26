# ADR 0001: Language-agnostic core

- **Status:** accepted
- **Date:** 2026-11-26

## Context

The first target is German at CEFR A1, but more languages should be possible later.

## Decision

Orchestration, retrieval, evals and guardrails take a language code and a level as
inputs. Levels belong to each language's own level system (CEFR for German, but other
languages may use JLPT, HSK and so on), so no code assumes CEFR. Language-specific material lives in data, keyed by code:

- `backend/src/tutor/languages.py`: the registry of supported languages and levels.
- Later: `data/<code>/<level>/` for corpora, `prompts/<code>/` for language-specific prompt
  fragments, `evals/<code>/` for golden sets.

## Consequences

- Adding a language = registry entry + data + evals, no orchestration changes.
- Slight extra indirection for a single-language MVP. Accepted, it is cheap now and costly later.
- Some features (e.g. German case/article checks) are inherently language-specific; they go
  behind a per-language plugin interface when we reach them.
