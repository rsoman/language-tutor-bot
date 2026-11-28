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

  test('a late reply from an older conversation is not added to a newer one for the same level', async () => {
    let starts = 0
    const pendingTurns: Array<(response: Response) => void> = []
    server.use(
      http.post('*/api/conversations', () => {
        starts += 1
        const body = {
          id: `c-${starts}`,
          opening: { text: `Opening ${starts}`, translation: null },
        }
        return HttpResponse.json(body, { status: 201 })
      }),
      http.post(
        '*/api/conversations/:id/turns',
        () => new Promise<Response>((resolve) => pendingTurns.push(resolve)),
      ),
    )
    const controls: Controls = { current: null }
    render(
      <ConversationProvider>
        <Probe onRender={(value) => (controls.current = value)} />
      </ConversationProvider>,
    )

    // Send in the first L1 conversation, then go to L2 and back to L1 while the reply is pending.
    act(() => controls.current?.ensureStarted('xx', 'L1'))
    expect(await screen.findByText('status: ready')).toBeInTheDocument()
    act(() => controls.current?.send('Hello'))
    await vi.waitFor(() => expect(pendingTurns).toHaveLength(1))
    act(() => controls.current?.ensureStarted('xx', 'L2'))
    await vi.waitFor(() => expect(starts).toBe(2))
    act(() => controls.current?.ensureStarted('xx', 'L1'))
    await vi.waitFor(() => expect(controls.current?.state.conversationId).toBe('c-3'))

    // The first conversation's reply arrives late.
    const turn = { feedback: [], reply: { text: 'Stale reply', translation: null } }
    await act(async () => pendingTurns[0]?.(HttpResponse.json(turn)))

    const items = controls.current?.state.items ?? []
    expect(items.map((item) => (item.role === 'tutor' ? item.message.text : item.text))).toEqual([
      'Opening 3',
    ])
  })
})
