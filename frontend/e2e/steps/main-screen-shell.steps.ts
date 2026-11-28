/**
 * Step definitions for e2e/features/002-main-screen-shell.feature.
 *
 * Steps stay thin: they drive the page the way a learner would (by role and label)
 * and assert. The fake backend lives in fixtures.ts.
 */
import { expect, type Page } from '@playwright/test'

import { Given, Then, When } from './fixtures'

const PHONE = { width: 390, height: 844 }
const TABLET = { width: 834, height: 1112 }
const DESKTOP = { width: 1280, height: 800 }
const STORAGE_KEY = 'vaikhari.languageChoice'

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

Given('the learner uses a tablet-sized screen', async ({ page }) => {
  await page.setViewportSize(TABLET)
})

Given('the saved language choice is not valid JSON', async ({ page, fakeApi }) => {
  expect(fakeApi.languages.length).toBeGreaterThan(0)
  await page.addInitScript((key) => localStorage.setItem(key, '{not json'), STORAGE_KEY)
})

Given('the languages request answers with the wrong shape', async ({ fakeApi }) => {
  fakeApi.wrongShape = true
})

Given('the languages request is slow', async ({ fakeApi }) => {
  fakeApi.slow = true
})

Given('the API offers no languages', async ({ fakeApi }) => {
  fakeApi.languages = []
})

Given(
  'the API sends the levels of {string} in the order {string}',
  async ({ fakeApi }, language: string, order: string) => {
    const codes = order.split(', ')
    fakeApi.languages = fakeApi.languages.map((l) =>
      l.name !== language
        ? l
        : {
            ...l,
            levels: codes.map((code) => {
              const level = l.levels.find((lv) => lv.code === code)
              if (!level) throw new Error(`${language} has no level ${code}`)
              return level
            }),
          },
    )
  },
)

Given(
  'the API offers {string} with level {string} at rank {int} and level {string} at rank {int}',
  async (
    { fakeApi },
    name: string,
    first: string,
    firstRank: number,
    second: string,
    secondRank: number,
  ) => {
    fakeApi.languages = [
      ...fakeApi.languages,
      {
        code: 'zz',
        name,
        native_name: `${name} native`,
        level_system: 'TEST',
        levels: [
          { code: first, rank: firstRank },
          { code: second, rank: secondRank },
        ],
      },
    ]
  },
)

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

When('the learner presses Escape', async ({ page }) => {
  await page.keyboard.press('Escape')
})

When('the learner presses Tab from the {string} button', async ({ page }, label: string) => {
  await languagePicker(page).getByRole('button', { name: label }).focus()
  await page.keyboard.press('Tab')
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
  // Escape the path, so a query string's "?" is matched literally.
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  await expect(page).toHaveURL(new RegExp(`${escaped}$`))
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

Then('the language picker is not shown', async ({ page }) => {
  await expect(languagePicker(page)).toBeHidden()
})

Then('the language button has focus', async ({ page }) => {
  await expect(languageButton(page)).toBeFocused()
})

Then('the language button is disabled', async ({ page }) => {
  await expect(languageButton(page)).toBeDisabled()
})

Then('the language prompt says {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('main').getByText(text)).toBeVisible()
})

Then('keyboard focus is inside the language picker', async ({ page }) => {
  const inside = await languagePicker(page).evaluate((dialog) =>
    dialog.contains(document.activeElement),
  )
  expect(inside).toBe(true)
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
