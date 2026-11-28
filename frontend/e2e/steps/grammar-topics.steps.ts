/**
 * Step definitions for e2e/features/006-grammar-topics.feature.
 * The fake topics live in fixtures.ts.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When } from './fixtures'

/** One topic card: an article named by the topic's title. */
function topic(page: Page, title: string) {
  return page.getByRole('main').getByRole('article', { name: title, exact: true })
}

function topicList(page: Page) {
  return page.getByRole('list', { name: 'Grammar topics' })
}

function comboAction(page: Page) {
  return page.getByTestId('combo-action')
}

Given('the grammar topics on offer are the fake set', async ({ fakeApi }) => {
  fakeApi.grammarTopics = [
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
      best_score: { correct: 5, total: 10 },
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
})

When('the learner opens Grammar', async ({ page }) => {
  await page.goto('/grammar')
  await expect(topicList(page)).toBeVisible()
})

When('the learner ticks {string}', async ({ page }, title: string) => {
  await page.getByRole('checkbox', { name: `Include ${title} in combination test` }).check()
})

When('the learner starts the combination test', async ({ page }) => {
  await comboAction(page).click()
})

Then('the topics listed are {string}', async ({ page }, titles: string) => {
  await expect(topicList(page).getByTestId('topic-title')).toHaveText(titles.split(', '))
})

Then('the {string} topic shows {string}', async ({ page }, title: string, text: string) => {
  await expect(topic(page, title)).toContainText(text)
})

Then('the {string} topic offers {string}', async ({ page }, title: string, label: string) => {
  await expect(topic(page, title).getByRole('link', { name: label, exact: true })).toBeVisible()
})

Then(
  'the combination test action reads {string} and is disabled',
  async ({ page }, label: string) => {
    await expect(comboAction(page)).toHaveText(label)
    await expect(comboAction(page)).toBeDisabled()
  },
)

Then('the combination test action reads {string}', async ({ page }, label: string) => {
  await expect(comboAction(page)).toHaveText(label)
  await expect(comboAction(page)).toBeEnabled()
})

Then('only {string} is ticked', async ({ page }, title: string) => {
  const boxes = topicList(page).getByRole('checkbox')
  for (const box of await boxes.all()) {
    const name = await box.getAttribute('aria-label')
    const expected = name === `Include ${title} in combination test`
    await expect(box).toBeChecked({ checked: expected })
  }
})

Then('no topic is ticked', async ({ page }) => {
  for (const box of await topicList(page).getByRole('checkbox').all()) {
    await expect(box).not.toBeChecked()
  }
})

Then('the combination test bar is just above the mode tabs', async ({ page }) => {
  const bar = await page.getByRole('region', { name: 'Combination test' }).boundingBox()
  const tabs = await page.getByRole('navigation', { name: 'Practice mode' }).boundingBox()
  expect(bar).not.toBeNull()
  expect(tabs).not.toBeNull()
  if (!bar || !tabs) return
  const gap = tabs.y - (bar.y + bar.height)
  expect(gap).toBeGreaterThanOrEqual(0)
  expect(gap).toBeLessThan(40)
})
