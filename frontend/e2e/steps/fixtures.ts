/**
 * Shared fixtures for the BDD steps.
 *
 * `fakeApi` replaces the backend: every request to /api/languages is answered by
 * page.route() from the data below, so the tests never need FastAPI running and never
 * depend on a real language. Steps can change the data mid-scenario, for example to
 * stop offering a language before a reload.
 */
import { test as base, createBdd } from 'playwright-bdd'

export type FakeLanguage = {
  code: string
  name: string
  native_name: string
  level_system: string
  levels: string[]
}

export const EXAMPLISH: FakeLanguage = {
  code: 'xx',
  name: 'Examplish',
  native_name: 'Exemplar',
  level_system: 'TEST',
  levels: ['L1', 'L2'],
}

export const SAMPLESE: FakeLanguage = {
  code: 'yy',
  name: 'Samplese',
  native_name: 'Samplo',
  level_system: 'TEST',
  levels: ['S1'],
}

export type FakeTutorMessage = { text: string; translation: string | null }

export type FakeSegment = { text: string; changed: boolean }

export type FakeFeedback = {
  kind: 'grammar_error' | 'new_word' | 'known_word' | 'unclear_word'
  original: string | null
  replacement: string | null
  explanation: string | null
  corrected_sentence: FakeSegment[] | null
}

export type FakeWord = {
  headword: string
  part_of_speech: string
  features: { name: string; value: string }[]
  example: FakeTutorMessage | null
}

export type FakeScenario = {
  id: string
  title: string
  native_title: string
  topics: string
  level: string
  recommended: boolean
  done: boolean
  last_result: string | null
}

export type FakeApi = {
  languages: FakeLanguage[]
  /** How many of the next /api/languages requests should fail with a 500. */
  failuresLeft: number
  /** What POST /api/conversations answers with. */
  opening: FakeTutorMessage
  /** What the next POST /api/conversations/{id}/turns answers with. */
  reply: FakeTutorMessage
  feedback: FakeFeedback[]
  /** How many of the next turn requests should fail with a 500. */
  turnFailuresLeft: number
  /** Word lookups: query -> word. Anything else answers 404. */
  dictionary: Record<string, FakeWord>
  scenarios: FakeScenario[]
  /** The scenario_id of every POST /api/conversations, in order (null for none). */
  conversationScenarios: (string | null)[]
}

export const test = base.extend<{ fakeApi: FakeApi }>({
  // auto: true installs the fake backend in every scenario, even one whose steps never
  // mention it, so no test can reach a real API by accident.
  fakeApi: [
    async ({ page }, use) => {
      const api: FakeApi = {
        languages: [EXAMPLISH, SAMPLESE],
        failuresLeft: 0,
        opening: { text: 'Default opening', translation: null },
        reply: { text: 'Default reply', translation: null },
        feedback: [],
        turnFailuresLeft: 0,
        dictionary: {},
        scenarios: [],
        conversationScenarios: [],
      }
      let conversationCount = 0
      await page.route('**/api/languages', async (route) => {
        if (api.failuresLeft > 0) {
          api.failuresLeft -= 1
          await route.fulfill({ status: 500, body: 'fake failure' })
          return
        }
        await route.fulfill({ json: api.languages })
      })
      await page.route('**/api/conversations', async (route) => {
        conversationCount += 1
        const body = route.request().postDataJSON() as { scenario_id?: string | null }
        api.conversationScenarios.push(body.scenario_id ?? null)
        await route.fulfill({
          status: 201,
          json: { id: `c-${conversationCount}`, opening: api.opening },
        })
      })
      await page.route('**/api/conversations/*/turns', async (route) => {
        if (api.turnFailuresLeft > 0) {
          api.turnFailuresLeft -= 1
          await route.fulfill({ status: 500, body: 'fake failure' })
          return
        }
        await route.fulfill({ json: { feedback: api.feedback, reply: api.reply } })
      })
      await page.route('**/api/words/lookup?*', async (route) => {
        const query = new URL(route.request().url()).searchParams.get('query') ?? ''
        const word = api.dictionary[query]
        if (word) {
          await route.fulfill({ json: word })
        } else {
          await route.fulfill({ status: 404, json: { detail: 'No match' } })
        }
      })
      await page.route('**/api/scenarios?*', async (route) => {
        await route.fulfill({ json: api.scenarios })
      })
      await use(api)
    },
    { auto: true },
  ],
})

export const { Given, When, Then } = createBdd(test)
