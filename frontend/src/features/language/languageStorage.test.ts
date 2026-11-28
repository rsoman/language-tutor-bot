import { STORAGE_KEY, loadChoice, saveChoice } from './languageStorage'

describe('languageStorage', () => {
  test('nothing saved gives no choice', () => {
    expect(loadChoice()).toBeNull()
  })

  test("a saved choice is loaded back with each language's current level", () => {
    saveChoice({ code: 'yy', level: 'S1', levels: { xx: 'L2', yy: 'S1' } })
    expect(loadChoice()).toEqual({ code: 'yy', level: 'S1', levels: { xx: 'L2', yy: 'S1' } })
  })

  test("a choice saved in the earlier shape is read, with its level as that language's current level", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: 'xx', level: 'L2' }))
    expect(loadChoice()).toEqual({ code: 'xx', level: 'L2', levels: { xx: 'L2' } })
  })

  test('per-language levels that are not all text are ignored, keeping the choice', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ code: 'xx', level: 'L2', levels: { yy: 7 } }),
    )
    expect(loadChoice()).toEqual({ code: 'xx', level: 'L2', levels: { xx: 'L2' } })
  })

  test('bad JSON is ignored', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadChoice()).toBeNull()
  })

  test('a value with the wrong shape is ignored', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: 42 }))
    expect(loadChoice()).toBeNull()
  })
})
