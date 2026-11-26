/**
 * Step definitions for e2e/features/004-word-help.feature.
 * The fake dictionary lives in fixtures.ts.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When } from './fixtures'

function panel(page: Page) {
  return page.getByRole('dialog', { name: 'Word help' })
}

function wordHelpButton(page: Page) {
  return page.getByRole('button', { name: 'Word help', exact: true })
}

Given(
  'the dictionary knows {string} as {string}, a {string} with {string} {string} and {string} {string}',
  async (
    { fakeApi },
    query: string,
    headword: string,
    partOfSpeech: string,
    name1: string,
    value1: string,
    name2: string,
    value2: string,
  ) => {
    fakeApi.dictionary[query] = {
      headword,
      part_of_speech: partOfSpeech,
      features: [
        { name: name1, value: value1 },
        { name: name2, value: value2 },
      ],
      example: { text: 'Example sentence.', translation: 'Example translation.' },
    }
  },
)

When('the learner opens word help', async ({ page }) => {
  await wordHelpButton(page).click()
})

When('the learner looks up {string}', async ({ page }, word: string) => {
  await panel(page).getByRole('textbox', { name: 'Word to look up' }).fill(word)
  await panel(page).getByRole('textbox', { name: 'Word to look up' }).press('Enter')
})

When('the learner inserts the word into the message', async ({ page }) => {
  await panel(page).getByRole('button', { name: 'Insert into my message' }).click()
})

When('the learner presses Escape', async ({ page }) => {
  await page.keyboard.press('Escape')
})

Then('the word help panel is shown', async ({ page }) => {
  await expect(panel(page)).toBeVisible()
})

Then('the word help panel is not shown', async ({ page }) => {
  await expect(panel(page)).toHaveCount(0)
})

Then('the word help input has focus', async ({ page }) => {
  await expect(panel(page).getByRole('textbox', { name: 'Word to look up' })).toBeFocused()
})

Then('the word help shows {string}', async ({ page }, text: string) => {
  await expect(panel(page).getByText(text, { exact: true })).toBeVisible()
})

Then('the word help shows the example sentence', async ({ page }) => {
  await expect(panel(page).getByText('Example sentence.', { exact: true })).toBeVisible()
  await expect(panel(page).getByText('Example translation.', { exact: true })).toBeVisible()
})

Then('the message box contains {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('textbox', { name: 'Message' })).toHaveValue(text)
})

Then('the word help button has focus', async ({ page }) => {
  await expect(wordHelpButton(page)).toBeFocused()
})

Then('the word help panel spans the width of the screen', async ({ page }) => {
  const box = await panel(page).boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  if (!box || !viewport) return
  expect(Math.round(box.x)).toBe(0)
  expect(Math.round(box.width)).toBe(viewport.width)
})
