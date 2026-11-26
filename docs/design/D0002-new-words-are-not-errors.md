# D0002: An unknown word in the learner's own language is a new word, not an error

- **Status:** accepted
- **Date:** 2026-11-26
- **Canvas:** https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN (Cards board)
- **Supersedes:** none

## Rule

The learner may use a word from their own language mid-sentence. The first time, the bot shows a
"New word" card (amber, not the error colour) and adds the word to the learner's vocabulary drills.
Once a word has been introduced, using the own-language word again is flagged as a mistake.

Before treating a word as a new word, the bot checks that it is a real, meaningful word in the
learner's own language that fits the sentence. If it is not (a typo, jargon, slang the bot cannot
place, or gibberish), the bot does not add it to drills and does not translate a guess. It asks the
learner what they meant, then continues.

Corrections are categorised: grammar error, new word, known word in own language, unclear word (needs clarification).

## Why

Learners at the start of a level do not know many words. Punishing that stops them talking;
tracking it turns gaps into drill material. Checking the word first stops meaningless input from
polluting the learner's vocabulary list with made-up "translations".

## Examples

- "Ich esse einen apple" gives a "New word" card: apple = der Apfel.
- "Ich esse einen blorp" gives a clarification question, not a new word card.

## Open

- How the check is done (word list, LLM judgement, or both) is part of the hand-written
  orchestration and eval work, not decided here.

- Per-word states (new, introduced, known) and a softer tone for words introduced long ago are proposed, not decided.
