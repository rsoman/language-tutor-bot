// A fake backend for Vitest, built with MSW (Mock Service Worker). It answers fetch()
// calls in Node, so component tests never reach a real API. Tests can override a
// handler with server.use(...).
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { EXAMPLISH, SAMPLESE } from './fakeLanguages'

export const fakeScenarios = [
  {
    id: 's-1',
    title: 'Scene one',
    native_title: 'Scene one native',
    topics: 'Topic one',
    level: 'L1',
    recommended: true,
    done: false,
    last_result: null,
  },
]

export const fakeGrammarTopics = [
  {
    id: 'g-1',
    title: 'Topic one',
    example: 'Example one',
    times_learned: 1,
    best_score: { correct: 9, total: 10 },
    passed: true,
  },
  {
    id: 'g-2',
    title: 'Topic two',
    example: 'Example two',
    times_learned: 0,
    best_score: null,
    passed: false,
  },
]

export const server = setupServer(
  http.get('*/api/languages', () => HttpResponse.json([EXAMPLISH, SAMPLESE])),
  http.post('*/api/conversations', () =>
    HttpResponse.json(
      { id: 'c-1', opening: { text: 'Fake opening', translation: 'Fake opening translation' } },
      { status: 201 },
    ),
  ),
  http.get('*/api/scenarios', () => HttpResponse.json(fakeScenarios)),
  http.get('*/api/grammar/topics', () => HttpResponse.json(fakeGrammarTopics)),
  http.post('*/api/conversations/:id/turns', () =>
    HttpResponse.json({ feedback: [], reply: { text: 'Fake reply', translation: null } }),
  ),
)
