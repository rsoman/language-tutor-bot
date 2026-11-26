# Cheat sheet: Python and FastAPI for a JS/TS developer

The 15-minute version. The long version, with the "why", is
[01-python-fastapi-primer.md](01-python-fastapi-primer.md).

All commands run from `backend/`.

## Tools: what maps to what

| You know (JS/TS) | Here (Python) | In this repo |
|---|---|---|
| `package.json` | `pyproject.toml` | `backend/pyproject.toml` |
| `package-lock.json` | `uv.lock` (never edit by hand) | `backend/uv.lock` |
| `node_modules/` | `.venv/` (packages **and** a link to the Python interpreter) | `backend/.venv/` (git-ignored) |
| npm / pnpm | uv | |
| `npm ci` | `uv sync --locked` | what CI runs |
| `npm install` | `uv sync` | |
| `npm install zod` | `uv add <pkg>` | |
| `npm install -D vitest` | `uv add --dev <pkg>` | `[dependency-groups] dev` |
| `npx tsc` / `npm run x` | `uv run <command>` | `uv run pytest` |
| `devDependencies` | `[dependency-groups] dev` | pytest, ruff, pyright, pytest-bdd |
| ESLint + Prettier | ruff | `uv run ruff check .`, `uv run ruff format .` |
| `tsc --noEmit` | pyright (Pylance in VS Code is built on it) | `uv run pyright` |
| Express + zod + Swagger | FastAPI + Pydantic (Swagger is built in at `/docs`) | `src/tutor/main.py` |
| `node server.js` | `uv run uvicorn tutor.main:app --reload` | uvicorn is the server |
| zod schema | Pydantic `BaseModel` | `HealthResponse` in `main.py` |
| Vitest / Jest | pytest | `tests/test_*.py` |
| supertest | FastAPI `TestClient` | `tests/test_app.py` |
| cucumber-js | pytest-bdd | `tests/features/`, `tests/bdd/` |
| `beforeEach` | a pytest fixture (injected by parameter name) | `client` in `tests/test_app.py` |
| `vi.stubEnv`, `vi.spyOn` | `monkeypatch` fixture | `tests/test_config.py` |
| `.env` via dotenv | pydantic-settings | `src/tutor/config.py` |

## Syntax: what maps to what

| JS/TS | Python |
|---|---|
| `null`, `undefined` | `None` |
| `true`, `false` | `True`, `False` |
| `&&`, `\|\|`, `!` | `and`, `or`, `not` |
| `===` | `==` (value), `is` (same object, use only for `None`: `x is None`) |
| `{ }` blocks | indentation (4 spaces) after a `:` |
| `// comment` | `# comment` |
| `` `Hi ${name}` `` | `f"Hi {name}"` (and `f"{name!r}"` adds quotes, like `JSON.stringify`) |
| `const x: string = "a"` | `x: str = "a"` (no `const`/`let`; constants are `UPPER_CASE` by convention) |
| `function f(a: number): string {}` | `def f(a: int) -> str:` |
| `(x) => x * 2` | `lambda x: x * 2` (rarely used) |
| `string[]` | `list[str]` |
| `readonly string[]` | `tuple[str, ...]` |
| `Record<string, T>` | `dict[str, T]` |
| `T \| null` | `T \| None` |
| `"a" \| "b"` (literal union) | `Literal["a", "b"]` |
| `interface` (structural) | `Protocol` (later phases) |
| class with only fields | `@dataclass(frozen=True)` |
| `arr.map(p => p.code)` | `[p.code for p in arr]` (a list comprehension) |
| `Object.values(o)` | `o.values()` |
| `key in obj` | `key in d` |
| `arr.length`, `str.length` | `len(arr)`, `len(s)` |
| `"a".repeat(3)` | `"a" * 3` |
| `throw new Error("x")` | `raise ValueError("x")` |
| `try {} catch (e) {}` | `try: ... except ValueError as e: ...` |
| `import { a } from "./mod"` | `from tutor.mod import a` (absolute, from the package root) |
| `export` | nothing: every top-level name is importable. `_name` means "private, please" |
| `index.ts` in a folder | `__init__.py` in a folder makes it a package |
| `this` | `self` (written explicitly as the first method parameter) |
| constructor | `__init__` (dataclasses and Pydantic write it for you) |
| decorators (`@Get()` in NestJS) | `@app.get("/x")`, `@pytest.fixture`, `@lru_cache` |

## FastAPI request flow, one line

HTTP request, uvicorn, FastAPI matches method and path, parses the JSON body into your
Pydantic model (fails: automatic `422`), calls your function, validates your return value
against the return type, sends JSON.

## The daily loop for spec 001

```bash
uv run pytest tests/bdd/test_echo_feature.py   # red: see it fail for the right reason
# write the least code
uv run pytest                                   # green
uv run ruff check . && uv run ruff format . && uv run pyright   # what CI checks
```

## Three things that will bite you on spec 001

1. **pytest-bdd steps do not leak between test files.** The step
   `the response status is {status:d}` is defined in `test_health_feature.py`, so your new
   feature file cannot see it. Move shared steps into `tests/bdd/conftest.py`. I checked
   this: you get `StepDefinitionNotFoundError` otherwise.
2. **"Red for the right reason."** A `StepDefinitionNotFoundError` or an `ImportError` is the
   wrong red. The right red is an assertion like `404 != 200` (the route does not exist yet).
3. **No language literals.** Do not write `"de"` in the model, the endpoint or the steps. Read
   from `tutor.languages.LANGUAGES`. `"xx"` is fine as the made-up unsupported code.
