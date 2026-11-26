import { useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

import { WordHelp } from '../wordHelp/WordHelp'
import styles from './Composer.module.css'

type ComposerProps = {
  onSend: (text: string) => void
  disabled: boolean
  /** Needed for word help. Without them the lightbulb is not shown. */
  languageCode?: string
  level?: string
}

/** Adds a word to the end of the message, with one space between. */
export function appendWord(text: string, word: string): string {
  const trimmed = text.trimEnd()
  return trimmed === '' ? word : `${trimmed} ${word}`
}

export const MAX_MESSAGE_LENGTH = 500

/** The message box and Send button. Enter sends; Shift+Enter adds a new line. */
export function Composer({ onSend, disabled, languageCode, level }: ComposerProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
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

  function insertWord(word: string) {
    setText((current) => appendWord(current, word))
    inputRef.current?.focus()
  }

  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <label htmlFor="composer" className="visually-hidden">
        Message
      </label>
      <textarea
        ref={inputRef}
        id="composer"
        className={styles.input}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        placeholder="Type your message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
      />
      {languageCode && level && (
        <WordHelp languageCode={languageCode} level={level} onInsert={insertWord} />
      )}
      <button type="submit" className={styles.send} disabled={!canSend}>
        Send
      </button>
    </form>
  )
}
