/**
 * Step definitions for e2e/features/002-main-screen-shell.feature.
 *
 * Steps stay thin: they drive the page the way a learner would (by role and label)
 * and assert. The fake backend lives in fixtures.ts.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When } from './fixtures'

const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1280, height: 800 }

// --- Helpers -------------------------------------------------------------

/** The language and level pill: the first button in the header (the open picker adds more). */
function languageButton(page: Page) {
  return page.getByRole('banner').getByRole('button').first()
}

function modeTabs(page: Page) {
  return page.getByRole('navigation', { name: 'Practice mode' })
}

function languagePicker(page: Page) {
  return page.getByRole('dialog', { name: 'Choose language and level' })
}

async function chooseLanguage(page: Page, language: string, level: string) {
  await page.goto('/')
  await languageButton(page).click()
  await languagePicker(page).getByRole('radio', { name: language, exact: true }).check()
  await languagePicker(page).getByRole('radio', { name: level, exact: true }).check()
  await languagePicker(page).getByRole('button', { name: 'Done' }).click()
}

// --- Given ---------------------------------------------------------------

Given('the learner has not chosen a language', async ({ fakeApi }) => {
  // A fresh browser context has empty localStorage. Touching fakeApi installs the fake backend.
  expect(fakeApi.languages.length).toBeGreaterThan(0)
})

Given(
  'the learner has chosen {string} at level {string}',
  async ({ page, fakeApi }, language: string, level: string) => {
    expect(fakeApi.languages.length).toBeGreaterThan(0)
    await chooseLanguage(page, language, level)
  },
)

Given('the API no longer offers {string}', async ({ fakeApi }, language: string) => {
  fakeApi.languages = fakeApi.languages.filter((l) => l.name !== language)
})

Given('the languages request fails once', async ({ fakeApi }) => {
  fakeApi.failuresLeft = 1
})

Given('the learner uses a phone-sized screen', async ({ page }) => {
  await page.setViewportSize(PHONE)
})

Given('the learner uses a desktop-sized screen', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
})

// --- When ----------------------------------------------------------------

When('the learner opens the app', async ({ page }) => {
  await page.goto('/')
})

When('the learner opens the app at {string}', async ({ page }, path: string) => {
  await page.goto(path)
})

When('the learner reloads the app', async ({ page }) => {
  await page.reload()
})

When('the learner picks the {string} mode tab', async ({ page }, mode: string) => {
  await modeTabs(page).getByRole('link', { name: mode }).click()
})

When('the learner opens the language picker', async ({ page }) => {
  await languageButton(page).click()
})

When('the learner picks the language {string}', async ({ page }, language: string) => {
  await languagePicker(page).getByRole('radio', { name: language, exact: true }).check()
})

When('the learner picks the level {string}', async ({ page }, level: string) => {
  await languagePicker(page).getByRole('radio', { name: level, exact: true }).check()
})

When('the learner closes the language picker', async ({ page }) => {
  await languagePicker(page).getByRole('button', { name: 'Done' }).click()
})

When('the learner picks {string}', async ({ page }, label: string) => {
  await page.getByRole('main').getByRole('button', { name: label }).click()
})

// --- Then ----------------------------------------------------------------

Then('the page shows the app name', async ({ page }) => {
  await expect(page.getByRole('banner')).toContainText('Vaikhari')
})

Then('the {string} mode tab is the current page', async ({ page }, mode: string) => {
  await expect(modeTabs(page).getByRole('link', { name: mode })).toHaveAttribute(
    'aria-current',
    'page',
  )
})

Then('the page title is {string}', async ({ page }, title: string) => {
  await expect(page).toHaveTitle(title)
})

Then('the address ends with {string}', async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${path}$`))
})

Then('the page shows the heading {string}', async ({ page }, heading: string) => {
  await expect(page.getByRole('main').getByRole('heading', { name: heading })).toBeVisible()
})

Then('the page shows {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('main').getByText(text)).toBeVisible()
})

Then('the language button reads {string}', async ({ page }, label: string) => {
  // useInnerText: only the text that is actually shown at this screen size counts.
  await expect(languageButton(page)).toHaveText(label, { useInnerText: true })
})

Then('the level {string} is selected', async ({ page }, level: string) => {
  await expect(languagePicker(page).getByRole('radio', { name: level, exact: true })).toBeChecked()
})

Then('the level group is labelled {string}', async ({ page }, label: string) => {
  await expect(languagePicker(page).getByRole('group', { name: label })).toBeVisible()
})

Then('the levels offered are {string}', async ({ page }, levels: string) => {
  const group = languagePicker(page).getByRole('group', { name: /^Level/ })
  const names = await group
    .getByRole('radio')
    .evaluateAll((radios) =>
      radios.map((r) => (r as HTMLInputElement).labels?.[0]?.textContent?.trim() ?? ''),
    )
  expect(names.join(', ')).toBe(levels)
})

Then('the mode tabs are at the bottom of the screen', async ({ page }) => {
  const box = await modeTabs(page).boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  if (!box || !viewport) return
  expect(Math.round(box.y + box.height)).toBe(viewport.height)
})

Then('every mode tab is at least {int} pixels tall', async ({ page }, minHeight: number) => {
  const links = modeTabs(page).getByRole('link')
  await expect(links).toHaveCount(3)
  for (const link of await links.all()) {
    const box = await link.boundingBox()
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(minHeight)
  }
})

Then('the mode tabs are under the header', async ({ page }) => {
  const header = await page.getByRole('banner').boundingBox()
  const tabs = await modeTabs(page).boundingBox()
  expect(header).not.toBeNull()
  expect(tabs).not.toBeNull()
  if (!header || !tabs) return
  expect(tabs.y).toBeGreaterThanOrEqual(header.y + header.height)
  expect(tabs.y).toBeLessThan(header.y + header.height + 100)
})
