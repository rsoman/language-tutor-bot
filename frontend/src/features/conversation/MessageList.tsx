import { useEffect, useRef } from 'react'

import type { ChatItem } from './conversationState'
import { FeedbackCard } from './FeedbackCard'
import styles from './MessageList.module.css'

type MessageListProps = {
  items: ChatItem[]
  /** Language code of the conversation, so screen readers pronounce messages correctly. */
  languageCode: string
  tutorTyping: boolean
  onResend: (itemId: string) => void
}

/**
 * The conversation so far. It is a `log` region, so screen readers announce new messages.
 */
export function MessageList({ items, languageCode, tutorTyping, onResend }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    // scrollIntoView is missing in the jsdom test environment, hence the check.
    if (typeof endRef.current?.scrollIntoView === 'function') {
      endRef.current.scrollIntoView({ block: 'end' })
    }
  }, [items, tutorTyping])

  return (
    <div role="log" aria-label="Conversation" className={styles.log}>
      <ol className={styles.list}>
        {items.map((item) =>
          item.role === 'tutor' ? (
            <li key={item.id} className={styles.tutor}>
              <p className={styles.tutorBubble} lang={languageCode}>
                {item.message.text}
              </p>
              {item.message.translation && (
                <p className={styles.translation}>{item.message.translation}</p>
              )}
            </li>
          ) : (
            <li key={item.id} className={styles.learner}>
              <p className={styles.learnerBubble} lang={languageCode}>
                {item.text}
              </p>
              {item.status === 'failed' && (
                <p className={styles.failed}>
                  Not sent.{' '}
                  <button type="button" className={styles.retry} onClick={() => onResend(item.id)}>
                    Try again
                  </button>
                </p>
              )}
              {item.feedback.map((feedback, index) => (
                <FeedbackCard key={index} feedback={feedback} />
              ))}
            </li>
          ),
        )}
        {tutorTyping && (
          <li className={styles.tutor}>
            <p className={styles.typing}>
              <span className={styles.dots} aria-hidden="true" />
              <span>Tutor is typing</span>
            </p>
          </li>
        )}
      </ol>
      <div ref={endRef} />
    </div>
  )
}
