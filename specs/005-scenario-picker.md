# 005: Scenario picker (frontend, with the API contract stub)

- **Status:** ready (built ahead of review, at Ravi's request, 2026-11-26). Note: the scenario design
  on the canvas was still "proposed, awaiting Ravi's OK" when this was written.
- **Owner:** Claude-generated (frontend, Pydantic models, routers that answer 501). Scenario content,
  recommendations and progress are hand-written by Ravi.
- **Phase:** 1
- **Builds on:** spec 004 (PR #5)

## Goal

The learner can practise a conversation in a scenario (for example ordering at a café): a chip above
the chat shows the current scenario with "Change"; the scenario page lists recommended scenarios, all
scenarios at the learner's level (with Done and last result), and stretch scenarios one level up.
Picking one starts a new conversation in that scenario.

## Out of scope

- Scenario content, how recommendations are chosen, and how "done" and "last result" are tracked.
  Ravi's part; the endpoint answers 501.
- Filtering or searching scenarios.
- Scenarios in modes other than Conversation.

## Design source

Canvas: Scenarios board ("Choose a scenario"), Main board (scenario chip above the chat), Mobile
layouts ("Scenario picker": recommended scenarios scroll sideways, the full list becomes rows with a
Done badge).

- Chip: centred above the messages, pill, surface background, line border, 13px muted text,
  `Scenario: <title> · Change` ("Change" in primary, bold). With no scenario: `Free conversation · Choose a scenario`.
- Page: back link "← Back to conversation", title "Choose a scenario" (Outfit 30px), and on the right
  "<done> of <total> <level> scenarios done".
- Sections, each with a small uppercase heading: "Recommended next" (cards with a 2px primary border),
  "All <level> scenarios" (1px line border; Done badge in the good colour, "Last time: …" and
  "Practise again" for done ones, topics for the others), "Stretch · <next level>" with the note
  "A step up. The tutor keeps its replies simple and gives more hints." (dashed border, "Stretch" badge
  on the highlight-soft background).
- Card: title (learner's language, Outfit), the title in the target language (muted, `lang` set),
  topics line at the bottom.
- Desktop: 4 columns. Tablet: 2 columns. Phone: recommended cards in one row that scrolls sideways;
  the other lists are single-column rows.
- A "Free conversation" button next to the back link lets the learner leave scenarios.

## Behaviour

- Route: `/conversation/scenarios`. The Conversation tab stays the current page there.
- The page loads `GET /scenarios?language&level`. Loading: "Loading scenarios…". Failure:
  "Couldn't load scenarios." with "Try again".
- "Recommended next" lists scenarios with `recommended: true` at the learner's level. "All <level>
  scenarios" lists every scenario at the learner's level (recommended ones too). "Stretch · <level>"
  lists scenarios at any other level; the section is left out when there are none. The stretch level
  name comes from the scenarios, never from a level system.
- Picking a card (or "Free conversation") goes back to `/conversation` and starts a new conversation
  with that scenario (or none). The choice is kept for that language and level while the app is open.
- Changing language or level clears the scenario.

## API contract

New router `backend/src/tutor/routers/scenarios.py`; answers 501
`{"detail": "Scenarios are not written yet"}` after validating input.

`GET /scenarios?language=xx&level=L1` → `200 list[ScenarioOut]`

```json
{
  "id": "s-cafe",
  "title": "Ordering at a café",
  "native_title": "…",
  "topics": "Drinks, accusative articles",
  "level": "L1",
  "recommended": false,
  "done": true,
  "last_result": "Last time: 3 corrections, 2 new words"
}
```

`last_result` may be null. `level` is one of that language's levels.

Changed: `ConversationIn` (spec 003) gains `scenario_id: str | None = None`. An unknown id is a 404
once the logic exists; the stub still answers 501.

## Acceptance criteria

Scenarios go in `frontend/e2e/features/005-scenario-picker.feature`, word for word. The fake API
offers, for Examplish at L1: "Cafe scene" (recommended), "Bakery scene" (done, "Last time: 1 correction"),
and at L2 "Doctor scene".

```gherkin
Feature: Scenario picker

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the scenarios on offer are the fake set

  Scenario: Without a scenario the chat offers one
    When the learner opens Conversation
    Then the scenario chip reads "Free conversation · Choose a scenario"

  Scenario: The scenario page groups scenarios
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the section "Recommended next" lists "Cafe scene"
    And the section "All L1 scenarios" lists "Cafe scene, Bakery scene"
    And the section "Stretch · L2" lists "Doctor scene"
    And the page says "1 of 2 L1 scenarios done"

  Scenario: A done scenario shows its last result
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the "Bakery scene" card shows "Done"
    And the "Bakery scene" card shows "Last time: 1 correction"

  Scenario: Picking a scenario starts a conversation in it
    When the learner opens Conversation
    And the learner opens the scenario page
    And the learner picks the scenario "Cafe scene"
    Then the address ends with "/conversation"
    And the scenario chip reads "Scenario: Cafe scene · Change"
    And the conversation was started with scenario "s-cafe"

  Scenario: The learner can go back to a free conversation
    When the learner opens Conversation
    And the learner opens the scenario page
    And the learner picks the scenario "Cafe scene"
    And the learner opens the scenario page
    And the learner picks "Free conversation"
    Then the scenario chip reads "Free conversation · Choose a scenario"

  Scenario: The Conversation tab stays current on the scenario page
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the "Conversation" mode tab is the current page
```

Backend criteria (pytest, `backend/tests/test_scenarios.py`):

- [ ] `GET /scenarios` with a supported language and level answers 501; unsupported language or level answers 422.
- [ ] `POST /conversations` accepts an optional `scenario_id` (still 501).
- [ ] The OpenAPI schema lists `ScenarioOut`.

Component tests (Vitest): loading and failure states; the stretch section is left out with no other-level
scenarios; a card's target-language title carries `lang`; the scenario is cleared when the level changes.

Other criteria:

- [ ] All checks pass; axe finds no violations on the scenario page at all three breakpoints.
- [ ] No real language or level system in frontend code or tests.

## Decisions

- D0004 followed (sideways-scrolling recommended row on phones).
- Proposed for Ravi's review:
  - **Building scenarios at all**: the canvas marked them proposed. If Ravi drops scenarios, this PR is dropped and nothing below it depends on it.
  - **Scenarios are a flat list** with `level`, `recommended`, `done`; the client groups them. Simpler
    than a server-shaped response with sections.
  - **"Stretch" means any other level the API returns**; the server decides which (one level up today).
  - **The scenario choice is not saved across reloads**, matching conversations (spec 003).
  - **A "Free conversation" button** (not on the canvas) so a scenario is never a one-way door.

## Notes

- `frontend/src/features/scenarios/` (ScenarioPage, ScenarioCard, ScenarioChip, useScenarios).
- The chosen scenario lives in `ConversationProvider` next to the conversation.
