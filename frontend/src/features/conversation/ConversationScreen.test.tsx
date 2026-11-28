import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { saveChoice } from '../language/languageStorage'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

function openConversation() {
  saveChoice({ code: 'xx', level: 'L1' })
  return renderApp('/conversation')
}

describe('ConversationScreen', () => {
  test('shows the opening message and its translation', async () => {
    openConversation()
    const log = await screen.findByRole('log', { name: 'Conversation' })
    expect(await within(log).findByText('Fake opening')).toBeInTheDocument()
    expect(within(log).getByText('Fake opening translation')).toBeInTheDocument()
  })

  test('says it is starting while the conversation loads', async () => {
    server.use(
      http.post('*/api/conversations', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    openConversation()
    expect(await screen.findByText('Starting a conversation…')).toBeInTheDocument()
  })

  test('a failed start offers Try again', async () => {
    server.use(http.post('*/api/conversations', () => new HttpResponse(null, { status: 500 })))
    openConversation()
    expect(await screen.findByText("Couldn't start a conversation.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  test('no conversation starts while no language is chosen', async () => {
    let starts = 0
    server.use(
      http.post('*/api/conversations', () => {
        starts += 1
        return new HttpResponse(null, { status: 500 })
      }),
    )
    renderApp('/conversation')
    expect(await screen.findByText(/choose a language/i)).toBeInTheDocument()
    expect(starts).toBe(0)
    expect(screen.queryByRole('log', { name: 'Conversation' })).not.toBeInTheDocument()
  })

  test('shows that the tutor is typing while a reply is pending', async () => {
    server.use(
      http.post('*/api/conversations/:id/turns', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    const user = userEvent.setup()
    openConversation()
    await screen.findByText('Fake opening')
    await user.type(screen.getByRole('textbox', { name: 'Message' }), 'Hello{Enter}')
    expect(await screen.findByText('Tutor is typing')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })
})
