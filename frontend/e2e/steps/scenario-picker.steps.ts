/**
 * Step definitions for e2e/features/005-scenario-picker.feature.
 * The fake scenarios live in fixtures.ts.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When } from './fixtures'

/** A scenario card: a button whose name starts with the scenario's title. */
function card(page: Page, title: string) {
  return page
    .getByRole('main')
    .getByRole('button', { name: new RegExp(`^${title}`) })
    .first()
}

Given('the scenarios on offer are the fake set', async ({ fakeApi }) => {
  fakeApi.scenarios = [
    {
      id: 's-cafe',
      title: 'Cafe scene',
      native_title: 'Cafe native',
      topics: 'Drinks',
      level: 'L1',
      recommended: true,
      done: false,
      last_result: null,
    },
    {
      id: 's-bakery',
      title: 'Bakery scene',
      native_title: 'Bakery native',
      topics: 'Bread',
      level: 'L1',
      recommended: false,
      done: true,
      last_result: 'Last time: 1 correction',
    },
    {
      id: 's-doctor',
      title: 'Doctor scene',
      native_title: 'Doctor native',
      topics: 'Body',
      level: 'L2',
      recommended: false,
      done: false,
      last_result: null,
    },
  ]
})

When('the learner opens the scenario page', async ({ page }) => {
  await page.getByRole('link', { name: /Choose a scenario|Change$/ }).click()
  await expect(page.getByRole('heading', { name: 'Choose a scenario' })).toBeVisible()
})

When('the learner picks the scenario {string}', async ({ page }, title: string) => {
  await card(page, title).click()
})

Then('the scenario chip reads {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('link', { name: text, exact: true })).toBeVisible()
})

Then('the section {string} lists {string}', async ({ page }, section: string, titles: string) => {
  const region = page.getByRole('region', { name: section })
  await expect(region.getByTestId('scenario-title')).toHaveText(titles.split(', '))
})

Then('the page says {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('main').getByText(text, { exact: true })).toBeVisible()
})

Then('the {string} card shows {string}', async ({ page }, title: string, text: string) => {
  await expect(card(page, title)).toContainText(text)
})

Then(
  'the conversation was started with scenario {string}',
  async ({ page, fakeApi }, scenarioId: string) => {
    await expect(page.getByRole('textbox', { name: 'Message' })).toBeVisible()
    await expect.poll(() => fakeApi.conversationScenarios.at(-1)).toBe(scenarioId)
  },
)
