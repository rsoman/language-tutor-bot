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

Given(
  'the tutor will mark a known word: {string} is {string} in {string}',
  async ({ fakeApi }, original: string, replacement: string, sentence: string) => {
    fakeApi.feedback = [
      {
        kind: 'known_word',
        original,
        replacement,
        explanation: 'Made-up reminder.',
        corrected_sentence: segmentsAround(sentence, replacement),
      },
    ]
  },
)

Given('the tutor will send a new word card and then a grammar mistake card', async ({ fakeApi }) => {
  fakeApi.feedback = [
    {
      kind: 'new_word',
      original: 'apple',
      replacement: 'the-apple',
      explanation: null,
      corrected_sentence: segmentsAround('I eat the-apple.', 'the-apple'),
    },
    {
      kind: 'grammar_error',
      original: 'eat',
      replacement: 'eats',
      explanation: 'Made-up explanation.',
      corrected_sentence: segmentsAround('She eats.', 'eats'),
    },
  ]
})

Given('sending will fail once', async ({ fakeApi }) => {
  fakeApi.turnFailuresLeft = 1
})

Given('starting will fail once', async ({ fakeApi }) => {
  fakeApi.startFailuresLeft = 1
})

Given('the conversation is slow to start', async ({ fakeApi }) => {
  fakeApi.slowStart = true
})

Given('the tutor is slow to reply', async ({ fakeApi }) => {
  fakeApi.slowReply = true
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

When('the learner types {int} characters', async ({ page }, count: number) => {
  // fill() ignores maxlength, so type key by key as a learner would (pasting is the same).
  await messageBox(page).focus()
  await page.keyboard.insertText('a'.repeat(count))
})

When('the learner presses Enter', async ({ page }) => {
  await messageBox(page).press('Enter')
})

When('the learner presses Shift+Enter', async ({ page }) => {
  await messageBox(page).press('Shift+Enter')
})

When('the learner sends {int} messages', async ({ page }, count: number) => {
  for (let n = 1; n <= count; n += 1) {
    await messageBox(page).fill(`Message ${n}`)
    // click() waits until Send is enabled again, that is until the previous reply arrived.
    await sendButton(page).click()
  }
})

When('the learner changes the language to {string}', async ({ page }, language: string) => {
  const picker = page.getByRole('dialog', { name: 'Choose language and level' })
  await page.getByRole('banner').getByRole('button').first().click()
  await picker.getByRole('radio', { name: language, exact: true }).check()
  await picker.getByRole('button', { name: 'Done' }).click()
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

Then('the cards are headed {string} in that order', async ({ page }, headings: string) => {
  const cards = messageLog(page).getByRole('article')
  await expect(cards.getByRole('heading')).toHaveText(headings.split(', '))
})

Then('the tutor received the message {string}', async ({ fakeApi }, text: string) => {
  await expect.poll(() => fakeApi.receivedMessages.at(-1)).toBe(text)
})

Then('the messages are in the order {string}', async ({ page }, order: string) => {
  const expected = order.split(', ')
  // Each message is a list item whose first paragraph is the bubble. Only the messages the
  // scenario names are compared, so the tutor's opening line does not need listing.
  const bubbles = messageLog(page).getByRole('listitem').locator('p:first-child')
  await expect
    .poll(async () => (await bubbles.allInnerTexts()).filter((text) => expected.includes(text)))
    .toEqual(expected)
})

Then('the message box holds {int} characters', async ({ page }, count: number) => {
  await expect.poll(async () => (await messageBox(page).inputValue()).length).toBe(count)
})

Then('the messages are in a region that screen readers announce', async ({ page }) => {
  // role="log" is a live region (aria-live polite by default), so new messages are read out.
  await expect(messageLog(page)).toBeVisible()
  await expect(messageLog(page).getByText('Message 8', { exact: true })).toBeVisible()
})

Then('the last {string} is in view', async ({ page }, text: string) => {
  const last = messageLog(page).getByText(text, { exact: true }).last()
  await expect(messageLog(page).getByText(text, { exact: true })).toHaveCount(8)
  await expect(last).toBeInViewport()
})
