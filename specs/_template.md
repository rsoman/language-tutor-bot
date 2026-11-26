# NNN: Feature name

- **Status:** draft | ready | done
- **Owner:** Claude-generated | hand-written
- **Phase:** 0 | 1 | 2 | 3 | 4

## Goal

One or two sentences: what the learner or developer can do after this ships.

## Out of scope

What this spec deliberately does not cover.

## API contract

Endpoints, request/response schemas, error cases.

## Acceptance criteria

Write each criterion as a Gherkin scenario. Each one becomes a scenario in
`backend/tests/features/NNN-name.feature` (or the frontend equivalent), with the same wording.

```gherkin
Scenario: Short name of the behaviour
  Given some starting state
  When the learner or client does something
  Then this observable result happens
```

Non-behavioural criteria (lint, types, CI) go here as checkboxes:

- [ ] `ruff`, `pyright` and `pytest` pass in CI.

## Decisions

Links to ADRs (`docs/adr/`) or design records (`docs/design/`) this spec depends on or creates.

## Notes

Design hints, links, open questions.
