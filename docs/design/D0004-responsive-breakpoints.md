# D0004: One responsive codebase with three breakpoints

- **Status:** accepted
- **Date:** 2026-11-26
- **Canvas:** https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN (Mobile layouts, Tablet layouts boards)
- **Supersedes:** none

## Rule

- Mobile under 640px, tablet 640 to 1024px, desktop 1024px and up (landscape tablets use desktop).
- Mobile: mode tabs become a bottom tab bar; tables become stacked cards; composer and answer bars
  are pinned to the bottom; touch targets at least 44px; inputs use 16px text; code entry uses
  `inputmode="numeric"`.
- Tablet: top tabs kept, 40px side margins, two-column topic grid, login as a centred card.

## Why

The learner will practise on a phone as much as at a desk. One codebase with CSS breakpoints keeps
the cost of every screen to one implementation.
