# Primer: Python, FastAPI and testing, for spec 001

Written for a JS/TS and React developer who has used Python in notebooks but not in a
project. Read it top to bottom once (about an hour), then use it as a reference. The quick
lookup version is [00-cheat-sheet.md](00-cheat-sheet.md).

Every concept points at a real file in this repo, so you can read the idea and then see it
working. Section 8 is the plan for spec 001. It tells you the loop and the traps, not the
code.

How to read the confidence marks:

- No mark: I checked it in this repo (ran it, or read the code).
- **[docs]**: from the official docs; follow the link to verify.
- **[unsure]**: my understanding, not checked. Verify before you rely on it.

Contents

1. [Setup: uv and VS Code](#1-setup-uv-and-vs-code)
2. [Notebook Python vs project Python](#2-notebook-python-vs-project-python)
3. [Python essentials, mapped to TS](#3-python-essentials-mapped-to-ts)
4. [FastAPI: how a request flows](#4-fastapi-how-a-request-flows)
5. [Pydantic: models and validation](#5-pydantic-models-and-validation)
6. [pytest: tests and fixtures](#6-pytest-tests-and-fixtures)
7. [pytest-bdd: feature files and steps](#7-pytest-bdd-feature-files-and-steps)
8. [Spec 001: the red, green, refactor loop](#8-spec-001-the-red-green-refactor-loop)
9. [Links](#9-links)

---

## 1. Setup: uv and VS Code

### Is VS Code good enough?

Yes. VS Code with the Python extensions is one of the two mainstream Python editors (the
other is PyCharm). You lose nothing for this project, and you already know it.

### Install uv

uv is the package manager. It does what npm and nvm do together: it can download a Python
interpreter, create the virtual environment, and install packages from the lock file.

Install it from the official page: <https://docs.astral.sh/uv/getting-started/installation/>
(on macOS, `brew install uv` also works **[docs]**). Then:

```bash
git clone https://github.com/rsoman/language-tutor-bot.git
cd language-tutor-bot/backend
uv sync          # creates .venv/ and installs everything in uv.lock
uv run pytest    # expect: 10 passed
```

You do not need to install Python yourself. `pyproject.toml` says `requires-python = ">=3.12"`,
and uv downloads a matching interpreter if your machine has none **[docs]**. There is no
`.python-version` file pinning an exact version, so your machine may pick 3.12 or 3.13. Both
are fine for this code.

Then run the app and open the free Swagger UI:

```bash
uv run uvicorn tutor.main:app --reload
# open http://127.0.0.1:8000/docs and try GET /health and GET /languages
```

`tutor.main:app` reads as "in module `tutor.main`, the variable `app`". `--reload` restarts on
file save, like `nodemon`.

### VS Code extensions

| Extension | ID | Why |
|---|---|---|
| Python | `ms-python.python` | Runs code, picks the interpreter, runs tests. Installs Pylance with it **[docs]**. |
| Pylance | `ms-python.vscode-pylance` | Autocomplete and type errors. Built on pyright, the same checker CI runs. |
| Ruff | `charliermarsh.ruff` | Lint and format on save, the same rules CI runs. |
| Cucumber (optional) | for example `alexkrechik.cucumberautocomplete` | Syntax colours for `.feature` files. **[unsure]** which Gherkin extension is best today; any works. |

### Three settings that matter

1. **Open the `backend/` folder, not the repo root.** `code backend` from the repo root.
   pytest, pyright and ruff all read `backend/pyproject.toml`, and the test explorer finds tests
   relative to the folder you opened. Opening the root works too, but then you have to point
   the test settings at `backend/` yourself. Not worth it.
2. **Pick the interpreter from `.venv`.** Command Palette, "Python: Select Interpreter", then
   choose `./.venv/bin/python` (on Windows `.\.venv\Scripts\python.exe`). If you skip this,
   VS Code uses your system Python, which has none of the packages, and every import is red.
   This is the single most common setup problem.
3. **Turn on pytest.** Command Palette, "Python: Configure Tests", choose pytest, choose `.`
   (the root of the opened folder). The flask icon in the sidebar then lists every test,
   including one per BDD scenario, and you can run or debug any of them.

Optional `backend/.vscode/settings.json` (not committed; add it if you like it):

```json
{
  "python.defaultInterpreterPath": ".venv/bin/python",
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["tests"],
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": { "source.organizeImports": "explicit" }
  }
}
```

**[unsure]** Pylance reads the `[tool.pyright]` section of `pyproject.toml`, so its errors
should match `uv run pyright`. If they ever disagree, trust `uv run pyright`, because that is
what CI runs.

### Debugging

Set a breakpoint in the gutter, then run a test with "Debug Test" from the test explorer. You
stop inside your endpoint with the request body in scope. This beats `print()`, and it is the
fastest way to learn what FastAPI hands your function.

---

## 2. Notebook Python vs project Python

What changes when you leave Jupyter:

| Notebook | Project |
|---|---|
| Cells run in any order, state lives in memory | Every run starts fresh from files |
| `pip install` into whatever kernel is active | Dependencies declared in `pyproject.toml`, locked in `uv.lock` |
| One big file | Modules and packages, imported by name |
| Types optional and unchecked | Types on every signature, checked by pyright in strict mode for `src/` |
| You look at the output | Tests assert the output, CI runs them |

The mindset shift is the same one you made going from a browser console to a TS project.

### The virtual environment (`.venv`)

Python installs packages globally by default. A virtual environment is a folder with its own
`site-packages` (the Python `node_modules`) plus a link to an interpreter. `uv sync` creates
it, `uv run <cmd>` runs `<cmd>` inside it. You never need to "activate" it if you always use
`uv run`. If you see `ModuleNotFoundError: No module named 'fastapi'`, you ran plain `python`
or `pytest` instead of `uv run ...`, or VS Code has the wrong interpreter.

### Why `import tutor` works

The code lives in `src/tutor/`, the "src layout". `uv sync` installs the project itself into
`.venv` in editable mode, like `npm link`. I checked: `.venv` contains
`_editable_impl_tutor.pth`, a file that adds `src/` to the import path. So tests import
`from tutor.main import create_app` as if `tutor` were a published package, and your edits
show up immediately.

The src layout exists to stop a classic bug: tests passing because they import files from the
working directory instead of the installed package.

---

## 3. Python essentials, mapped to TS

### Indentation is syntax

A block starts with `:` and continues as long as the lines are indented further. Four spaces.
Ruff formats this for you. There are no braces and no semicolons.

### Types: like TS, erased at runtime, except where a library reads them

```python
def get_language(code: str) -> LanguageProfile:
```

Python ignores these annotations when it runs, just as TS types vanish after compiling.
pyright checks them, like `tsc`. **The big difference:** libraries can read annotations at
runtime. Pydantic and FastAPI do exactly that. In `main.py`, `def health() -> HealthResponse`
is not only documentation. FastAPI reads `HealthResponse` and uses it to validate and
serialise the response. This is the one idea that makes FastAPI click. There is no zod schema
next to the TS type, the type **is** the schema.

Types you will use, all modern syntax (Python 3.10+):

- `str`, `int`, `float`, `bool`, `None`
- `list[str]`, `dict[str, LanguageProfile]`, `tuple[str, ...]` (any length), `tuple[int, int]` (exactly two)
- `str | None` for optional
- `Literal["local", "test", "prod"]` for a literal union. See `config.py`.

Read: FastAPI's own [Python types intro](https://fastapi.tiangolo.com/python-types/) **[docs]**.
It is short and written for exactly this moment.

### Modules and packages

- A `.py` file is a **module**. A folder with `__init__.py` is a **package**. `src/tutor/` is a
  package, `src/tutor/languages.py` is the module `tutor.languages`.
- `from tutor.languages import LANGUAGES` is the ES `import { LANGUAGES } from ...`. Imports are
  absolute from the package root. Relative imports (`from .languages import ...`) exist but
  this repo does not use them.
- There is no `export`. Every top-level name is importable. A leading underscore (`_helper`) is
  a convention for "internal".
- `"""Docstring"""` as the first line of a module, class or function is its documentation.
  The conventions ask for one on public things.

### Dataclasses: typed records

From `languages.py`:

```python
@dataclass(frozen=True)
class LevelSystem:
    name: str
    levels: tuple[str, ...]
```

`@dataclass` writes the constructor, `==` and a readable `repr` for you. `frozen=True` makes
instances immutable, like `Readonly<{ name: string; levels: readonly string[] }>` plus
`Object.freeze`. You construct with keywords: `LevelSystem(name="CEFR", levels=(...))`.

`__post_init__` (in `LanguageProfile`) runs right after the generated constructor. The repo
uses it to reject levels that are not part of the language's own level system. Methods with
double underscores on both sides ("dunder" methods) are hooks Python calls for you.

**Dataclass vs Pydantic model, when to use which:** dataclasses for internal data you create
yourself (no validation of outside input). Pydantic models for data that crosses a boundary
(HTTP bodies, env vars), where you must validate. `LanguageProfile` is a dataclass,
`HealthResponse` is a Pydantic model. Same reason you would use zod at the API edge but plain
types inside.

### Classes and `self`

`self` is `this`, but written explicitly as the first parameter of every method. `class
HealthResponse(BaseModel):` means "HealthResponse extends BaseModel".

### Decorators

A decorator is a function that takes a function (or class) and returns a replacement or
registers it. `@x` above a `def` means `f = x(f)`. You will meet three kinds here:

| Decorator | What it does | Where |
|---|---|---|
| `@app.get("/health")` | Registers the function as a route handler. Like `app.get("/health", handler)` in Express. | `main.py` |
| `@lru_cache` | Memoises the function. `get_settings()` builds `Settings` once and returns the same object afterwards. | `config.py` |
| `@pytest.fixture`, `@given`, `@when`, `@then` | Registers the function with the test runner. | `tests/` |

Read: the [glossary entry](https://docs.python.org/3/glossary.html#term-decorator) **[docs]**.

### Errors

```python
try:
    return LANGUAGES[code]
except KeyError:
    raise ValueError(f"Unsupported language {code!r}. ...") from None
```

`raise` is `throw`, `except` is `catch` but filtered by type. Looking up a missing dict key
raises `KeyError` (JS gives you `undefined` instead). `from None` hides the original
`KeyError` from the traceback, so the reader sees one clean error. `{code!r}` puts quotes
around the value.

This matters for spec 001: **inside a Pydantic validator, raising `ValueError` becomes a
validation error, and FastAPI turns validation errors into a `422`** **[docs]**.

### Comprehensions

```python
[LanguageOut(code=p.code, ...) for p in LANGUAGES.values()]
```

is `Object.values(LANGUAGES).map(p => new LanguageOut(...))`. There are also dict
comprehensions: `{lang["code"]: lang for lang in resp.json()}` in `test_app.py` builds a
lookup table from a list.

### `with`

`with pytest.raises(ValueError):` opens a block that must raise. `with` is a context manager:
setup on enter, cleanup on exit, even on errors. Think `try/finally` packaged as an object.

### Strings and length

`len("Grüße")` is 5. Python counts Unicode code points, not bytes. I checked this. One caveat
for a language tutor later: some characters a reader sees as one (an emoji with a skin-tone
modifier, some accented letters typed as two code points) count as 2. Fine for spec 001,
worth knowing for real learner input.

---

## 4. FastAPI: how a request flows

### The pieces

- **uvicorn** is the HTTP server (an ASGI server). It is to FastAPI what Node's `http` module is
  to Express.
- **Starlette** is the small web framework underneath FastAPI (routing, requests, responses).
- **FastAPI** adds the part you care about: it reads your type annotations to parse, validate
  and document requests and responses.
- **Pydantic** does the actual validation.

### One request, step by step

Take `GET /languages` in `src/tutor/main.py`:

1. uvicorn receives the HTTP request and hands it to `app`.
2. FastAPI finds the route registered by `@app.get("/languages")`.
3. For a `POST` with a body, FastAPI would now read the JSON and build your Pydantic model
   from it. **If that fails, FastAPI returns `422` with a list of what was wrong, and your
   function is never called.** You write no `if` checks for this.
4. FastAPI calls `languages()`.
5. Your function returns `list[LanguageOut]`.
6. FastAPI checks the return value against the return annotation and turns it into JSON.
7. uvicorn sends the response with status `200` (the default for a successful `GET` or `POST`).

How does FastAPI know a parameter is the JSON body and not a query string? By its type. A
parameter typed as a Pydantic model is read from the body. A plain `str` or `int` parameter
is read from the query string or the path **[docs]**. See
[Request Body](https://fastapi.tiangolo.com/tutorial/body/).

### `create_app()`, not a global

`main.py` builds the app inside `create_app()` and tests call it. The conventions require this
so every test gets a fresh app and can override settings. The global `app = create_app()` at
the bottom exists only so uvicorn has something to import. Do not import it in tests.

Spec 001 goes inside `create_app()`, where the comment says.

### `def` vs `async def`

You will see both in tutorials. FastAPI runs a plain `def` endpoint in a thread pool and an
`async def` endpoint on the event loop **[docs]**. For spec 001, there is nothing to `await`,
so plain `def` (as in the repo) is right. `async def` matters once you call the LLM over the
network. Read [Concurrency and async/await](https://fastapi.tiangolo.com/async/) then, not now.

### The `# pyright: ignore[reportUnusedFunction]` comments

pyright in strict mode sees a function defined inside `create_app()` that nobody calls and
flags it as unused. It cannot know the decorator registered it. The comment silences that one
rule on that one line. Your new endpoint needs the same comment.

### The `422` body

Once your endpoint exists, post an invalid body from the Swagger UI at `/docs` and look at the
response. It looks like this **[docs]**:

```json
{ "detail": [ { "type": "string_too_short", "loc": ["body", "message"], "msg": "...", ... } ] }
```

`loc` tells you which field failed. Useful when a test gets a `422` you did not expect.

---

## 5. Pydantic: models and validation

A Pydantic model is a class whose annotated fields become a validated schema. It is zod, but
the schema and the type are the same thing.

```python
from pydantic import BaseModel, Field

class NoteIn(BaseModel):          # an example, not part of this repo
    title: str = Field(min_length=1, max_length=80)
    pinned: bool = False
```

- A field with no default is **required**. Missing it is a validation error of type `missing`.
- `Field(...)` adds constraints. An empty `title` fails with `string_too_short`. I ran both of
  these against the Pydantic version in `uv.lock` (2.14).
- Constructing `NoteIn(title="")` raises `pydantic.ValidationError`. FastAPI catches that for
  request bodies and returns `422`.
- `.model_dump()` turns a model into a dict. You rarely need it in FastAPI, because returning
  the model is enough.

### Custom rules: validators

Some rules are not "length" or "range", for example "this value must be one of the keys of
some dict at runtime". For that Pydantic has `field_validator`. You write a class method that
receives the value, and either returns it (valid) or raises `ValueError` (invalid). Read
[Validators](https://docs.pydantic.dev/latest/concepts/validators/) **[docs]**, the
"field validators" part. Pay attention to the difference between "after" and "before"
validators, and note the decorator order (`@field_validator(...)` above `@classmethod`).

Why not `Literal["de"]`? It would work today and break the language-agnostic rule (ADR 0001):
adding a language would mean editing the model. The list of languages must come from
`tutor.languages`.

### Naming

The conventions say `<Thing>In` for request bodies and `<Thing>Out` for responses. `main.py`
already has `LanguageOut` and `HealthResponse` (an older name). Follow the convention for new
code.

### pydantic-settings

`config.py` uses `BaseSettings`, a Pydantic model whose fields come from environment variables.
`environment: Literal["local", "test", "prod"] = "local"` reads `TUTOR_ENVIRONMENT`, validates
it against the three values, and falls back to `"local"`. Same validation engine, different
input source. You do not need it for spec 001.

---

## 6. pytest: tests and fixtures

### Discovery

pytest finds files named `test_*.py` under `tests/` (configured in `pyproject.toml`) and runs
every function named `test_*`. No `describe`, no `it`. A test is a plain function with a plain
`assert`:

```python
def test_health(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
```

When an `assert` fails, pytest rewrites it to show both sides, so you get `assert 404 == 200`
instead of a bare `AssertionError` **[docs]**. You do not need `expect().toBe()`.

### Fixtures: dependency injection by parameter name

This is the concept that is most different from Jest.

```python
@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())

def test_health(client: TestClient) -> None: ...
```

pytest sees that `test_health` has a parameter named `client`, finds the fixture named
`client`, runs it, and passes the result in. A fixture is a `beforeEach` that you ask for by
name, instead of one that runs for everything in a `describe` block. Each test gets a fresh one
by default.

Fixtures in `tests/test_config.py` worth reading:

- `monkeypatch` is built in. `monkeypatch.setenv(...)` sets an env var for one test and undoes
  it afterwards. Like `vi.stubEnv` with automatic cleanup.
- `tmp_path` is built in: a fresh empty folder per test.
- `autouse=True` makes a fixture apply to every test in the file without being asked for.
  `no_dotenv` uses it so a local `.env` cannot change test results.

### `conftest.py`

A `conftest.py` file holds fixtures (and, for pytest-bdd, steps) shared by every test file in
its folder and below. pytest loads it automatically, you never import it **[docs]**. There is
none in this repo yet. You will probably add `tests/bdd/conftest.py` for spec 001 (see 8).

### Running

```bash
uv run pytest                          # everything
uv run pytest tests/test_app.py        # one file
uv run pytest -k echo                  # tests whose name contains "echo"
uv run pytest -x                       # stop at the first failure
uv run pytest -v                       # one line per test, readable names
```

### TestClient

`TestClient(create_app())` calls your app in-process, with no server and no network, like
supertest. `client.post("/x", json={...})` sends a JSON body. The response is an `httpx.Response`:
`.status_code` and `.json()`.

---

## 7. pytest-bdd: feature files and steps

Same Gherkin you may know from cucumber-js. Two files per feature.

**The feature file** (`tests/features/health.feature`) is the spec's acceptance criteria,
word for word.

**The step file** (`tests/bdd/test_health_feature.py`) connects each sentence to code. Walk
through it with these four ideas:

1. `scenarios("health.feature")` generates one pytest test per scenario. The path is relative
   to `bdd_features_base_dir = "tests/features"` in `pyproject.toml`.
2. `@given`, `@when`, `@then` register a function for a sentence.
3. `target_fixture="client"` is how steps pass data along. The `@given` step returns a
   `TestClient`, and pytest-bdd stores it as a fixture named `client`. The `@when` step asks
   for `client` by parameter name (fixtures again), and stores its result as `response`. The
   `@then` steps ask for `response`. This replaces the `this.world` object of cucumber-js.
4. `parsers.parse("the response status is {status:d}")` captures `200` from the sentence as an
   `int` parameter named `status`. `{name}` captures a string, `{name:d}` an integer.

Reference: <https://pytest-bdd.readthedocs.io/en/stable/> **[docs]**.

### The trap: steps are local to their file

A step defined in `test_health_feature.py` is only visible to scenarios loaded in that file.
I checked this in the repo: a second feature file that reuses `Given the API is running`
fails with `StepDefinitionNotFoundError`. Spec 001 reuses `Then the response status is ...`,
so you need to move that step (and probably `Given the API is running`, or your own client
fixture) into `tests/bdd/conftest.py`. That is a refactor of existing code: do it first, run
`uv run pytest`, and see the health scenario still pass before you start on echo.

---

## 8. Spec 001: the red, green, refactor loop

This is the plan, not the solution. Read `specs/001-echo-endpoint.md` first.

### Before you start

```bash
git switch main && git pull
git switch -c spec-001-echo-endpoint
uv run pytest        # 10 passed: your clean baseline
```

### Step 0: refactor, still green

Move the shared steps to `tests/bdd/conftest.py` (section 7). Run the suite. Still 10 passed.
Commit. This is the "refactor" step done first, on code that already has tests.

### Step 1: red, acceptance tests

1. Create `tests/features/001-echo-endpoint.feature`. Paste the Gherkin from the spec. Do not
   reword anything.
2. Create `tests/bdd/test_echo_feature.py` with `scenarios(...)` and the step functions. Things
   to work out yourself:
   - "Given a supported language code" must produce a code **from `LANGUAGES`**, never a
     literal. Which fixture name will the `@when` steps ask for?
   - "When I post a message "hello" in that language to /echo" captures a string. Notice the
     quotes are part of the sentence, look at how `test_health_feature.py` handles
     `"{value}"`.
   - "a message of 501 characters": build the string in Python, do not paste 501 characters.
   - "with no language": what JSON do you send so that the key is missing, not empty?
   - The "unsupported" and "missing" scenarios have no `Given`. Where does the client come from
     then? (Hint: a fixture in `conftest.py` that every scenario can ask for.)
3. Run `uv run pytest tests/bdd/test_echo_feature.py -v`.

**Read the failure.** All five scenarios should fail, and fail with a status assertion,
something like `assert 404 == 200` or `assert 404 == 422`, because `POST /echo` does not exist
yet. That is the right red. If you see `StepDefinitionNotFoundError`, a `fixture 'x' not found`,
or an `ImportError`, that is the wrong red: fix the test, not the app.

Save this output. It goes in the PR under "Red evidence".

### Step 2: red, unit tests for the edges

The feature file tests 501 characters. It does not test the edges that are easy to get wrong.
Add a few `TestClient` tests in `tests/test_echo.py` for, for example: exactly 500 characters
is accepted, 1 character is accepted, and the length counts characters, not bytes (send a
non-ASCII string such as `"üü"`, which is characters, not a word in any language). Run them,
watch them fail.

### Step 3: green

Now write the code in `main.py`, inside `create_app()`:

- a request model and a response model (`...In`, `...Out`) with `Field` constraints,
- a rule that rejects a language code not in `LANGUAGES` (section 5, validators),
- the endpoint itself.

Write the least code that passes. Run the echo tests until green, then the whole suite.

### Step 4: refactor and the CI checks

```bash
uv run ruff format .
uv run ruff check .
uv run pyright
uv run pytest
```

pyright strict will likely complain about something the tests did not. Typical ones: a missing
return type, the unused-function rule on the endpoint (section 4), or a validator signature
without types. Fix, re-run only pyright.

### Step 5: PR

Fill in `.github/pull_request_template.md`: the red evidence from step 1, ticked checks, and
"ADR 0001" under decisions. CI runs the same four commands.

### Questions to answer for yourself along the way

- Why does a bad body give `422` and not `400`? (FastAPI's choice; look at its
  [handling errors](https://fastapi.tiangolo.com/tutorial/handling-errors/) page.)
- Where should `length` be computed: in the endpoint, or in the response model? What changes
  for a reader of the code?
- If you added a second language to `LANGUAGES` tomorrow, which of your files would change?
  The right answer is "none".

---

## 9. Links

I could not open these from my environment to check them today, so treat each as **[docs]**:
they are the official pages as I know them. Tell me if one is broken and I will fix it.

**Python**
- The official tutorial, chapters 3 to 9 cover everything here: <https://docs.python.org/3/tutorial/>
- Modules and packages: <https://docs.python.org/3/tutorial/modules.html>
- Classes: <https://docs.python.org/3/tutorial/classes.html>
- Errors and exceptions: <https://docs.python.org/3/tutorial/errors.html>
- `dataclasses`: <https://docs.python.org/3/library/dataclasses.html>
- `typing` (reference, not a read-through): <https://docs.python.org/3/library/typing.html>

**uv**
- Docs home: <https://docs.astral.sh/uv/>
- Working on projects: <https://docs.astral.sh/uv/guides/projects/>

**FastAPI** (the tutorial is very good; do it in order, skip what does not apply)
- Python types intro: <https://fastapi.tiangolo.com/python-types/>
- Tutorial start: <https://fastapi.tiangolo.com/tutorial/>
- Request body: <https://fastapi.tiangolo.com/tutorial/body/>
- Body fields: <https://fastapi.tiangolo.com/tutorial/body-fields/>
- Response model: <https://fastapi.tiangolo.com/tutorial/response-model/>
- Handling errors: <https://fastapi.tiangolo.com/tutorial/handling-errors/>
- Testing: <https://fastapi.tiangolo.com/tutorial/testing/>
- Async (later): <https://fastapi.tiangolo.com/async/>

**Pydantic**
- Models: <https://docs.pydantic.dev/latest/concepts/models/>
- Fields: <https://docs.pydantic.dev/latest/concepts/fields/>
- Validators: <https://docs.pydantic.dev/latest/concepts/validators/>

**pytest and pytest-bdd**
- Getting started: <https://docs.pytest.org/en/stable/getting-started.html>
- Fixtures: <https://docs.pytest.org/en/stable/how-to/fixtures.html>
- monkeypatch: <https://docs.pytest.org/en/stable/how-to/monkeypatch.html>
- pytest-bdd: <https://pytest-bdd.readthedocs.io/en/stable/>

**Tooling**
- Ruff editor setup: <https://docs.astral.sh/ruff/editors/setup/>
- VS Code Python tutorial: <https://code.visualstudio.com/docs/python/python-tutorial>
- VS Code testing: <https://code.visualstudio.com/docs/python/testing>
- VS Code environments: <https://code.visualstudio.com/docs/python/environments>

**Suggested reading order before you start (about 2 hours):** FastAPI "Python types intro",
then FastAPI tutorial from "First steps" through "Body fields", then "Testing", then the
Pydantic validators page, then pytest fixtures. The Python tutorial is for lookups when
something in the repo is unfamiliar.
