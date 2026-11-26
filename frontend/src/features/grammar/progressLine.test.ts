import { progressLine } from './progressLine'

describe('progressLine', () => {
  test('a topic never learned is not started', () => {
    expect(progressLine({ times_learned: 0, best_score: null })).toBe('Not started')
  })

  test('a learned topic without a test', () => {
    expect(progressLine({ times_learned: 3, best_score: null })).toBe('Learned 3× · no test yet')
  })

  test('a learned topic with its best score', () => {
    expect(progressLine({ times_learned: 1, best_score: { correct: 7, total: 10 } })).toBe(
      'Learned 1× · best test 7/10',
    )
  })
})
