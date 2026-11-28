import { useState, type FormEvent, type KeyboardEvent } from 'react'

import styles from './Composer.module.css'

type ComposerProps = {
  onSend: (text: string) => void
  disabled: boolean
}

export const MAX_MESSAGE_LENGTH = 500

/** The message box and Send button. Enter sends; Shift+Enter adds a new line. */
export function Composer({ onSend, disabled }: ComposerProps) {
  const [text, setText] = useState('')
  const trimmed = text.trim()
  const canSend = !disabled && trimmed !== ''

  function submit() {
    if (!canSend) return
    onSend(trimmed)
    setText('')
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor="composer" className="visually-hidden">
        Message
      </label>
      <textarea
        id="composer"
        className={styles.input}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Type your message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={styles.send} disabled={!canSend}>
        Send
      </button>
    </form>
  )
}
