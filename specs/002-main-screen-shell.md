# 002: Main screen shell (frontend)

- **Status:** draft
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
- Any LLM call. The only backend call is the existing `GET /languages`.
- Deploying to S3 and CloudFront (SPA fallback routing is a deploy concern, later).

## Design source

Canvas: https://claude.ai/artifact/CFP8hVHwBhNRCC9CJwppkN

| Breakpoint | Board | What to copy |
|---|---|---|
| Desktop, 1024px and up | Main ("Tutor app, 3 modes") | Header 72px, logo + app name left, language pill right. Mode tabs as a centred segmented control under the header. Content column max 760px. |
| Tablet, 640 to 1023px | Tablet layouts | Same as desktop, 40px side margins. |
| Mobile, under 640px | Mobile layouts | Header 56px, pill shows the language code ("DE · A1"). Mode tabs become a bottom tab bar with an icon and label per mode, each at least 56px tall. |

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
  type is generated with `openapi-typescript` (`pnpm gen:api`), never hand-written.
- There is no default language. Until the learner picks one, the pill reads "Choose language"
  and every mode shows a prompt: "Choose the language you want to practise", with a button that
  opens the picker.
- The picker is a popover from the pill with two radio groups: Language (each language's
  `name`, with `native_name` under it) and Level (that language's `levels`, labelled with its
  `level_system`, for example "Level (CEFR)"). Picking a language selects its first listed
  level, which the learner can change. A "Done" button and the Escape key close it.
- Once picked, the pill reads `<name> · <level>` on tablet and desktop and
  `<CODE> · <level>` on mobile. The choice is saved in `localStorage` and restored on reload.
  A saved code that `GET /languages` no longer returns is ignored (the learner picks again).
- While languages load, the pill is disabled and reads "Loading languages". If the request
  fails, the pill reads "Languages unavailable" and the prompt offers "Try again".

### Mode placeholders

Each mode panel has its mode name as a heading and one line saying what will come, for example
"Conversation practice arrives in the next step." No target-language text.

## API contract

Uses the existing endpoint. No backend change.

`GET /languages` response `200`:

```json
[
  { "code": "xx", "name": "Examplish", "native_name": "Exemplar", "level_system": "TEST", "levels": ["L1", "L2"] }
]
```

In development, Vite proxies `/api/*` to `http://127.0.0.1:8000/*`, so the backend needs no CORS
change. Tests never call the backend: Vitest uses MSW, Playwright uses `page.route`. Test data
uses made-up languages (`xx`, `yy`) and made-up level systems, so no test depends on German or CEFR.

## Acceptance criteria

Each scenario becomes one scenario in `frontend/e2e/features/002-main-screen-shell.feature`,
with the same wording. The fake API offers "Examplish" (`xx`, levels L1, L2) and "Samplese"
(`yy`, levels S1) unless a scenario says otherwise.

```gherkin
Feature: Main screen shell

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

  Scenario: An unknown address goes to Conversation
    Given the learner has not chosen a language
    When the learner opens the app at "/no-such-page"
    Then the address ends with "/conversation"

  Scenario: Without a chosen language the learner is asked to choose one
    Given the learner has not chosen a language
    When the learner opens the app
    Then the language button reads "Choose language"
    And the page shows "Choose the language you want to practise"

  Scenario: The learner chooses a language and level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    And the learner picks the level "L2"
    And the learner closes the language picker
    Then the language button reads "Examplish · L2"

  Scenario: Picking a language selects its first level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    Then the level "S1" is selected

  Scenario: The level list belongs to the chosen language
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level group is labelled "Level (TEST)"
    And the levels offered are "L1, L2"

  Scenario: The chosen language is remembered after a reload
    Given the learner has chosen "Examplish" at level "L1"
    When the learner reloads the app
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
```

Component and unit tests (Vitest) cover what would make the feature file noisy: the picker's
keyboard behaviour (Escape closes it and returns focus to the pill), the `localStorage` read and
write helpers (bad JSON is ignored), the loading state, and that the logo SVG has no hard-coded hex.

Other criteria:

- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm e2e` pass locally and in a new
      `frontend` CI job.
- [ ] No hex colour outside `src/styles/tokens.css` (checked by a lint rule or a test).
- [ ] No real language name, code or level system in `frontend/src` or the tests.
- [ ] Every interactive element is keyboard reachable with a visible focus style; axe finds no
      violations on each mode at all three breakpoints (`@axe-core/playwright`).

## Decisions

- D0004 responsive breakpoints (accepted): followed as written.
- `docs/conventions/react.md`: React + TS + Vite, pnpm, React Router, TanStack Query,
  openapi-typescript, ESLint + Prettier, Vitest + Testing Library, Playwright.
- Proposed here, for the owner to confirm in review:
  - **Gherkin runner for Playwright: `playwright-bdd`.** It turns `.feature` files into Playwright
    tests, the same shape as pytest-bdd on the backend. This settles the "to be decided" in
    `docs/conventions/testing.md`, which this PR updates.
  - **Language choice kept in `localStorage`** until accounts exist (then it moves to the user
    profile, and this storage is removed).
  - **Fonts self-hosted** with `@fontsource` packages, so the app makes no third-party font requests.
  - **Picking a language selects its first listed level.** This is not a default language; it
    only saves a click when a language has a single level, as German does today.

## Notes

- Folder layout: `src/app/` (router, layout, header), `src/features/language/` (picker, hook,
  storage), `src/features/modes/` (mode tabs and placeholders), `src/components/` (Logo),
  `src/api/` (generated schema and a small fetch client), `e2e/features/` and `e2e/steps/`.
- `pnpm gen:api` writes `src/api/schema.d.ts` from the backend's OpenAPI JSON
  (`uv run python -c` dump into `frontend/openapi.json`). Both files are committed so CI does
  not need the backend running.
