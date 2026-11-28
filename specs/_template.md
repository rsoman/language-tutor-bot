# NNN: Feature name

- **Status:** draft | approved | done
- **Owner:** Claude-generated | hand-written
- **Phase:** 0 | 1 | 2 | 3 | 4

## Goal

One or two sentences: what the learner or developer can do after this ships.

## Out of scope

What this spec deliberately does not cover.

## API contract

Endpoints, request/response schemas, error cases.

## Test scenarios

Approved by the owner in a spec-only PR before any code (`docs/conventions/testing.md`).
Write each scenario in Gherkin. Each one becomes a scenario in
`backend/tests/features/NNN-name.feature` (or the frontend equivalent), with the same wording.
Tag the main happy path `@smoke`.

### Positive

```gherkin
@smoke
Scenario: Short name of the behaviour
  Given some starting state
  When the learner or client does something
  Then this observable result happens
```

### Negative

Invalid input, missing auth (401), another user's data (403), upstream failure.

### Edge cases

Empty, longest allowed, boundary values, slow or repeated actions.

## Non-behavioural criteria

- [ ] Lint, format, types, build and tests pass in CI.
- [ ] At least 80% of changed lines covered.

## Decisions

Links to ADRs (`docs/adr/`) or design records (`docs/design/`) this spec depends on or creates.

## Notes

Design hints, links, open questions.
