# 006: Grammar topics (frontend, with the API contract stub)

- **Status:** draft (scenarios for the owner's approval in a spec-only PR, 2026-11-28; code in PR #7)
- **Owner:** Claude-generated (frontend, Pydantic models, a router that answers 501). The topic list,
  progress tracking and the pass mark are hand-written by Ravi.
- **Phase:** 1
- **Builds on:** spec 005, scenario picker (spec-only PR #18, not merged yet; code in PR #6). This
  spec only needs the mode tabs and the language and level choice from spec 002, which is on main.

## Goal

In Grammar mode the learner sees the grammar topics of their level, each with its progress
(learned how often, best test score, passed or not), and links to learn or test it. The learner
can tick several topics and start one combination test over them. Lessons and tests themselves
come in specs 007 and 008.

## Out of scope

- Which topics exist, how progress is tracked, and what counts as passed (pass mark 8/10 is a
  placeholder Ravi accepted). Ravi's part; the endpoint answers 501.
- The lesson screen (spec 007) and the test and results screens (spec 008). Their routes exist here
  only as "not built yet" placeholders, so the links do not bounce to Conversation.
- Keeping the ticked topics across reloads.
- A combination test address with an unknown topic id. Spec 008 reads the address and decides.
- Authentication and rate limits, while the endpoints only answer 501. They sit on the public allowlist under ADR 0005. The ADR's guard test fails if an allowlisted route answers anything but 501, so these endpoints cannot gain real logic without auth, 401 and 403 tests, and (for LLM endpoints) a per-user rate limit.

## Design source

Canvas: Main board, Grammar tab; Mobile layouts ("Grammar": topic grid becomes one list,
combination test becomes a pinned bar at the bottom).

- Heading row: "<level> grammar topics" (Outfit 22px) and, on the right, "Learn a topic as often as
  you like, then test yourself" (13px muted).
- Combination test panel: surface background, line border, radius 16. "Combination test" (15px,
  600) with "Tick the topics to test together. It starts with questions on your past mistakes."
  (13px muted), then buttons "Select all passed", "Clear" and the primary action.
- Primary action: "Start test · <n> topic(s)" when topics are ticked, else "Choose topics first"
  (disabled).
- Topic card: surface, line border, radius 16. A checkbox and the topic title (Outfit 17px) in one
  label row, a "Passed" badge (good colour) on the right when passed; the example in the target
  language (14px muted, `lang` set); a progress line (12.5px muted) and two actions: "Learn" or
  "Learn again" (secondary) and "Test" (primary).
- Desktop and tablet: the panel sits above a 2-column grid of cards. Phone: one column, and the
  combination test panel becomes a bar pinned above the tab bar (D0004), holding only the buttons.

## Behaviour

- `/grammar` with a chosen language loads `GET /grammar/topics?language&level`. Loading: "Loading
  grammar topics…". Failure: "Couldn't load grammar topics." with "Try again". Without a chosen
  language the spec 002 prompt shows (unchanged).
- Progress line, from the API's numbers:
  - `times_learned` 0, no `best_score`: "Not started".
  - `times_learned` 0 with a score (tested without learning): "Not learned yet · best test
    <correct>/<total>". The "Passed" badge follows `passed` as usual.
  - learned, no `best_score`: "Learned <n>× · no test yet".
  - learned with a score: "Learned <n>× · best test <correct>/<total>".
- The learn action reads "Learn" when `times_learned` is 0, else "Learn again".
- With no topics at the level the page says "No grammar topics for <level> yet."
- Each checkbox is labelled "Include <title> in combination test". "Select all passed" ticks exactly
  the passed topics (and unticks the others); it is disabled when no topic is passed. "Clear"
  unticks all.
- The combination test action reads "Choose topics first" and is disabled with nothing ticked, then
  "Start test · 1 topic", "Start test · 2 topics" and so on.
- Links:
  - Learn: `/grammar/topics/<id>/lesson` (spec 007).
  - Test: `/grammar/topics/<id>/test` (spec 008).
  - Start test: `/grammar/test?topics=<id>,<id>` in list order (spec 008).
  - Until those specs, each route shows a heading ("Lesson", "Test" or "Combination test"), the
    line "This part is not built yet." and a "← Grammar" link. The Grammar tab stays current there.
- Changing language or level clears the ticks (new topics load).

## API contract

New router `backend/src/tutor/routers/grammar.py`; validates input, then answers 501
`{"detail": "Grammar topics are not written yet"}`.

`GET /grammar/topics?language=xx&level=L1` → `200 list[GrammarTopicOut]` once the owner writes the
logic. This spec delivers the stub, which answers 501 to a valid request.

```json
{
  "id": "g-articles",
  "title": "Articles and gender",
  "example": "…",
  "times_learned": 2,
  "best_score": { "correct": 8, "total": 10 },
  "passed": true
}
```

- `title` is in the learner's language; `example` in the target language.
- `best_score` is null until the learner has taken a test on the topic.
- `passed` is decided by the server (the pass mark is not the frontend's business).
- 422 for an unsupported language, a level outside it, or a missing parameter (shared
  `LanguageLevelIn`). The language is checked first, so with an unsupported language the level is
  not looked at.

## Test scenarios

Approved by the owner in a spec-only PR before any code (`docs/conventions/testing.md`).

Scenarios go in `frontend/e2e/features/006-grammar-topics.feature`, word for word. The fake API
offers, for Examplish at L1: "Topic one" (`g-1`, learned 2×, best 8/10, passed), "Topic two"
(`g-2`, learned 1×, best 5/10), "Topic three" (`g-3`, not started).

Shared setup:

```gherkin
Feature: Grammar topics

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the grammar topics on offer are the fake set
```

### Positive

```gherkin
  Scenario: The level's topics are listed
    When the learner opens Grammar
    Then the page shows the heading "L1 grammar topics"
    And the topics listed are "Topic one, Topic two, Topic three"

  Scenario: Each topic shows its progress
    When the learner opens Grammar
    Then the "Topic one" topic shows "Passed"
    And the "Topic one" topic shows "Learned 2× · best test 8/10"
    And the "Topic two" topic shows "Learned 1× · best test 5/10"
    And the "Topic three" topic shows "Not started"

  Scenario: A topic never learned offers Learn, a learned one Learn again
    When the learner opens Grammar
    Then the "Topic three" topic offers "Learn"
    And the "Topic one" topic offers "Learn again"

  Scenario: Select all passed and Clear
    When the learner opens Grammar
    And the learner ticks "Topic two"
    And the learner picks "Select all passed"
    Then only "Topic one" is ticked
    When the learner picks "Clear"
    Then no topic is ticked

  @smoke
  Scenario: Starting a combination test
    When the learner opens Grammar
    And the learner ticks "Topic one"
    And the learner ticks "Topic three"
    And the learner starts the combination test
    Then the address ends with "/grammar/test?topics=g-1,g-3"
    And the "Grammar" mode tab is the current page

  Scenario: On a phone the combination test bar sits above the tab bar
    Given the learner uses a phone-sized screen
    When the learner opens Grammar
    Then the combination test bar is just above the mode tabs

  Scenario: Learn opens the lesson page, which is not built yet
    When the learner opens Grammar
    And the learner picks "Learn" for "Topic three"
    Then the address ends with "/grammar/topics/g-3/lesson"
    And the page shows the heading "Lesson"
    And the page shows "This part is not built yet."
    And the "Grammar" mode tab is the current page

  Scenario: Test opens the topic test page, which is not built yet
    When the learner opens Grammar
    And the learner picks "Test" for "Topic one"
    Then the address ends with "/grammar/topics/g-1/test"
    And the page shows the heading "Test"
    And the "Grammar" mode tab is the current page
```

### Negative

```gherkin
  Scenario: The combination test needs at least one topic
    When the learner opens Grammar
    Then the combination test action reads "Choose topics first" and is disabled
    When the learner ticks "Topic two"
    Then the combination test action reads "Start test · 1 topic"

  Scenario: The learner can retry when topics fail to load
    Given the grammar topics request fails once
    When the learner opens Grammar
    Then the page shows "Couldn't load grammar topics."
    When the learner picks "Try again"
    Then the topics listed are "Topic one, Topic two, Topic three"
```

### Edge cases

```gherkin
  Scenario: The test action counts two topics in the plural
    When the learner opens Grammar
    And the learner ticks "Topic one"
    And the learner ticks "Topic two"
    Then the combination test action reads "Start test · 2 topics"

  Scenario: Changing the level clears the ticks
    When the learner opens Grammar
    And the learner ticks "Topic two"
    And the learner changes the level to "L2"
    Then no topic is ticked

  Scenario: With no topics at the level the page says so
    Given no grammar topics are on offer
    When the learner opens Grammar
    Then the page shows "No grammar topics for L1 yet."

  Scenario: Select all passed is disabled when no topic is passed
    Given no grammar topic on offer is passed
    When the learner opens Grammar
    Then "Select all passed" is disabled

  Scenario: On a phone the combination test bar holds only the buttons
    Given the learner uses a phone-sized screen
    When the learner opens Grammar
    Then the combination test bar holds only "Select all passed", "Clear" and the combination test action

  Scenario: The learner sees that topics are loading
    Given the grammar topics request is slow
    When the learner opens Grammar
    Then the page shows "Loading grammar topics…"

  Scenario: Changing the language clears the ticks
    When the learner opens Grammar
    And the learner ticks "Topic two"
    And the learner changes the language to "Samplese"
    And the learner changes the language to "Examplish"
    Then no topic is ticked

  Scenario: A topic learned but never tested says so
    Given "Topic two" has been learned 1× with no test yet
    When the learner opens Grammar
    Then the "Topic two" topic shows "Learned 1× · no test yet"

  Scenario: A topic tested but never learned shows its score
    Given "Topic three" has been tested 9/10 and passed without being learned
    When the learner opens Grammar
    Then the "Topic three" topic shows "Not learned yet · best test 9/10"
    And the "Topic three" topic shows "Passed"
    And the "Topic three" topic offers "Learn"

  Scenario: The combination test lists topics in list order, not tick order
    When the learner opens Grammar
    And the learner ticks "Topic three"
    And the learner ticks "Topic one"
    And the learner starts the combination test
    Then the address ends with "/grammar/test?topics=g-1,g-3"
```

### API (backend)

These go in `backend/tests/features/006-grammar-topics.feature` (pytest-bdd). The endpoints are stubs, so a valid request answers 501 until the owner writes the logic. The steps pick a supported language and its levels come from the language registry, so no real language is named.

```gherkin
Feature: Grammar topics API contract

  Scenario Outline: Topics need a supported language and level
    When a client lists grammar topics in <language> at <level>
    Then the API answers <status>
      Examples:
        | language                | level                    | status |
        | a supported language    | one of its levels        | 501    |
        | an unsupported language | any level (ignored)      | 422    |
        | a supported language    | a level it does not have | 422    |
        | a supported language    | no level at all          | 422    |
        | no language at all      | one of its levels        | 422    |
```

The rows name values the steps take from the language registry: "a supported language" is any
registered language and "one of its levels" any level it has, so no real language is written down.
In the unsupported-language row the level is not looked at, because the language is checked first.
In the no-language row the level is any registered level, sent without a `language` parameter.

### Below the UI: backend and component tests

Backend criteria (pytest, `backend/tests/test_grammar.py`):

- [ ] `GET /grammar/topics` with a supported language and level answers 501; an unsupported language or level answers 422.
- [ ] The OpenAPI schema lists `GrammarTopicOut` with `best_score` nullable.
- [ ] The ADR 0005 guard test covers these routes: each answers 501 to valid input while it is on the public allowlist.

Component tests (Vitest): loading and failure states; the four progress-line forms; a topic's
example carries `lang`; "Start test · 2 topics" (plural); ticks are cleared when the level changes;
the not-built-yet placeholder for a lesson link.

## Non-behavioural criteria

- [ ] Lint, format, types, build and tests pass in CI.
- [ ] All checks pass; axe finds no violations on Grammar with topics, at all three breakpoints.
- [ ] No real language in frontend code or tests.
- [ ] At least 80% of changed lines covered.

## Decisions

- D0004 followed (pinned bar above the tab bar on phones).
- Proposed for Ravi's review:
  - **Progress as numbers, wording in the UI** (`times_learned`, `best_score`, `passed`), unlike
    scenarios' `last_result` string. The progress line has a fixed shape, so the UI can own it.
  - **One set of labels on every screen size**: the phone board says "All passed" and "Test 2 topics
    together"; this spec uses "Select all passed" and "Start test · 2 topics" everywhere, so the
    tests and screen readers see one wording.
  - **Heading uses the learner's level from the picker** ("L1 grammar topics"), never a hard-coded "A1".
  - **Combination test address** carries the topic ids as a query string, so it can be bookmarked and
    spec 008 can read it without shared state.
  - **"Not built yet" placeholder routes** for lesson and test, so the links work before 007 and 008.

## Notes

- `frontend/src/features/grammar/` (GrammarTopicsScreen, TopicCard, ComboTestBar, useGrammarTopics,
  progressLine, NotBuiltYet).
- `ModePage` gets `grammar: GrammarTopicsScreen`.
