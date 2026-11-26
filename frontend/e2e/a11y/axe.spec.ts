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

const fakeLanguages = [
  { code: 'xx', name: 'Examplish', native_name: 'Exemplar', level_system: 'TEST', levels: ['L1'] },
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
      localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'xx', level: 'L1' })),
    )
    await page.goto('/conversation')
    await page.getByRole('textbox', { name: 'Message' }).fill('Start bad part end.')
    await page.getByRole('button', { name: 'Send' }).click()
    await expect(page.getByText('Reply', { exact: true })).toBeVisible()
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}
