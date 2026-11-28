# 002: Main screen shell (frontend)

- **Status:** approved (owner, PR #15, 2026-11-28); code in PR #3
- **Owner:** Claude-generated
- **Phase:** 1

## Goal

The learner opens Vaikhari and sees the main screen from the design canvas: the header with the
app name and a language and level picker, and the three practice modes (Conversation, Grammar,
Vocabulary) they can switch between. The layout follows D0004 at mobile, tablet and desktop.
This spec also creates the `frontend/` app itself (Vite, tooling, tokens, CI job), because the
shell is the first thing that needs it.

## Out of scope

- The content of each mode. Each mode shows a short placeholder panel. The chat (messages,
  correction cards, composer, word help) comes in spec 003; grammar topics and vocabulary in
  later specs.
- Login, sign-up and user profiles. The chosen language is kept in the browser only (see
  Decisions), until accounts exist.
- Theme switching. Only the fig palette is built; the alternatives stay on the canvas.
- Any LLM call. The only backend call is `GET /languages`.
- Locking higher levels until the lower ones are done. That needs the learner's progress (the
  owner's part) and accounts, so it is left for a later spec. Until then every level is open; the
  rank added here is what such a lock would use.
- Deploying to S3 and CloudFront (SPA fallback routing is a deploy concern, later).

## Design source

Canvas: https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN

| Breakpoint | Board | What to copy |
|---|---|---|
| Desktop, 1024px and up | Main ("Tutor app, 3 modes") | Header 72px, logo + app name left, language pill right. Mode tabs as a centred segmented control under the header. Content column max 760px. |
| Tablet, 640 to 1023px | Tablet layouts | Same as desktop, 40px side margins. |
| Mobile, under 640px | Mobile layouts | Header 56px, pill shows the language code ("XX · L1"). Mode tabs become a bottom tab bar with an icon and label per mode, 56px tall in the design. The test checks D0004's 44px minimum. |

Fig tokens (into `src/styles/tokens.css`, the only place hex values appear): ground `#F6EEE3`,
surface `#FFFAF3`, ink `#2B1226`, primary `#5B2A4E`, accent `#A8323F`, good `#4F6126`,
highlight `#E2A94B`, highlight-soft `#F6DDB0`, muted `#6B5163`, line `#E6D8C8`,
on-primary `#FFFAF3`. Fonts: Outfit (headings), Inter (body), Noto Sans Devanagari (the
"व" in the logo).

Logo: option 1 from the Icons board (two speech bubbles, "V" front, "व" back), as an inline SVG
component that reads token colours.

## Behaviour

### Routes

| Path | Shows |
|---|---|
| `/conversation` | Conversation mode |
| `/grammar` | Grammar mode |
| `/vocabulary` | Vocabulary mode |
| `/` and any unknown path | Redirect to `/conversation` |

The mode tabs are links (`<nav aria-label="Practice mode">`), so each mode can be bookmarked and
the browser back button works. The active tab has `aria-current="page"`.
The document title is `<Mode> · <app name>`, for example "Grammar · Vaikhari".

### App name

The app name comes from one config value (`src/config.ts`, `appName`). No component hard-codes it.

### Languages and levels

- Languages come from `GET /languages` (already in `backend/src/tutor/main.py`). Its response
  Zod schema and type are generated from the OpenAPI schema (`pnpm gen:api`, ADR 0004), never
  hand-written, and every response is checked against the schema. A response with the wrong shape
  counts as a failed request.
- There is no default language. Until the learner picks one, the pill reads "Choose language"
  and every mode shows a prompt: "Choose the language you want to practise", with a button that
  opens the picker.
- The picker is a popover from the pill with two radio groups: Language (each language's
  `name`, with `native_name` under it) and Level (that language's `levels`, labelled with its
  `level_system`, for example "Level (TEST)"). Levels are listed easiest first, by their `rank`
  from the API, never by name and never by the order the API sends them. Picking a language
  selects that language's current level: the level the learner last chose for it. A language the
  learner has not chosen before, or whose saved level it no longer offers, starts at its easiest
  level; a language with one level therefore has that level selected. The learner can change it. A "Done" button and the Escape key close it and return
  focus to the pill. While it is open, Tab and Shift+Tab stay inside it.
- Once picked, the pill reads `<name> · <level>` on tablet and desktop and
  `<CODE> · <level>` on mobile. The choice is saved in `localStorage` and restored on reload,
  together with the current level of each language the learner has chosen. A choice saved in the
  earlier shape (one language and its level, no per-language levels) is still read.
  A saved code that `GET /languages` no longer returns is ignored (the learner picks again), and so
  is a saved value that is not valid JSON.
- If `GET /languages` returns an empty list, the prompt says "No languages are available yet."
- While languages load, the pill is disabled and reads "Loading languages". If the request
  fails, the pill reads "Languages unavailable" and the prompt offers "Try again".

### Mode placeholders

Each mode panel has its mode name as a heading and one line saying what will come, for example
"Conversation practice arrives in the next step." No target-language text.

## API contract

Changes the existing endpoint: each level becomes an object with a difficulty `rank`, so the
order is explicit instead of implied by list position.

`GET /languages` response `200`:

```json
[
  {
    "code": "xx", "name": "Examplish", "native_name": "Exemplar", "level_system": "TEST",
    "levels": [{ "code": "L1", "rank": 1 }, { "code": "L2", "rank": 2 }]
  }
]
```

- `rank` is a whole number, 1 for the easiest level of the level system. The backend takes it from
  the level's position in its `LevelSystem` (easiest first), so a language that offers only some
  levels keeps their system ranks (for example ranks 1 and 3). Ranks are unique within a language.
- The backend sends each language's levels easiest first, but the frontend sorts by `rank` anyway.
- `LanguageProfile` rejects levels listed out of their level system's order, so the registry
  cannot contradict the ranks.
- Requests elsewhere (specs 003 to 006) still send a level as its `code` string.

In development, Vite proxies `/api/*` to `http://127.0.0.1:8000/*`, so the backend needs no CORS
change. Tests never call the backend: Vitest uses MSW, Playwright uses `page.route`. Test data
uses made-up languages (`xx`, `yy`) and made-up level systems, so no test depends on a real language or level system.

## Test scenarios

Approved by the owner in a spec-only PR before any code (`docs/conventions/testing.md`).

Each scenario becomes one scenario in `frontend/e2e/features/002-main-screen-shell.feature`,
with the same wording. The fake API offers "Examplish" (`xx`, levels L1 rank 1, L2 rank 2) and
"Samplese" (`yy`, level S1 rank 1) unless a scenario says otherwise.

Shared setup:

```gherkin
Feature: Main screen shell
```

### Positive

```gherkin
  @smoke
  Scenario: The main screen opens on Conversation
    Given the learner has not chosen a language
    When the learner opens the app
    Then the page shows the app name
    And the "Conversation" mode tab is the current page
    And the page title is "Conversation · Vaikhari"

  Scenario: The learner switches practice modes
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner picks the "Grammar" mode tab
    Then the "Grammar" mode tab is the current page
    And the address ends with "/grammar"
    And the page shows the heading "Grammar"

  Scenario: A mode can be opened directly by its address
    Given the learner has not chosen a language
    When the learner opens the app at "/vocabulary"
    Then the "Vocabulary" mode tab is the current page

  Scenario: The learner chooses a language and level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    And the learner picks the level "L2"
    And the learner closes the language picker
    Then the language button reads "Examplish · L2"

  Scenario: A language with a single level has it selected
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    Then the level "S1" is selected

  Scenario: A language with several levels starts at its easiest level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level "L1" is selected

  Scenario: The level list belongs to the chosen language
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level group is labelled "Level (TEST)"
    And the levels offered are "L1, L2"

  Scenario: Switching back to a language keeps its current level
    Given the learner has chosen "Examplish" at level "L2"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    And the learner picks the language "Examplish"
    Then the level "L2" is selected

  Scenario: Each language's current level is remembered after a reload
    Given the learner has chosen "Examplish" at level "L2"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    And the learner reloads the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level "L2" is selected

  Scenario: The chosen language is remembered after a reload
    Given the learner has chosen "Examplish" at level "L1"
    When the learner reloads the app
    Then the language button reads "Examplish · L1"

  Scenario: On a phone the mode tabs are a bottom bar
    Given the learner uses a phone-sized screen
    And the learner has chosen "Examplish" at level "L1"
    When the learner opens the app
    Then the mode tabs are at the bottom of the screen
    And every mode tab is at least 44 pixels tall
    And the language button reads "XX · L1"

  Scenario: On a desktop the mode tabs are under the header
    Given the learner uses a desktop-sized screen
    When the learner opens the app
    Then the mode tabs are under the header

  Scenario: On a tablet the mode tabs are under the header
    Given the learner uses a tablet-sized screen
    When the learner opens the app
    Then the mode tabs are under the header

  Scenario: Escape closes the language picker
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner presses Escape
    Then the language picker is not shown
    And the language button has focus
```

### Negative

```gherkin
  Scenario: An unknown address goes to Conversation
    Given the learner has not chosen a language
    When the learner opens the app at "/no-such-page"
    Then the address ends with "/conversation"

  Scenario: A saved level the language no longer offers falls back to its easiest level
    Given the learner has chosen "Examplish" at level "L9"
    When the learner opens the app
    Then the language button reads "Examplish · L1"

  Scenario: A saved language that is no longer offered is ignored
    Given the learner has chosen "Examplish" at level "L1"
    And the API no longer offers "Examplish"
    When the learner reloads the app
    Then the language button reads "Choose language"

  Scenario: The learner can retry when languages fail to load
    Given the languages request fails once
    When the learner opens the app
    Then the language button reads "Languages unavailable"
    When the learner picks "Try again"
    Then the language button reads "Choose language"

  Scenario: A damaged saved choice is ignored
    Given the saved language choice is not valid JSON
    When the learner opens the app
    Then the language button reads "Choose language"

  Scenario: A language list with the wrong shape counts as a failure
    Given the languages request answers with the wrong shape
    When the learner opens the app
    Then the language button reads "Languages unavailable"
```

### Edge cases

```gherkin
  Scenario: Without a chosen language the learner is asked to choose one
    Given the learner has not chosen a language
    When the learner opens the app
    Then the language button reads "Choose language"
    And the page shows "Choose the language you want to practise"

  Scenario: The language button waits while languages load
    Given the languages request is slow
    When the learner opens the app
    Then the language button reads "Loading languages"
    And the language button is disabled

  Scenario: With no languages on offer the learner is told so
    Given the API offers no languages
    When the learner opens the app
    Then the language prompt says "No languages are available yet."

  Scenario: Keyboard focus stays in the open language picker
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner presses Tab from the "Done" button
    Then keyboard focus is inside the language picker

  Scenario: Levels are listed easiest first whatever order the API sends
    Given the learner has not chosen a language
    And the API sends the levels of "Examplish" in the order "L2, L1"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the levels offered are "L1, L2"
    And the level "L1" is selected

  Scenario: Levels are ordered by difficulty, not by name
    Given the learner has not chosen a language
    And the API offers "Ordish" with level "Zed" at rank 1 and level "Alpha" at rank 2
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Ordish"
    Then the levels offered are "Zed, Alpha"
    And the level "Zed" is selected
```

### API (backend)

These go in `backend/tests/features/002-main-screen-shell.feature` (pytest-bdd). The steps read the
language registry, so no real language is named.

```gherkin
Feature: Languages API contract

  Scenario: Every level carries its difficulty rank
    When a client lists the languages
    Then every level has a code and a whole-number rank of 1 or more
    And no two levels of one language share a rank

  Scenario: Levels come easiest first
    When a client lists the languages
    Then each language's levels are in rising rank order
```

### Below the UI: backend and component tests

Backend unit tests (pytest, `backend/tests/test_languages.py`):

- [ ] A level's rank is its position in its level system, counted from 1.
- [ ] A `LanguageProfile` whose levels are out of their level system's order is rejected.
- [ ] A `LanguageProfile` with no levels is rejected.

Component and unit tests (Vitest) cover what would make the feature file noisy: the picker's
keyboard behaviour, the `localStorage` read and write helpers (including reading a choice saved in the earlier shape), the loading state, and that the logo SVG has no hard-coded hex.

## Non-behavioural criteria

- [ ] Lint, format, types, build and tests pass in CI.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally and in a new
      `frontend` CI job.
- [ ] CI regenerates the API schemas and fails if the committed output differs (ADR 0004).
- [ ] The frontend CI job uploads Playwright screenshots of each mode at the three breakpoints as a
      run artifact (`delivery.md`, screenshots).
- [ ] No hex colour outside `src/styles/tokens.css` (checked by a lint rule or a test).
- [ ] No real language name, code or level system in `frontend/src` or the tests.
- [ ] Every interactive element is keyboard reachable with a visible focus style; axe finds no
      violations on each mode at all three breakpoints (`@axe-core/playwright`).
- [ ] At least 80% of changed lines covered.

## Decisions

- D0004 responsive breakpoints (accepted): followed as written.
- `docs/conventions/react.md`: React + TS + Vite, pnpm, React Router, TanStack Query,
  ESLint + Prettier, Vitest + Testing Library, Playwright.
- ADR 0004 (proposed with this spec): orval generates Zod schemas from the OpenAPI schema; types come
  from them with `z.infer`; responses are validated at runtime.
- Proposed here, owner said go ahead (2026-11-26), to confirm in review:
  - **Gherkin runner for Playwright: `playwright-bdd`.** It turns `.feature` files into Playwright
    tests, the same shape as pytest-bdd on the backend. This settles the "to be decided" in
    `docs/conventions/testing.md`, which now names it.
  - **Language choice kept in `localStorage`** until accounts exist (then it moves to the user
    profile, and this storage is removed).
  - **Fonts self-hosted** with `@fontsource` packages, so the app makes no third-party font requests.
  - **Picking a language selects its current level** (owner's review, 2026-11-28; replaces "selects
    its easiest level"). Until accounts and progress exist, the current level is the one the learner
    last chose for that language, kept in `localStorage`. Once the backend tracks progress (for
    example the learner cleared L1 and is on L2), the current level comes from there. A language
    never chosen starts at its easiest level. This is not a default language.
  - **Levels carry an explicit `rank`** (owner's review, 2026-11-28) instead of relying on list
    order, and the frontend sorts by it, never alphabetically.

## Notes

- Folder layout: `src/app/` (router, layout, header), `src/features/language/` (picker, hook,
  storage), `src/features/modes/` (mode tabs and placeholders), `src/components/` (Logo),
  `src/api/` (generated schema and a small fetch client), `e2e/features/` and `e2e/steps/`.
- `pnpm gen:api` runs orval (ADR 0004) and writes the Zod schemas under `src/api/` from the backend's OpenAPI JSON
  (`uv run python -c` dump into `frontend/openapi.json`). Both files are committed so CI does
  not need the backend running.
