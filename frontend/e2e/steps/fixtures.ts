/**
 * Shared fixtures for the BDD steps.
 *
 * `fakeApi` replaces the backend: every request to /api/languages is answered by
 * page.route() from the data below, so the tests never need FastAPI running and never
 * depend on a real language. Steps can change the data mid-scenario, for example to
 * stop offering a language before a reload.
 */
import { test as base, createBdd } from 'playwright-bdd'

export type FakeLevel = { code: string; rank: number }

export type FakeLanguage = {
  code: string
  name: string
  native_name: string
  level_system: string
  levels: FakeLevel[]
}

export const EXAMPLISH: FakeLanguage = {
  code: 'xx',
  name: 'Examplish',
  native_name: 'Exemplar',
  level_system: 'TEST',
  levels: [
    { code: 'L1', rank: 1 },
    { code: 'L2', rank: 2 },
  ],
}

export const SAMPLESE: FakeLanguage = {
  code: 'yy',
  name: 'Samplese',
  native_name: 'Samplo',
  level_system: 'TEST',
  levels: [{ code: 'S1', rank: 1 }],
}

export type FakeApi = {
  languages: FakeLanguage[]
  /** How many of the next /api/languages requests should fail with a 500. */
  failuresLeft: number
  /** When true, /api/languages answers with JSON of the wrong shape. */
  wrongShape: boolean
  /** When true, /api/languages does not answer until the scenario ends. */
  slow: boolean
}

export const test = base.extend<{ fakeApi: FakeApi }>({
  fakeApi: async ({ page }, use) => {
    const api: FakeApi = {
      languages: [EXAMPLISH, SAMPLESE],
      failuresLeft: 0,
      wrongShape: false,
      slow: false,
    }
    // A slow request is held until the scenario ends, then released.
    let releaseSlow: () => void = () => {}
    const slowDone = new Promise<void>((resolve) => {
      releaseSlow = resolve
    })
    await page.route('**/api/languages', async (route) => {
      if (api.slow) {
        await slowDone
        await route.abort().catch(() => {})
        return
      }
      if (api.failuresLeft > 0) {
        api.failuresLeft -= 1
        await route.fulfill({ status: 500, body: 'fake failure' })
        return
      }
      if (api.wrongShape) {
        await route.fulfill({ json: [{ code: 'xx', levels: 'not a list' }] })
        return
      }
      await route.fulfill({ json: api.languages })
    })
    await use(api)
    releaseSlow()
  },
})

export const { Given, When, Then } = createBdd(test)
