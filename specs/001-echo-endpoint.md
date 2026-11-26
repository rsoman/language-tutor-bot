# 001: Echo endpoint

- **Status:** ready
- **Owner:** hand-written (Ravi), as a first FastAPI exercise
- **Phase:** 0

## Goal

Practise FastAPI basics: path operations, Pydantic request/response models, validation
errors and tests. This endpoint is a stand-in for the future chat endpoint.

## Out of scope

Any LLM call.

## API contract

`POST /echo`

Request:

```json
{ "message": "Hallo", "language": "de" }
```

Response `200`:

```json
{ "message": "Hallo", "language": "de", "length": 5 }
```

Errors:
- `422` when `message` is empty or longer than 500 characters.
- `422` when `language` is not in `tutor.languages.LANGUAGES`.

## Acceptance criteria

- [ ] Request and response are Pydantic models.
- [ ] `language` defaults to `Settings.default_language` when omitted.
- [ ] Tests cover the happy path and all three error cases.
- [ ] `ruff`, `pyright` and `pytest` pass in CI.

## Notes

Look up `Field(min_length=..., max_length=...)` and `field_validator` in the Pydantic docs.
