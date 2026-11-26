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
