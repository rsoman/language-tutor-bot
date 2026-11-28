import { createContext, useCallback, useContext, useReducer, useRef, type ReactNode } from 'react'

import { sendTurn, startConversation } from '../../api/client'
import {
  conversationReducer,
  initialState,
  newItemId,
  type ConversationState,
} from './conversationState'

type ConversationValue = {
  state: ConversationState
  /** Starts a conversation for this language and level, unless one is already running. */
  ensureStarted: (language: string, level: string) => void
  /** Starts again after a failed start. */
  restart: (language: string, level: string) => void
  send: (text: string) => void
  resend: (itemId: string) => void
}

const ConversationContext = createContext<ConversationValue | null>(null)

/**
 * Holds the current conversation above the routes, so it survives switching to Grammar and back.
 * A new language or level starts a new conversation.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState)
  // Refs are read inside async callbacks, where `state` would be out of date.
  const currentKey = useRef<string | null>(null)
  const conversationId = useRef<string | null>(null)
  // Counts start requests, so an answer from an older request is ignored even when the
  // learner has come back to the same language and level in the meantime.
  const latestStart = useRef(0)

  const start = useCallback(async (language: string, level: string) => {
    const key = `${language}:${level}`
    latestStart.current += 1
    const request = latestStart.current
    currentKey.current = key
    conversationId.current = null
    dispatch({ type: 'start', key })
    try {
      const conversation = await startConversation(language, level)
      if (request !== latestStart.current) return
      conversationId.current = conversation.id
      dispatch({
        type: 'started',
        key,
        conversationId: conversation.id,
        opening: conversation.opening,
      })
    } catch {
      if (request !== latestStart.current) return
      dispatch({ type: 'startFailed', key })
    }
  }, [])

  // Stable, so the screen's effect that calls it runs only when the language or level changes.
  const ensureStarted = useCallback(
    (language: string, level: string) => {
      if (currentKey.current !== `${language}:${level}`) void start(language, level)
    },
    [start],
  )

  async function deliver(itemId: string, text: string) {
    const key = currentKey.current
    const id = conversationId.current
    if (!key || !id) return
    try {
      const turn = await sendTurn(id, text)
      dispatch({
        type: 'replied',
        key,
        conversationId: id,
        itemId,
        feedback: turn.feedback,
        reply: turn.reply,
      })
    } catch {
      dispatch({ type: 'sendFailed', key, conversationId: id, itemId })
    }
  }

  const value: ConversationValue = {
    state,
    ensureStarted,
    restart(language, level) {
      void start(language, level)
    },
    send(text) {
      const key = currentKey.current
      if (!key) return
      const itemId = newItemId()
      dispatch({ type: 'send', key, itemId, text })
      void deliver(itemId, text)
    },
    resend(itemId) {
      const key = currentKey.current
      const item = state.items.find((i) => i.id === itemId)
      if (!key || !item || item.role !== 'learner') return
      dispatch({ type: 'resend', key, itemId })
      void deliver(itemId, item.text)
    },
  }

  return <ConversationContext value={value}>{children}</ConversationContext>
}

export function useConversation(): ConversationValue {
  const value = useContext(ConversationContext)
  if (!value) throw new Error('useConversation must be used inside ConversationProvider')
  return value
}
