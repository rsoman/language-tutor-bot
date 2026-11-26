/**
 * Step definitions for e2e/features/003-conversation-chat.feature.
 * The fake tutor lives in fixtures.ts; Given steps set what it will answer.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When, type FakeSegment } from './fixtures'

// --- Helpers -------------------------------------------------------------

function messageLog(page: Page) {
  return page.getByRole('log', { name: 'Conversation' })
}

function messageBox(page: Page) {
  return page.getByRole('textbox', { name: 'Message' })
}

function sendButton(page: Page) {
  return page.getByRole('button', { name: 'Send' })
}

/** The most recent feedback card. */
function lastCard(page: Page) {
  return messageLog(page).getByRole('article').last()
}

/** Splits "Start good part end." around "good part" into segments, marking that part as changed. */
function segmentsAround(sentence: string, changed: string): FakeSegment[] {
  const start = sentence.indexOf(changed)
  if (start < 0) throw new Error(`"${changed}" is not in "${sentence}"`)
  return [
    { text: sentence.slice(0, start), changed: false },
    { text: changed, changed: true },
    { text: sentence.slice(start + changed.length), changed: false },
  ].filter((segment) => segment.text !== '')
}

// --- Given ---------------------------------------------------------------

Given(
  'the tutor will open with {string} translated as {string}',
  async ({ fakeApi }, text: string, translation: string) => {
    fakeApi.opening = { text, translation }
  },
)

Given('the tutor will reply {string}', async ({ fakeApi }, text: string) => {
  fakeApi.reply = { text, translation: null }
})

Given(
  'the tutor will mark a grammar mistake: {string} should be {string} in {string}',
  async ({ fakeApi }, original: string, replacement: string, sentence: string) => {
    fakeApi.feedback = [
      {
        kind: 'grammar_error',
        original,
        replacement,
        explanation: 'Made-up explanation.',
        corrected_sentence: segmentsAround(sentence, replacement),
      },
    ]
  },
)

Given(
  'the tutor will mark a new word: {string} is {string} in {string}',
  async ({ fakeApi }, original: string, replacement: string, sentence: string) => {
    fakeApi.feedback = [
      {
        kind: 'new_word',
        original,
        replacement,
        explanation: null,
        corrected_sentence: segmentsAround(sentence, replacement),
      },
    ]
  },
)

Given(
  'the tutor will ask about an unclear word: {string}',
  async ({ fakeApi }, question: string) => {
    fakeApi.feedback = [
      {
        kind: 'unclear_word',
        original: null,
        replacement: null,
        explanation: question,
        corrected_sentence: null,
      },
    ]
  },
)

Given('sending will fail once', async ({ fakeApi }) => {
  fakeApi.turnFailuresLeft = 1
})

// --- When ----------------------------------------------------------------

When('the learner opens Conversation', async ({ page }) => {
  await page.goto('/conversation')
})

When('the learner sends {string}', async ({ page }, text: string) => {
  await expect(sendButton(page)).toBeVisible()
  await messageBox(page).fill(text)
  await sendButton(page).click()
})

When('the learner types {string}', async ({ page }, text: string) => {
  await messageBox(page).fill(text)
})

When('the learner changes the level to {string}', async ({ page }, level: string) => {
  const picker = page.getByRole('dialog', { name: 'Choose language and level' })
  await page.getByRole('banner').getByRole('button').first().click()
  await picker.getByRole('radio', { name: level, exact: true }).check()
  await picker.getByRole('button', { name: 'Done' }).click()
})

// --- Then ----------------------------------------------------------------

Then('the tutor says {string}', async ({ page }, text: string) => {
  await expect(messageLog(page).getByText(text, { exact: true })).toBeVisible()
})

Then('the translation {string} is shown under it', async ({ page }, text: string) => {
  await expect(messageLog(page).getByText(text, { exact: true })).toBeVisible()
})

Then("the learner's message {string} is shown", async ({ page }, text: string) => {
  await expect(messageLog(page).getByText(text, { exact: true })).toBeVisible()
})

Then("the learner's message {string} is not shown", async ({ page }, text: string) => {
  await expect(messageLog(page).getByText(text, { exact: true })).toHaveCount(0)
})

Then('the message box is empty', async ({ page }) => {
  await expect(messageBox(page)).toHaveValue('')
})

Then('a card headed {string} is shown', async ({ page }, heading: string) => {
  await expect(messageLog(page).getByRole('article', { name: heading })).toBeVisible()
})

Then('the card says {string}', async ({ page }, text: string) => {
  await expect(lastCard(page)).toContainText(text)
})

Then(
  'the card ends with the sentence {string} with {string} in bold',
  async ({ page }, sentence: string, bold: string) => {
    const lastParagraph = lastCard(page).locator('p').last()
    await expect(lastParagraph).toHaveText(sentence)
    await expect(lastParagraph.locator('strong')).toHaveText(bold)
  },
)

Then('the Send button is disabled', async ({ page }) => {
  await expect(sendButton(page)).toBeDisabled()
})

Then('the message {string} is marked {string}', async ({ page }, text: string, mark: string) => {
  const message = messageLog(page).getByRole('listitem').filter({ hasText: text })
  await expect(message).toContainText(mark)
})

Then('the message box is just above the mode tabs', async ({ page }) => {
  const box = await messageBox(page).boundingBox()
  const tabs = await page.getByRole('navigation', { name: 'Practice mode' }).boundingBox()
  expect(box).not.toBeNull()
  expect(tabs).not.toBeNull()
  if (!box || !tabs) return
  const gap = tabs.y - (box.y + box.height)
  expect(gap).toBeGreaterThanOrEqual(0)
  expect(gap).toBeLessThan(40)
})
