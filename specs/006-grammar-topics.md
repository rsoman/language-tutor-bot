# 006: Grammar topics (frontend, with the API contract stub)

- **Status:** ready (built ahead of review, at Ravi's request, 2026-11-26)
- **Owner:** Claude-generated (frontend, Pydantic models, a router that answers 501). The topic list,
  progress tracking and the pass mark are hand-written by Ravi.
- **Phase:** 1
- **Builds on:** spec 005 (PR #6)

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
  - `times_learned` 0: "Not started".
  - learned, no `best_score`: "Learned <n>× · no test yet".
  - learned with a score: "Learned <n>× · best test <correct>/<total>".
- The learn action reads "Learn" when `times_learned` is 0, else "Learn again".
- Each checkbox is labelled "Include <title> in combination test". "Select all passed" ticks exactly
  the passed topics (and unticks the others); "Clear" unticks all.
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

`GET /grammar/topics?language=xx&level=L1` → `200 list[GrammarTopicOut]`

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
- 422 for an unsupported language or a level outside it (shared `LanguageLevelIn`).

## Acceptance criteria

Scenarios go in `frontend/e2e/features/006-grammar-topics.feature`, word for word. The fake API
offers, for Examplish at L1: "Topic one" (learned 2×, best 8/10, passed), "Topic two" (learned
1×, best 5/10), "Topic three" (not started).

```gherkin
Feature: Grammar topics

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the grammar topics on offer are the fake set

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

  Scenario: The combination test needs at least one topic
    When the learner opens Grammar
    Then the combination test action reads "Choose topics first" and is disabled
    When the learner ticks "Topic two"
    Then the combination test action reads "Start test · 1 topic"

  Scenario: Select all passed and Clear
    When the learner opens Grammar
    And the learner ticks "Topic two"
    And the learner picks "Select all passed"
    Then only "Topic one" is ticked
    When the learner picks "Clear"
    Then no topic is ticked

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
```

Backend criteria (pytest, `backend/tests/test_grammar.py`):

- [x] `GET /grammar/topics` with a supported language and level answers 501; an unsupported language or level answers 422.
- [x] The OpenAPI schema lists `GrammarTopicOut` with `best_score` nullable.

Component tests (Vitest): loading and failure states; the three progress-line forms; a topic's
example carries `lang`; "Start test · 2 topics" (plural); ticks are cleared when the level changes;
the not-built-yet placeholder for a lesson link.

Other criteria:

- [x] All checks pass; axe finds no violations on Grammar with topics, at all three breakpoints.
- [x] No real language in frontend code or tests.

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
