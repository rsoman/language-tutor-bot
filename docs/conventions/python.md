# Python conventions (backend)

Applies to everything under `backend/`. Run all commands from `backend/`.

## Tooling

| Job | Tool | Command |
|---|---|---|
| Packages and venv | uv | `uv add <pkg>`, `uv add --dev <pkg>`, `uv sync` |
| Lint | ruff | `uv run ruff check .` |
| Format | ruff | `uv run ruff format .` |
| Types | pyright | `uv run pyright` (strict for `src/`, standard for `tests/`) |
| Tests | pytest + pytest-bdd | `uv run pytest` |

Never edit `uv.lock` by hand. CI runs `uv sync --locked`, so commit `uv.lock` with any dependency change.

## Code style

- Python 3.12+. Use modern syntax: `list[str]`, `X | None`, `match` where it reads better.
- Type every function signature. No `Any` without a comment saying why.
- Prefer plain functions and frozen dataclasses. Add a class only when it holds state or a Protocol needs it.
- Keep modules small and named for what they do (`languages.py`, `config.py`), not `utils.py`.
- Docstrings on public modules, classes and functions: one line on what, a second paragraph on why if it is not obvious.
- No clever one-liners. This repo is for learning; readable beats short.

## FastAPI

- `create_app()` builds the app. Tests call it; do not import a global `app` into tests.
- One router per area in `src/tutor/routers/` once there is more than a handful of endpoints.
- Request and response bodies are Pydantic models with explicit field constraints (`Field(min_length=...)`).
- Return models, not dicts. Name them `<Thing>In` / `<Thing>Out`.
- Every new endpoint has tests using `TestClient` (unit) and, for spec criteria, a BDD scenario.
- Validation errors are 422 from Pydantic. Domain errors raise `HTTPException` with a clear `detail`.
- Read settings with `Depends(get_settings)` in endpoints so tests can override them.

## Config and secrets

- All config goes through `tutor.config.Settings` (env prefix `TUTOR_`). No `os.environ` elsewhere.
- Never commit `.env` or real keys. Add new settings to `.env.example` with a safe example value.

## Language-agnostic rule

No target language names, words or level names in code outside `src/tutor/languages.py`
and per-language data folders. Tests that need a fake language use a made-up code such as `xx`.

## Hand-written areas

The owner writes the LLM provider layer, prompts, orchestration, RAG, evals and guardrails.
See the root `CLAUDE.md`. Claude may write tests and scaffolding around them only when a spec says so.
