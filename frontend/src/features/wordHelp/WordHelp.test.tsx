import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { server } from '../../test/server'
import { WordHelp } from './WordHelp'

function renderWordHelp(onInsert = vi.fn()) {
  render(<WordHelp languageCode="xx" level="L1" onInsert={onInsert} />)
  return onInsert
}

async function lookUp(word: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Word help' }))
  await user.type(screen.getByRole('textbox', { name: 'Word to look up' }), `${word}{Enter}`)
  return user
}

describe('WordHelp', () => {
  test('the button says whether the panel is open', async () => {
    const user = userEvent.setup()
    renderWordHelp()
    const button = screen.getByRole('button', { name: 'Word help' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  test('says it is looking up while the request runs', async () => {
    server.use(
      http.get('*/api/words/lookup', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    renderWordHelp()
    await lookUp('word')
    expect(await screen.findByText('Looking up…')).toBeInTheDocument()
  })

  test('a failed lookup offers Try again', async () => {
    server.use(http.get('*/api/words/lookup', () => new HttpResponse(null, { status: 500 })))
    renderWordHelp()
    await lookUp('word')
    expect(await screen.findByText("Couldn't look that up.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  test('a word with no features or example shows only headword and part of speech', async () => {
    server.use(
      http.get('*/api/words/lookup', () =>
        HttpResponse.json({
          headword: 'the-word',
          part_of_speech: 'verb',
          features: [],
          example: null,
        }),
      ),
    )
    renderWordHelp()
    await lookUp('word')
    expect(await screen.findByText('the-word')).toBeInTheDocument()
    expect(screen.getByText('verb')).toBeInTheDocument()
  })

  test('inserting passes the headword on', async () => {
    server.use(
      http.get('*/api/words/lookup', () =>
        HttpResponse.json({
          headword: 'the-word',
          part_of_speech: 'verb',
          features: [],
          example: null,
        }),
      ),
    )
    const onInsert = renderWordHelp()
    const user = await lookUp('word')
    await user.click(await screen.findByRole('button', { name: 'Insert into my message' }))
    expect(onInsert).toHaveBeenCalledWith('the-word')
  })

  test('the lookup sends the language, level and query', async () => {
    let seen: URLSearchParams | null = null
    server.use(
      http.get('*/api/words/lookup', ({ request }) => {
        seen = new URL(request.url).searchParams
        return HttpResponse.json({ detail: 'No match' }, { status: 404 })
      }),
    )
    renderWordHelp()
    await lookUp('blorp')
    expect(await screen.findByText('No match for "blorp".')).toBeInTheDocument()
    expect(seen).not.toBeNull()
    const params = seen as unknown as URLSearchParams
    expect(params.get('language')).toBe('xx')
    expect(params.get('level')).toBe('L1')
    expect(params.get('query')).toBe('blorp')
  })
  test('a slow answer for an earlier word does not replace the answer for the newer word', async () => {
    const pending = new Map<string, (response: Response) => void>()
    server.use(
      http.get('*/api/words/lookup', ({ request }) => {
        const query = new URL(request.url).searchParams.get('query') ?? ''
        return new Promise<Response>((resolve) => pending.set(query, resolve))
      }),
    )
    const found = (headword: string) =>
      HttpResponse.json({ headword, part_of_speech: 'noun', features: [], example: null })
    renderWordHelp()
    const user = await lookUp('first')
    const input = screen.getByRole('textbox', { name: 'Word to look up' })
    await user.clear(input)
    await user.type(input, 'second{Enter}')
    await vi.waitFor(() => expect(pending.size).toBe(2))

    await act(async () => pending.get('second')?.(found('second-word')))
    expect(await screen.findByText('second-word')).toBeInTheDocument()
    await act(async () => pending.get('first')?.(found('first-word')))

    expect(screen.getByText('second-word')).toBeInTheDocument()
    expect(screen.queryByText('first-word')).not.toBeInTheDocument()
  })
})
