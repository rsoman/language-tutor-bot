# D0001: Corrections end with the full corrected sentence

- **Status:** accepted
- **Date:** 2026-11-26
- **Canvas:** https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN (Main, Cards boards)
- **Supersedes:** none

## Rule

Every correction the bot shows ends with the entire corrected sentence, with the changed part in bold.
The structured correction output therefore carries the full corrected sentence and the span(s) that changed.

## Why

The learner should see and read the whole correct sentence, not only a fragment diff they have to
stitch back together.

## Examples

- Do: explanation, then "Ich **habe** gestern Pizza gegessen."
- Don't: "bin → habe" with no full sentence.
