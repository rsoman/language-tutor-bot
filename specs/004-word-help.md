# 004: Word help (frontend, with the API contract stub)

- **Status:** ready (built ahead of review, at Ravi's request, 2026-11-26)
- **Owner:** Claude-generated (frontend, the request model, a router that answers 501). The response
  model and looking words up (word data, retrieval) are hand-written by Ravi (his decision,
  2026-11-27).
- **Phase:** 1
- **Builds on:** spec 003 (PR #4)

## Goal

While writing a message, the learner can look up a word before sending it: the lightbulb button
next to the message box opens "Word help", the learner types a word in their own language, and sees
the target-language word with its grammatical features (D0003) and an example sentence. One click
inserts the word into the message. On phones it opens as a bottom sheet.

## Out of scope

- Where word data comes from (word list, RAG or LLM). Ravi's part; the endpoint answers 501.
- Several matches for one query. The API returns one best match or none.
- Adding the looked-up word to drills (later, with vocabulary specs).
- Word help outside Conversation (for example in tests). Only the composer has it.

## Design source

Canvas: Main board, Conversation tab with the `showWordHelp` tweak on; Mobile layouts ("word help as
a bottom sheet").

- Lightbulb button, 52x52, between the message box and Send, `aria-label="Word help"`,
  `aria-expanded`.
- Desktop and tablet: a 360px popover above the composer, right-aligned, surface background, radius 16.
  Phone: a bottom sheet across the full width, above the tab bar.
- Contents: heading "Word help" with a close button; a labelled input; a result block on the
  highlight-soft background with the headword (Outfit 22px), a feature line, and the example
  sentence with its translation; a full-width primary button "Insert into my message".

## Behaviour

- The lightbulb toggles the popover. Opening moves focus to the input. Escape or the close button
  closes it and returns focus to the lightbulb.
- The learner types a word and presses Enter or "Look up". Empty input does nothing.
- While looking up: "Looking up…". Found: the result block. Not found (404): `No match for "<word>".`
  Failed (other errors): "Couldn't look that up." with "Try again".
- The feature line is `<part of speech>` followed by each feature as `<name>: <value>`, joined with
  " · ", in the order the API sends them. The UI never names a feature itself (D0003).
- "Insert into my message" adds the headword to the end of the message box (with a space if the box
  is not empty), closes the popover and puts focus back in the message box.

## API contract

New router `backend/src/tutor/routers/words.py` with the request model (`WordLookupIn`). Validates
input, then answers 501 `{"detail": "Word lookup is not written yet"}`.

**Ravi writes the response model** (the shape below) with the lookup logic. Until then it exists
only as this description and as the hand-written frontend type `Word` in
`frontend/src/api/tutorTypes.ts`, which mirrors it.

`GET /words/lookup?language=xx&level=L1&query=coffee`

- `language` must be supported and `level` one of its levels (422 otherwise).
- `query` is 1 to 60 characters (422 otherwise).
- `200` with a word (shape below); `404` with `{"detail": "No match"}` when nothing matches (once the logic exists).

```json
{
  "headword": "…",
  "part_of_speech": "noun",
  "features": [
    { "name": "gender", "value": "…" },
    { "name": "plural", "value": "…" }
  ],
  "example": { "text": "…", "translation": "…" }
}
```

`features` holds what the language's profile declares for that part of speech (D0003), possibly
empty. `example` may be null.

## Acceptance criteria

Scenarios go in `frontend/e2e/features/004-word-help.feature`, word for word. Background as in
spec 003 (Examplish at L1, Conversation open).

```gherkin
Feature: Word help

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the dictionary knows "coffee" as "the-coffee", a "noun" with "gender" "neuter" and "plural" "the-coffees"
    When the learner opens Conversation

  Scenario: Word help opens from the message box
    When the learner opens word help
    Then the word help panel is shown
    And the word help input has focus

  Scenario: Looking up a word shows its translation, features and example
    When the learner opens word help
    And the learner looks up "coffee"
    Then the word help shows "the-coffee"
    And the word help shows "noun · gender: neuter · plural: the-coffees"
    And the word help shows the example sentence

  Scenario: A word the dictionary does not know
    When the learner opens word help
    And the learner looks up "blorp"
    Then the word help shows 'No match for "blorp".'

  Scenario: The found word goes into the message
    When the learner types "I want"
    And the learner opens word help
    And the learner looks up "coffee"
    And the learner inserts the word into the message
    Then the message box contains "I want the-coffee"
    And the word help panel is not shown

  Scenario: Escape closes word help
    When the learner opens word help
    And the learner presses Escape
    Then the word help panel is not shown
    And the word help button has focus

  Scenario: On a phone word help is a bottom sheet
    Given the learner uses a phone-sized screen
    When the learner opens word help
    Then the word help panel spans the width of the screen
```

Backend criteria (pytest, `backend/tests/test_words.py`):

- [x] A valid lookup answers 501.
- [x] An unsupported language, a level outside the language, an empty query, or a query over 60 characters answers 422.
- [x] The OpenAPI schema lists the lookup's parameters `language`, `level` and `query`. (The response
      model is Ravi's; this criterion replaced "lists `WordOut` with `features` as a list of
      `{name, value}`" after his decision on 2026-11-27.)

Component tests (Vitest): the "Looking up…" state; the failure state with "Try again"; a word with
no features and no example shows only the headword and part of speech; inserting into an empty box
adds no leading space; the lightbulb's `aria-expanded`.

Other criteria:

- [x] All frontend and backend checks pass; axe finds no violations with word help open, with a result, at all three breakpoints.
- [x] No real language in frontend code or tests.

## Decisions

- D0003 (features come from the language profile), D0004 (bottom sheet on phones) followed.
- Proposed for Ravi's review:
  - **One best match** per lookup, not a list. A list can come later if real data needs it.
  - **Lookup is explicit** (Enter or "Look up"), not search-as-you-type, so every keystroke does not
    cost a request (and later possibly an LLM call).
  - **Features as `{name, value}` pairs** with free-text names from the profile, so the UI stays generic.
  - Input label is "Word to look up" (the canvas says "Word in English", which assumes the learner's own language).

## Notes

- `frontend/src/features/wordHelp/` (WordHelp, useWordLookup). WordHelp lives inside `Composer`, which
  gains an insert-text path.
- Fake API: `/api/words/lookup` route in `e2e/steps/fixtures.ts`, driven by a dictionary map.
