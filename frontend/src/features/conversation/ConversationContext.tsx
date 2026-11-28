import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { sendTurn, startConversation, type Scenario } from '../../api/client'
import {
  conversationReducer,
  initialState,
  newItemId,
  type ConversationState,
} from './conversationState'

/** The scenario the learner picked, and the language and level it was picked for. */
type ScenarioChoice = { languageLevel: string; scenario: Scenario }

type ConversationValue = {
  state: ConversationState
  /** The scenario of the current conversation, or null for a free conversation. */
  scenario: Scenario | null
  /** Starts a new conversation in this scenario (null: a free conversation). */
  chooseScenario: (language: string, level: string, scenario: Scenario | null) => void
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
 * A new language or level starts a new conversation and clears the scenario.
 */
export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState)
  // Refs are read inside async callbacks, where `state` would be out of date.
  const currentKey = useRef<string | null>(null)
  const conversationId = useRef<string | null>(null)
  // Counts start requests, so an answer from an older request is ignored even when the
  // learner has come back to the same language and level in the meantime.
  const latestStart = useRef(0)

  // The scenario sits in state (to render the chip) and in a ref (for the callbacks below).
  const [scenarioChoice, setScenarioChoice] = useState<ScenarioChoice | null>(null)
  const scenarioRef = useRef<ScenarioChoice | null>(null)

  function rememberScenario(choice: ScenarioChoice | null) {
    scenarioRef.current = choice
    setScenarioChoice(choice)
  }

  const start = useCallback(async (language: string, level: string, scenarioId: string | null) => {
    const key = conversationKey(language, level, scenarioId)
    latestStart.current += 1
    const request = latestStart.current
    currentKey.current = key
    conversationId.current = null
    dispatch({ type: 'start', key })
    try {
      const conversation = await startConversation(language, level, scenarioId)
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

  /** The scenario id for this language and level. A scenario picked for another one is dropped. */
  const scenarioIdFor = useCallback((language: string, level: string): string | null => {
    const choice = scenarioRef.current
    if (!choice) return null
    if (choice.languageLevel === `${language}:${level}`) return choice.scenario.id
    scenarioRef.current = null
    setScenarioChoice(null)
    return null
  }, [])

  // Stable, so the screen's effect that calls it runs only when the language or level changes.
  const ensureStarted = useCallback(
    (language: string, level: string) => {
      const scenarioId = scenarioIdFor(language, level)
      if (currentKey.current !== conversationKey(language, level, scenarioId)) {
        void start(language, level, scenarioId)
      }
    },
    [start, scenarioIdFor],
  )

  async function deliver(itemId: string, text: string) {
    const key = currentKey.current
    const id = conversationId.current
    if (!key || !id) return
    try {
      const turn = await sendTurn(id, text)
      dispatch({ type: 'replied', key, itemId, feedback: turn.feedback, reply: turn.reply })
    } catch {
      dispatch({ type: 'sendFailed', key, itemId })
    }
  }

  const value: ConversationValue = {
    state,
    scenario: scenarioChoice?.scenario ?? null,
    chooseScenario(language, level, scenario) {
      rememberScenario(scenario ? { languageLevel: `${language}:${level}`, scenario } : null)
      // Always a new conversation, even when the same scenario is picked again ("Practise again").
      void start(language, level, scenario?.id ?? null)
    },
    ensureStarted,
    restart(language, level) {
      void start(language, level, scenarioIdFor(language, level))
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

function conversationKey(language: string, level: string, scenarioId: string | null): string {
  return `${language}:${level}:${scenarioId ?? ''}`
}

export function useConversation(): ConversationValue {
  const value = useContext(ConversationContext)
  if (!value) throw new Error('useConversation must be used inside ConversationProvider')
  return value
}
