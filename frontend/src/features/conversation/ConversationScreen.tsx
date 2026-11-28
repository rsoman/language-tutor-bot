import { useEffect } from 'react'

import { useLanguageChoice } from '../language/LanguageChoiceContext'
import { Composer } from './Composer'
import { useConversation } from './ConversationContext'
import styles from './ConversationScreen.module.css'
import { MessageList } from './MessageList'

/** Conversation mode once a language is chosen: the chat and the message box. */
export function ConversationScreen() {
  const { choice } = useLanguageChoice()
  const { state, ensureStarted, restart, send, resend } = useConversation()
  const code = choice?.language.code
  const level = choice?.level

  // Start a conversation for this language and level (a new one if either changed).
  useEffect(() => {
    if (code && level) ensureStarted(code, level)
  }, [code, level, ensureStarted])

  if (!code || !level) return null

  const tutorTyping = state.items.some(
    (item) => item.role === 'learner' && item.status === 'sending',
  )

  return (
    <div className={styles.screen}>
      {state.status === 'starting' && <p className={styles.status}>Starting a conversation…</p>}
      {state.status === 'failed' && (
        <div className={styles.status}>
          <p>Couldn't start a conversation.</p>
          <button type="button" className={styles.retry} onClick={() => restart(code, level)}>
            Try again
          </button>
        </div>
      )}
      <MessageList
        items={state.items}
        languageCode={code}
        tutorTyping={tutorTyping}
        onResend={resend}
      />
      <Composer onSend={send} disabled={state.status !== 'ready' || tutorTyping} />
    </div>
  )
}
