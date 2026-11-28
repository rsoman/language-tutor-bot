import { act, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useEffect } from 'react'

import { server } from '../../test/server'
import { ConversationProvider, useConversation } from './ConversationContext'

type Controls = { current: ReturnType<typeof useConversation> | null }

/** Shows the status and hands the context's functions to the test. */
function Probe({ onRender }: { onRender: (value: ReturnType<typeof useConversation>) => void }) {
  const conversation = useConversation()
  useEffect(() => {
    onRender(conversation)
  })
  return <p>status: {conversation.state.status}</p>
}

/** Answers each start request only when the test says so, in any order. */
function holdStartRequests() {
  const pending: Array<(response: Response) => void> = []
  server.use(
    http.post(
      '*/api/conversations',
      () => new Promise<Response>((resolve) => pending.push(resolve)),
    ),
  )
  return pending
}

const opening = { id: 'c-new', opening: { text: 'New opening', translation: null } }

describe('ConversationProvider', () => {
  test('a late failure from an older start does not fail a newer start for the same level', async () => {
    const pending = holdStartRequests()
    const controls: Controls = { current: null }
    render(
      <ConversationProvider>
        <Probe onRender={(value) => (controls.current = value)} />
      </ConversationProvider>,
    )

    // L1, then L2, then back to L1 before the first L1 request has answered.
    act(() => controls.current?.ensureStarted('xx', 'L1'))
    act(() => controls.current?.ensureStarted('xx', 'L2'))
    act(() => controls.current?.ensureStarted('xx', 'L1'))
    await vi.waitFor(() => expect(pending).toHaveLength(3))

    // The newest L1 start succeeds, then the oldest one fails late.
    await act(async () => pending[2]?.(HttpResponse.json(opening, { status: 201 })))
    expect(await screen.findByText('status: ready')).toBeInTheDocument()
    await act(async () => pending[0]?.(new HttpResponse(null, { status: 500 })))

    expect(screen.getByText('status: ready')).toBeInTheDocument()
  })

  test('a late success from an older start does not replace a newer start for the same level', async () => {
    const pending = holdStartRequests()
    const controls: Controls = { current: null }
    render(
      <ConversationProvider>
        <Probe onRender={(value) => (controls.current = value)} />
      </ConversationProvider>,
    )

    act(() => controls.current?.ensureStarted('xx', 'L1'))
    act(() => controls.current?.ensureStarted('xx', 'L2'))
    act(() => controls.current?.ensureStarted('xx', 'L1'))
    await vi.waitFor(() => expect(pending).toHaveLength(3))

    // The oldest L1 start answers first; the newest is still in flight.
    await act(async () =>
      pending[0]?.(
        HttpResponse.json(
          { id: 'c-old', opening: { text: 'Old opening', translation: null } },
          { status: 201 },
        ),
      ),
    )

    expect(screen.getByText('status: starting')).toBeInTheDocument()
  })
})
