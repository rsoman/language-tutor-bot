import { STORAGE_KEY, loadChoice, saveChoice } from './languageStorage'

describe('languageStorage', () => {
  test('nothing saved gives no choice', () => {
    expect(loadChoice()).toBeNull()
  })

  test('a saved choice is loaded back', () => {
    saveChoice({ code: 'xx', level: 'L2' })
    expect(loadChoice()).toEqual({ code: 'xx', level: 'L2' })
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
