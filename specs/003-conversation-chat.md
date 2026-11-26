# 003: Conversation chat (frontend, with the API contract stub)

- **Status:** ready (Ravi asked for the next frontend specs to be built while he reviews PR #3, 2026-11-26)
- **Owner:** Claude-generated (frontend, Pydantic schemas, a router that returns 501). The conversation
  logic behind the endpoints stays hand-written by Ravi.
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
- Composer: text input (16px text) and a Send button, 52px tall, under the messages. On mobile it is
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
- The learner types a message and presses Send or Enter. The message appears at once as a learner
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

New Pydantic models and a router in `backend/src/tutor/routers/conversations.py`. Both endpoints
validate their input and then answer `501 Not Implemented` with
`{"detail": "Conversation logic is not written yet"}`. Ravi replaces the 501 with the real logic
(that part is his). The frontend types are generated from this contract (`pnpm gen:api`).

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
  or `message` is empty or over 500 characters. `404` for an unknown conversation id (once the logic exists).

## Acceptance criteria

Frontend scenarios go in `frontend/e2e/features/003-conversation-chat.feature`, word for word.
The fake API answers with fixed made-up text in fake languages; the steps choose "Examplish" at "L1".

```gherkin
Feature: Conversation chat

  Background:
    Given the learner has chosen "Examplish" at level "L1"

  Scenario: The tutor opens the conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the tutor says "Opening line"
    And the translation "Opening translation" is shown under it

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

  Scenario: An empty message cannot be sent
    When the learner opens Conversation
    Then the Send button is disabled
    When the learner types "   "
    Then the Send button is disabled

  Scenario: The learner can resend a message that failed
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the message "My message" is marked "Not sent."
    When the learner picks "Try again"
    Then the tutor says "Reply line"

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
```

Backend criteria (pytest, `backend/tests/test_conversations.py`; a BDD feature is not needed for a stub):

- [x] `POST /conversations` with a supported language and level answers 501.
- [x] `POST /conversations` with an unsupported language, or a level outside that language's levels, answers 422.
- [x] `POST /conversations/{id}/turns` with an empty message, or one over 500 characters, answers 422; a valid one answers 501.
- [x] The OpenAPI schema lists `ConversationOut`, `TurnOut` and `FeedbackOut` with the four kinds.

Component tests (Vitest) cover: each card kind's heading and colour class; the corrected sentence
renders changed segments in `<strong>`; Enter sends and Shift+Enter does not; the 500-character
limit; the "Tutor is typing" indicator; the start error with "Try again".

Other criteria:

- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm e2e`, and the backend's ruff, pyright and pytest pass.
- [x] No real language in frontend code or tests (guard test from spec 002 still passes).
- [x] axe finds no violations in Conversation with messages and all four card kinds, at all three breakpoints.

## Decisions

- D0001, D0002, D0004 followed.
- Proposed here, for Ravi to confirm in review (he asked for recommended answers, listed in the PR):
  - **The conversation API is server-side state**: `POST /conversations` returns an id, and turns post to
    it. The alternative (the client sends the whole history every turn) is simpler now but makes
    mistake history and drills harder later.
  - **Feedback schema** as above: four kinds, nullable fields, and segments for the corrected sentence.
    This is the contract the hand-written tutor logic must produce. Ravi owns its final shape.
  - **`known_word`** names D0002's "known word in own language" category; `unclear_word` its
    "unclear word (needs clarification)".
  - **The routers answer 501** instead of fake replies, so nothing pretends to be the tutor.

## Notes

- Folder: `frontend/src/features/conversation/` (screen, message list, bubbles, `FeedbackCard`,
  `CorrectedSentence`, `Composer`, `useConversation` hook).
- `useConversation` uses TanStack Query mutations for start and send; message list state lives in the hook.
- Fake API for Playwright: extend `e2e/steps/fixtures.ts` with `/api/conversations` routes driven by
  the Given steps.
