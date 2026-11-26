import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { saveChoice } from '../language/languageStorage'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

function openGrammar(path = '/grammar') {
  saveChoice({ code: 'xx', level: 'L1' })
  return renderApp(path)
}

describe('GrammarTopicsScreen', () => {
  test('says it is loading', async () => {
    server.use(
      http.get('*/api/grammar/topics', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    )
    openGrammar()
    expect(await screen.findByText('Loading grammar topics…')).toBeInTheDocument()
  })

  test('a failed load offers Try again', async () => {
    server.use(http.get('*/api/grammar/topics', () => new HttpResponse(null, { status: 500 })))
    openGrammar()
    expect(await screen.findByText("Couldn't load grammar topics.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  test("a topic's example carries the language code", async () => {
    openGrammar()
    const card = await screen.findByRole('article', { name: 'Topic one' })
    expect(within(card).getByText('Example one')).toHaveAttribute('lang', 'xx')
  })

  test('the combination test action counts topics in the plural', async () => {
    const user = userEvent.setup()
    openGrammar()
    await user.click(
      await screen.findByRole('checkbox', { name: 'Include Topic one in combination test' }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Include Topic two in combination test' }),
    )
    expect(screen.getByTestId('combo-action')).toHaveTextContent('Start test · 2 topics')
  })

  test('the ticks are cleared when the level changes', async () => {
    const user = userEvent.setup()
    openGrammar()
    const box = await screen.findByRole('checkbox', {
      name: 'Include Topic one in combination test',
    })
    await user.click(box)
    expect(box).toBeChecked()

    const pill = within(screen.getByRole('banner')).getAllByRole('button')[0]
    if (!pill) throw new Error('No language button')
    await user.click(pill)
    await user.click(screen.getByRole('radio', { name: 'L2' }))
    await user.click(screen.getByRole('button', { name: 'Done' }))
    expect(
      await screen.findByRole('checkbox', { name: 'Include Topic one in combination test' }),
    ).not.toBeChecked()
  })

  test('a lesson link leads to a not-built-yet page with a way back', async () => {
    openGrammar('/grammar/topics/g-1/lesson')
    expect(await screen.findByRole('heading', { name: 'Lesson' })).toBeInTheDocument()
    expect(screen.getByText('This part is not built yet.')).toBeInTheDocument()
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: 'Grammar' })).toHaveAttribute('href', '/grammar')
  })
})
