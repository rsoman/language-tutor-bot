import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

describe('ModePage', () => {
  test('each mode sets the document title', async () => {
    renderApp('/vocabulary')
    await waitFor(() => expect(document.title).toBe('Vocabulary · Vaikhari'))
  })

  test('the prompt button opens the language picker', async () => {
    renderApp()
    const main = screen.getByRole('main')
    const button = await within(main).findByRole('button', { name: 'Choose a language' })
    button.click()
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  test('a failed request shows an error with a retry button', async () => {
    server.use(http.get('*/api/languages', () => new HttpResponse(null, { status: 500 })))
    renderApp()
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
