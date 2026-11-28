# 003: Conversation chat (frontend, with the API contract stub)

- **Status:** draft (scenarios for the owner's approval in a spec-only PR, 2026-11-28; code in PR #4)
- **Owner:** Claude-generated (frontend, request models, a router that returns 501). The response
  models (the tutor's LLM output) and the conversation logic behind the endpoints are hand-written
  by Ravi (his decision, 2026-11-26).
- **Phase:** 1
- **Builds on:** spec 002 (PR #3)

## Goal

In Conversation mode the learner chats with the tutor: the tutor opens, the learner replies,
and each learner message can get feedback cards (grammar mistake, new word, word already learned,
unclear word) that follow D0001 and D0002. The screen matches the Main board's Conversation tab and
the Mobile "Conversation" phone. The backend is mocked in every test; the real endpoints exist
only as a typed contract that answers 501 until Ravi writes the logic.

## Out of scope

- The tutor's logic: prompts, LLM calls, deciding what feedback to give. Hand-written by Ravi.
- Authentication and rate limits, while the endpoints only answer 501. They sit on the public allowlist under ADR 0005. The ADR's guard test fails if an allowlisted route answers anything but 501, so these endpoints cannot gain real logic without auth, 401 and 403 tests, and (for LLM endpoints) a per-user rate limit.
- Word help (the lightbulb popover): spec 004.
- Scenarios (the "Scenario: … · Change" chip and the picker): spec 005. Conversations here have no scenario.
- Streaming replies token by token. A reply arrives whole. Streaming can be a later spec once the
  backend streams.
- Keeping a conversation across reloads. Reloading starts a new conversation.
- "Remember this?" cards for words introduced long ago (proposed in D0002, not decided).

## Design source

Canvas: https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN (Main board, Conversation tab; Cards board;
Mobile layouts, Conversation phone).

- Tutor bubble: left, surface background, line border, radius 18 18 18 6, 16px text, max 520px
  (85% on mobile). The translation sits under it in 13px muted text.
- Learner bubble: right, primary background, on-primary text, radius 18 18 6 18.
- Feedback card: under the learner bubble, right-aligned, 440px wide (full width on mobile), surface
  background, line border, radius 14, a 4px top border in the card's colour. Every card that
  corrects something ends with the full corrected sentence, changed parts in bold, above a divider (D0001).
- Composer: a text box (16px text, Shift+Enter for a new line) and a Send button, 52px tall, under the messages. On mobile it is
  pinned to the bottom, above the tab bar (D0004).

| Card kind | Top border | Heading | Right note | Body |
|---|---|---|---|---|
| `grammar_error` | accent | "Almost there" | none | ~~original~~ → **replacement**, explanation, corrected sentence |
| `new_word` | highlight | "New word" | "Added to your drills" | original = **replacement**, corrected sentence |
| `known_word` | accent | "You've seen this one" | "Moved up in your drills" | ~~original~~ → **replacement**, explanation, corrected sentence |
| `unclear_word` | highlight | "Which word did you mean?" | none | explanation (the tutor's question). No corrected sentence, because nothing was corrected. |

Red (accent) means a mistake, amber (highlight) means help, as on the Cards board.

## Behaviour

- Opening Conversation mode with a chosen language starts a conversation: the screen calls
  `POST /conversations` and shows the tutor's opening message. While it loads, the message area
  says "Starting a conversation…".
- Changing the language or level starts a new conversation.
- Without a chosen language the spec 002 prompt shows instead (unchanged).
- The learner types a message and presses Send or Enter (Shift+Enter adds a new line instead). The message appears at once as a learner
  bubble, the input clears, and a "Tutor is typing" indicator shows until the reply arrives.
- The reply adds feedback cards under the learner's message (in the order the API sends them),
  then the tutor's next message.
- Send is disabled while the input is empty or only spaces, while a reply is pending, and while
  the conversation is starting. The input allows at most 500 characters.
- If sending fails, the learner's message stays with "Not sent." and a "Try again" button that sends
  the same text again. If starting fails, the message area says "Couldn't start a conversation."
  with "Try again".
- New messages scroll into view. The message list is a `log` region, so screen readers announce
  new messages.

## API contract

A router in `backend/src/tutor/routers/conversations.py` with the request models (`ConversationIn`,
`TurnIn`). Both endpoints validate their input and then answer `501 Not Implemented` with
`{"detail": "Conversation logic is not written yet"}`.

The response shapes below are the tutor's LLM output, so **Ravi writes their Pydantic models**
along with the logic that replaces the 501s. Until then they exist only as this description and as
hand-written frontend types in `frontend/src/api/tutorTypes.ts`, which mirror it. Once his models
land, the frontend switches to generated types (`pnpm gen:api`) and deletes `tutorTypes.ts`.

`POST /conversations`

```json
// ConversationIn
{ "language": "xx", "level": "L1" }
// 201 ConversationOut
{ "id": "c-123", "opening": { "text": "…", "translation": "…" } }
```

`POST /conversations/{id}/turns`

```json
// TurnIn: message is 1 to 500 characters
{ "message": "…" }
// 200 TurnOut
{
  "feedback": [
    {
      "kind": "grammar_error",
      "original": "…",
      "replacement": "…",
      "explanation": "…",
      "corrected_sentence": [
        { "text": "…", "changed": false },
        { "text": "…", "changed": true },
        { "text": "…", "changed": false }
      ]
    }
  ],
  "reply": { "text": "…", "translation": "…" }
}
```

- `TutorMessageOut`: `text` (target language), `translation` (learner's language, may be null).
- `FeedbackOut`: `kind` is one of `grammar_error`, `new_word`, `known_word`, `unclear_word`.
  `original`, `replacement`, `explanation` and `corrected_sentence` are each nullable; which ones
  are set depends on the kind (table above).
- `corrected_sentence` is a list of segments, so the frontend never computes spans from character
  offsets. Joining the segments' `text` gives the full corrected sentence (D0001).
- Errors: `422` when `language` is not supported, `level` is not one of that language's levels,
  or `message` is empty, only spaces, or over 500 characters. Surrounding spaces are stripped before
  the length check. `404` for an unknown conversation id, once the logic exists: the stub has no
  conversations to look up, so that test comes with the owner's logic PR, not this spec.

## Test scenarios

Approved by the owner in a spec-only PR before any code (`docs/conventions/testing.md`).

Frontend scenarios go in `frontend/e2e/features/003-conversation-chat.feature`, word for word.
The fake API answers with fixed made-up text in fake languages; the steps choose "Examplish" at "L1".

Shared setup:

```gherkin
Feature: Conversation chat

  Background:
    Given the learner has chosen "Examplish" at level "L1"
```

### Positive

```gherkin
  Scenario: The tutor opens the conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the tutor says "Opening line"
    And the translation "Opening translation" is shown under it

  @smoke
  Scenario: The learner sends a message and the tutor replies
    Given the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the learner's message "My message" is shown
    And the tutor says "Reply line"
    And the message box is empty

  Scenario: A grammar mistake gets a correction card ending with the corrected sentence
    Given the tutor will mark a grammar mistake: "bad part" should be "good part" in "Start good part end."
    When the learner opens Conversation
    And the learner sends "Start bad part end."
    Then a card headed "Almost there" is shown
    And the card ends with the sentence "Start good part end." with "good part" in bold

  Scenario: A word in the learner's own language becomes a new word
    Given the tutor will mark a new word: "apple" is "the-apple" in "I eat the-apple."
    When the learner opens Conversation
    And the learner sends "I eat apple."
    Then a card headed "New word" is shown
    And the card says "Added to your drills"
    And the card ends with the sentence "I eat the-apple." with "the-apple" in bold

  Scenario: An unclear word gets a question, not a correction
    Given the tutor will ask about an unclear word: "What did you mean by blorp?"
    When the learner opens Conversation
    And the learner sends "I eat blorp."
    Then a card headed "Which word did you mean?" is shown
    And the card says "What did you mean by blorp?"

  Scenario: Changing the level starts a new conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner changes the level to "L2"
    Then the learner's message "My message" is not shown
    And the tutor says "Opening line"

  Scenario: On a phone the message box sits above the tab bar
    Given the learner uses a phone-sized screen
    When the learner opens Conversation
    Then the message box is just above the mode tabs

  Scenario: Changing the language starts a new conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner changes the language to "Samplese"
    Then the learner's message "My message" is not shown
    And the tutor says "Opening line"

  Scenario: A word the learner already learned gets a reminder
    Given the tutor will mark a known word: "apple" is "the-apple" in "I eat the-apple."
    When the learner opens Conversation
    And the learner sends "I eat apple."
    Then a card headed "You've seen this one" is shown
    And the card says "Moved up in your drills"
    And the card ends with the sentence "I eat the-apple." with "the-apple" in bold

  Scenario: The learner sends a message with the Enter key
    Given the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner types "My message"
    And the learner presses Enter
    Then the learner's message "My message" is shown
    And the tutor says "Reply line"

  Scenario: Feedback cards keep the order the tutor sends them in
    Given the tutor will send a new word card and then a grammar mistake card
    When the learner opens Conversation
    And the learner sends "My message"
    Then the cards are headed "New word, Almost there" in that order
```

### Negative

```gherkin
  Scenario: The learner can resend a message that failed
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the message "My message" is marked "Not sent."
    When the learner picks "Try again"
    Then the tutor says "Reply line"

  Scenario: Trying again sends the same text
    Given sending will fail once
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner picks "Try again"
    Then the tutor received the message "My message"

  Scenario: The learner can retry when the conversation fails to start
    Given starting will fail once
    And the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the page shows "Couldn't start a conversation."
    When the learner picks "Try again"
    Then the tutor says "Opening line"
```

### Edge cases

```gherkin
  Scenario: An empty message cannot be sent
    When the learner opens Conversation
    Then the Send button is disabled
    When the learner types "   "
    Then the Send button is disabled

  Scenario: Send is disabled while the conversation starts
    Given the conversation is slow to start
    When the learner opens Conversation
    And the learner types "My message"
    Then the Send button is disabled

  Scenario: Send is disabled while the tutor is replying
    Given the tutor is slow to reply
    When the learner opens Conversation
    And the learner sends "My message"
    Then the Send button is disabled
    And the page shows "Tutor is typing"

  Scenario: A message stops at 500 characters
    When the learner opens Conversation
    And the learner types 501 characters
    Then the message box holds 500 characters

  Scenario: The learner sees that the conversation is starting
    Given the conversation is slow to start
    When the learner opens Conversation
    Then the page shows "Starting a conversation…"

  Scenario: Shift and Enter do not send the message
    When the learner opens Conversation
    And the learner types "My message"
    And the learner presses Shift+Enter
    Then the learner's message "My message" is not shown

  Scenario: New messages are announced and scrolled into view
    Given the learner uses a phone-sized screen
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends 8 messages
    Then the messages are in a region that screen readers announce
    And the last "Reply line" is in view
```

Without a chosen language, Conversation shows the spec 002 prompt. That is spec 002's scenario
*Without a chosen language the learner is asked to choose one*, which opens on Conversation, so it
is not repeated here (this feature's Background always chooses a language). The code PR adds a
component test that no conversation starts while no language is chosen.

Component tests added with the race fix (2026-11-28): a late failure from an older start does not fail a newer start for the same level; a late success from an older start does not replace a newer start for the same level. They stay component tests: the timing cannot be set up reliably in a browser test.

### API (backend)

These go in `backend/tests/features/003-conversation-chat.feature` (pytest-bdd). The endpoints are stubs, so a valid request answers 501 until the owner writes the logic. The steps pick a supported language and its levels come from the language registry, so no real language is named.

```gherkin
Feature: Conversation API contract

  Scenario Outline: A conversation needs a supported language and level
    When a client starts a conversation in <language> at <level>
    Then the API answers <status>
      Examples:
        | language                | level                    | status |
        | a supported language    | one of its levels        | 501    |
        | an unsupported language | any level (ignored)      | 422    |
        | a supported language    | a level it does not have | 422    |

  Scenario Outline: A turn message is 1 to 500 characters and not only spaces
    When a client sends a turn with <message>
    Then the API answers <status>
      Examples:
        | message            | status |
        | the text "Hello"   | 501    |
        | an empty message   | 422    |
        | only spaces        | 422    |
        | 500 characters     | 501    |
        | 501 characters     | 422    |
        | 500 characters with spaces around them | 501 |
```

### Below the UI: backend and component tests

Backend criteria (pytest, `backend/tests/test_conversations.py`; the contract cases are also in the API feature above):

- [ ] `POST /conversations` with a supported language and level answers 501.
- [ ] `POST /conversations` with an unsupported language, or a level outside that language's levels, answers 422.
- [ ] `POST /conversations/{id}/turns` with an empty message, one of only spaces, or one over 500 characters, answers 422; a valid one answers 501.
- [ ] The OpenAPI schema lists the request models `ConversationIn` and `TurnIn`. (The response models
      are Ravi's; this criterion replaced "lists `ConversationOut`, `TurnOut` and `FeedbackOut`" after
      his decision on 2026-11-26.)

Component tests (Vitest) cover: each card kind's heading and colour class; the corrected sentence
renders changed segments in `<strong>`; Enter sends and Shift+Enter does not; the 500-character
limit; the "Tutor is typing" indicator; the start error with "Try again"; no conversation starts
while no language is chosen.

- [ ] The ADR 0005 guard test covers these routes: each answers 501 to valid input while it is on the public allowlist.

## Non-behavioural criteria

- [ ] Lint, format, types, build and tests pass in CI.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm e2e`, and the backend's ruff, pyright and pytest pass.
- [ ] No real language in frontend code or tests (guard test from spec 002 still passes).
- [ ] axe finds no violations in Conversation with messages and all four card kinds, at all three breakpoints.
- [ ] At least 80% of changed lines covered.

## Decisions

- D0001, D0002, D0004 followed.
- Proposed here, for Ravi to confirm in review (he asked for recommended answers, listed in the PR):
  - **The conversation API is server-side state**: `POST /conversations` returns an id, and turns post to
    it. The alternative (the client sends the whole history every turn) is simpler now but makes
    mistake history and drills harder later.
  - **Feedback schema** as above: four kinds, nullable fields, and segments for the corrected sentence.
    This is the contract the hand-written tutor logic must produce. Ravi owns its final shape and
    writes the Pydantic models for it.
  - **`known_word`** names D0002's "known word in own language" category; `unclear_word` its
    "unclear word (needs clarification)".
  - **The routers answer 501** instead of fake replies, so nothing pretends to be the tutor.

## Notes

- Folder: `frontend/src/features/conversation/` (screen, message list, bubbles, `FeedbackCard`,
  `CorrectedSentence`, `Composer`, `useConversation` hook).
- `useConversation` uses TanStack Query mutations for start and send; message list state lives in the hook.
- Fake API for Playwright: extend `e2e/steps/fixtures.ts` with `/api/conversations` routes driven by
  the Given steps.
