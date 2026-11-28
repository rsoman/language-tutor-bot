import { http, HttpResponse } from 'msw'

import { EXAMPLISH } from '../test/fakeLanguages'
import { server } from '../test/server'
import { fetchLanguages } from './client'

describe('fetchLanguages', () => {
  test('returns the languages when the response has the right shape', async () => {
    server.use(http.get('*/api/languages', () => HttpResponse.json([EXAMPLISH])))
    await expect(fetchLanguages()).resolves.toEqual([EXAMPLISH])
  })

  test('rejects a response with the wrong shape', async () => {
    server.use(
      http.get('*/api/languages', () => HttpResponse.json([{ code: 'xx', levels: 'not a list' }])),
    )
    await expect(fetchLanguages()).rejects.toThrow()
  })

  test('rejects a level without a whole-number rank', async () => {
    const broken = { ...EXAMPLISH, levels: [{ code: 'L1', rank: 1.5 }] }
    server.use(http.get('*/api/languages', () => HttpResponse.json([broken])))
    await expect(fetchLanguages()).rejects.toThrow()
  })

  test('rejects a failed request', async () => {
    server.use(http.get('*/api/languages', () => new HttpResponse(null, { status: 500 })))
    await expect(fetchLanguages()).rejects.toThrow('500')
  })
})
