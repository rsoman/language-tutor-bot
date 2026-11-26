// A fake backend for Vitest, built with MSW (Mock Service Worker). It answers fetch()
// calls in Node, so component tests never reach a real API. Tests can override a
// handler with server.use(...).
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { EXAMPLISH, SAMPLESE } from './fakeLanguages'

export const server = setupServer(
  http.get('*/api/languages', () => HttpResponse.json([EXAMPLISH, SAMPLESE])),
)
