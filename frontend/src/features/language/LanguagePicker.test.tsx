import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

/** The language and level pill: the first button in the header (the open picker adds more). */
function languageButton() {
  const button = within(screen.getByRole('banner')).getAllByRole('button')[0]
  if (!button) throw new Error('No language button in the header')
  return button
}

describe('LanguagePicker', () => {
  test('the language button is disabled while languages load', async () => {
    server.use(
      http.get('*/api/languages', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    )
    renderApp()
    expect(languageButton()).toBeDisabled()
    expect(languageButton()).toHaveTextContent('Loading languages')
  })

  test('Escape closes the picker and returns focus to the language button', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitFor(() => expect(languageButton()).toBeEnabled())

    await user.click(languageButton())
    expect(screen.getByRole('dialog', { name: 'Choose language and level' })).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(languageButton()).toHaveFocus()
  })

  test('the button says whether the picker is open', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitFor(() => expect(languageButton()).toBeEnabled())
    expect(languageButton()).toHaveAttribute('aria-expanded', 'false')
    await user.click(languageButton())
    expect(languageButton()).toHaveAttribute('aria-expanded', 'true')
  })

  test('the native name describes each language option', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitFor(() => expect(languageButton()).toBeEnabled())
    await user.click(languageButton())
    expect(screen.getByRole('radio', { name: 'Examplish' })).toHaveAccessibleDescription('Exemplar')
  })

  test('choosing a language saves it', async () => {
    const user = userEvent.setup()
    renderApp()
    await waitFor(() => expect(languageButton()).toBeEnabled())
    await user.click(languageButton())
    await user.click(screen.getByRole('radio', { name: 'Samplese' }))
    expect(JSON.parse(localStorage.getItem('vaikhari.languageChoice') ?? 'null')).toEqual({
      code: 'yy',
      level: 'S1',
    })
  })
})
