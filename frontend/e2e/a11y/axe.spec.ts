// Accessibility check (spec 002, "Other criteria"): axe finds no violations on each mode
// at the three breakpoints from D0004. The backend is faked as in the BDD steps.
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const screens = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1280, height: 800 },
]
const modes = ['/conversation', '/grammar', '/vocabulary']

// 'qaa' is a private-use language code (ISO 639-2 qaa to qtz): valid for the HTML lang
// attribute, so axe's valid-lang rule passes, yet it names no real language.
const fakeLanguages = [
  {
    code: 'qaa',
    name: 'Examplish',
    native_name: 'Exemplar',
    level_system: 'TEST',
    levels: [{ code: 'L1', rank: 1 }],
  },
]

const sentence = [
  { text: 'Start ', changed: false },
  { text: 'good part', changed: true },
  { text: ' end.', changed: false },
]

// One card of each kind, so axe checks them all (spec 003).
const allFeedbackKinds = [
  {
    kind: 'grammar_error',
    original: 'bad part',
    replacement: 'good part',
    explanation: 'Why.',
    corrected_sentence: sentence,
  },
  {
    kind: 'new_word',
    original: 'word',
    replacement: 'good part',
    explanation: null,
    corrected_sentence: sentence,
  },
  {
    kind: 'known_word',
    original: 'word',
    replacement: 'good part',
    explanation: 'Seen before.',
    corrected_sentence: sentence,
  },
  {
    kind: 'unclear_word',
    original: null,
    replacement: null,
    explanation: 'What did you mean?',
    corrected_sentence: null,
  },
]

for (const screen of screens) {
  for (const mode of modes) {
    test(`${mode} has no axe violations on ${screen.name}`, async ({ page }) => {
      await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
      await page.setViewportSize({ width: screen.width, height: screen.height })
      await page.goto(mode)
      await expect(
        page.getByRole('main').getByRole('button', { name: 'Choose a language' }),
      ).toBeVisible()
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })
  }
}

test('the open language picker has no axe violations', async ({ page }) => {
  await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
  await page.goto('/')
  await page.getByRole('banner').getByRole('button').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

for (const screen of screens) {
  test(`a conversation with every card kind has no axe violations on ${screen.name}`, async ({
    page,
  }) => {
    await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
    await page.route('**/api/conversations', (route) =>
      route.fulfill({
        status: 201,
        json: { id: 'c-1', opening: { text: 'Opening', translation: 'Translation' } },
      }),
    )
    await page.route('**/api/conversations/*/turns', (route) =>
      route.fulfill({
        json: { feedback: allFeedbackKinds, reply: { text: 'Reply', translation: null } },
      }),
    )
    await page.setViewportSize({ width: screen.width, height: screen.height })
    await page.addInitScript(() =>
      localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'qaa', level: 'L1' })),
    )
    await page.goto('/conversation')
    await page.getByRole('textbox', { name: 'Message' }).fill('Start bad part end.')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('Reply', { exact: true })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

for (const screen of screens) {
  test(`word help with a result has no axe violations on ${screen.name}`, async ({ page }) => {
    await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
    await page.route('**/api/conversations', (route) =>
      route.fulfill({
        status: 201,
        json: { id: 'c-1', opening: { text: 'Opening', translation: null } },
      }),
    )
    await page.route('**/api/words/lookup?*', (route) =>
      route.fulfill({
        json: {
          headword: 'the-word',
          part_of_speech: 'noun',
          features: [{ name: 'plural', value: 'the-words' }],
          example: { text: 'Example.', translation: 'Translation.' },
        },
      }),
    )
    await page.setViewportSize({ width: screen.width, height: screen.height })
    await page.addInitScript(() =>
      localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'qaa', level: 'L1' })),
    )
    await page.goto('/conversation')
    await page.getByRole('button', { name: 'Word help', exact: true }).click()
    await page.getByRole('textbox', { name: 'Word to look up' }).fill('word')
    await page.getByRole('textbox', { name: 'Word to look up' }).press('Enter')
    await expect(page.getByText('the-word', { exact: true })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

// Spec 005: one recommended, one done and one stretch scenario, so every card style is checked.
const fakeScenarios = [
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
  {
    id: 's-2',
    title: 'Scene two',
    native_title: 'Scene two native',
    topics: 'Topic two',
    level: 'L1',
    recommended: false,
    done: true,
    last_result: 'Last time: 1 correction',
  },
  {
    id: 's-3',
    title: 'Scene three',
    native_title: 'Scene three native',
    topics: 'Topic three',
    level: 'L2',
    recommended: false,
    done: false,
    last_result: null,
  },
]

for (const screen of screens) {
  test(`the scenario page has no axe violations on ${screen.name}`, async ({ page }) => {
    await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
    await page.route('**/api/scenarios?*', (route) => route.fulfill({ json: fakeScenarios }))
    await page.setViewportSize({ width: screen.width, height: screen.height })
    await page.addInitScript(() =>
      localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'qaa', level: 'L1' })),
    )
    await page.goto('/conversation/scenarios')
    await expect(page.getByRole('region', { name: 'Stretch · L2' })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}

// Spec 006: a passed topic, a learned one and one not started, with one ticked.
const fakeGrammarTopics = [
  {
    id: 'g-1',
    title: 'Topic one',
    example: 'Example one',
    times_learned: 2,
    best_score: { correct: 8, total: 10 },
    passed: true,
  },
  {
    id: 'g-2',
    title: 'Topic two',
    example: 'Example two',
    times_learned: 1,
    best_score: null,
    passed: false,
  },
  {
    id: 'g-3',
    title: 'Topic three',
    example: 'Example three',
    times_learned: 0,
    best_score: null,
    passed: false,
  },
]

for (const screen of screens) {
  test(`grammar topics have no axe violations on ${screen.name}`, async ({ page }) => {
    await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
    await page.route('**/api/grammar/topics?*', (route) =>
      route.fulfill({ json: fakeGrammarTopics }),
    )
    await page.setViewportSize({ width: screen.width, height: screen.height })
    await page.addInitScript(() =>
      localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'qaa', level: 'L1' })),
    )
    await page.goto('/grammar')
    await page.getByRole('checkbox', { name: 'Include Topic one in combination test' }).check()
    await expect(page.getByTestId('combo-action')).toHaveText('Start test · 1 topic')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}
