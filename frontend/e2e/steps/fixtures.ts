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

export type FakeApi = {
  languages: FakeLanguage[]
  /** How many of the next /api/languages requests should fail with a 500. */
  failuresLeft: number
}

export const test = base.extend<{ fakeApi: FakeApi }>({
  fakeApi: async ({ page }, use) => {
    const api: FakeApi = { languages: [EXAMPLISH, SAMPLESE], failuresLeft: 0 }
    await page.route('**/api/languages', async (route) => {
      if (api.failuresLeft > 0) {
        api.failuresLeft -= 1
        await route.fulfill({ status: 500, body: 'fake failure' })
        return
      }
      await route.fulfill({ json: api.languages })
    })
    await use(api)
  },
})

export const { Given, When, Then } = createBdd(test)
