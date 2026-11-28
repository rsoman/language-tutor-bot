// Screenshots for PR review (delivery.md): each mode at the three D0004 breakpoints, with a
// language chosen. CI uploads the screenshots/ folder as a run artifact; it is never committed.
import { expect, test } from '@playwright/test'

const screens = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'desktop', width: 1280, height: 800 },
]
const modes = ['conversation', 'grammar', 'vocabulary']

const fakeLanguages = [
  {
    code: 'xx',
    name: 'Examplish',
    native_name: 'Exemplar',
    level_system: 'TEST',
    levels: [
      { code: 'L1', rank: 1 },
      { code: 'L2', rank: 2 },
    ],
  },
]

for (const screen of screens) {
  for (const mode of modes) {
    test(`${mode} on ${screen.name}`, async ({ page }) => {
      await page.route('**/api/languages', (route) => route.fulfill({ json: fakeLanguages }))
      await page.addInitScript(() =>
        localStorage.setItem('vaikhari.languageChoice', JSON.stringify({ code: 'xx', level: 'L1' })),
      )
      await page.setViewportSize({ width: screen.width, height: screen.height })
      await page.goto(`/${mode}`)
      await expect(page.getByRole('main').getByRole('heading').first()).toBeVisible()
      await page.screenshot({ path: `screenshots/${mode}-${screen.name}.png`, fullPage: true })
    })
  }
}
