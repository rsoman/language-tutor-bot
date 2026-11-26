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
- `422` when `language` is missing or not in `tutor.languages.LANGUAGES`.

## Acceptance criteria

Each scenario becomes one scenario in `backend/tests/features/001-echo-endpoint.feature`, with
the same wording. Tests pick the language code from `tutor.languages.LANGUAGES`, never a literal.

```gherkin
Feature: Echo endpoint

  Scenario: A valid message is echoed back with its length
    Given a supported language code
    When I post a message "hello" in that language to /echo
    Then the response status is 200
    And the response contains the same message and language
    And the reported length is 5

  Scenario: An empty message is rejected
    Given a supported language code
    When I post an empty message in that language to /echo
    Then the response status is 422

  Scenario: A message longer than 500 characters is rejected
    Given a supported language code
    When I post a message of 501 characters in that language to /echo
    Then the response status is 422

  Scenario: An unsupported language is rejected
    When I post a message "hello" with language "xx" to /echo
    Then the response status is 422

  Scenario: A missing language is rejected
    When I post a message "hello" with no language to /echo
    Then the response status is 422
```

Other criteria:

- [ ] Request and response are Pydantic models.
- [ ] `ruff`, `pyright` and `pytest` pass in CI.

## Decisions

- `language` is required. There is no default target language (review on PR #1, 2026-11-26);
  later it comes from the logged-in user's saved choice.
- ADR 0001: language-agnostic core.

## Notes

Look up `Field(min_length=..., max_length=...)` and `field_validator` in the Pydantic docs.
For the BDD steps, copy the pattern in `backend/tests/bdd/test_health_feature.py`.
