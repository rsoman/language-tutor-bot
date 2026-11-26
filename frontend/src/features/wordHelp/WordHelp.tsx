import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'

import { ApiError, lookupWord, type Word } from '../../api/client'
import styles from './WordHelp.module.css'

type WordHelpProps = {
  languageCode: string
  level: string
  /** Called with the found word when the learner inserts it into their message. */
  onInsert: (headword: string) => void
}

type Lookup =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; word: Word }
  | { status: 'notFound'; query: string }
  | { status: 'failed' }

/**
 * The lightbulb button and the "Word help" panel: look up a word before sending a message.
 * A popover on bigger screens, a bottom sheet on phones (CSS).
 */
export function WordHelp({ languageCode, level, onInsert }: WordHelpProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()

  // Focus the input when the panel opens.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // While the panel is open, Escape closes it and focus goes back to the lightbulb.
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  function close() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  async function runLookup() {
    const word = query.trim()
    if (word === '') return
    setLookup({ status: 'loading' })
    try {
      setLookup({ status: 'found', word: await lookupWord(languageCode, level, word) })
    } catch (error) {
      const notFound = error instanceof ApiError && error.status === 404
      setLookup(notFound ? { status: 'notFound', query: word } : { status: 'failed' })
    }
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    // The panel sits inside the message form. Without preventDefault, Enter here would
    // submit that form and send the message.
    if (event.key === 'Enter') {
      event.preventDefault()
      void runLookup()
    }
  }

  function insert(headword: string) {
    setOpen(false)
    onInsert(headword)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.lightbulb}
        aria-label="Word help"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 00-4 12.7V16h8v-1.3A7 7 0 0012 2z" />
        </svg>
      </button>

      {open && (
        <div role="dialog" aria-label="Word help" className={styles.panel}>
          <div className={styles.top}>
            <h2 className={styles.title}>Word help</h2>
            <button
              type="button"
              className={styles.close}
              aria-label="Close word help"
              onClick={close}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className={styles.search} role="search">
            <label htmlFor={inputId} className={styles.label}>
              Word to look up
            </label>
            <div className={styles.row}>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                className={styles.input}
                maxLength={60}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={onInputKeyDown}
              />
              <button type="button" className={styles.lookUp} onClick={() => void runLookup()}>
                Look up
              </button>
            </div>
          </div>

          <div aria-live="polite">
            {lookup.status === 'loading' && <p className={styles.message}>Looking up…</p>}
            {lookup.status === 'notFound' && (
              <p className={styles.message}>No match for "{lookup.query}".</p>
            )}
            {lookup.status === 'failed' && (
              <p className={styles.message}>
                Couldn't look that up.{' '}
                <button type="button" className={styles.retry} onClick={() => void runLookup()}>
                  Try again
                </button>
              </p>
            )}
            {lookup.status === 'found' && (
              <WordResult word={lookup.word} languageCode={languageCode} onInsert={insert} />
            )}
          </div>
        </div>
      )}
    </>
  )
}

type WordResultProps = {
  word: Word
  languageCode: string
  onInsert: (headword: string) => void
}

/** The found word, its features (D0003) and an example sentence. */
function WordResult({ word, languageCode, onInsert }: WordResultProps) {
  const featureLine = [
    word.part_of_speech,
    ...word.features.map((feature) => `${feature.name}: ${feature.value}`),
  ].join(' · ')
  const example = word.example ?? null

  return (
    <>
      <div className={styles.result}>
        <p className={styles.headword} lang={languageCode}>
          {word.headword}
        </p>
        <p className={styles.features}>{featureLine}</p>
        {example && (
          <>
            <p className={styles.example} lang={languageCode}>
              {example.text}
            </p>
            {example.translation && <p className={styles.features}>{example.translation}</p>}
          </>
        )}
      </div>
      <button type="button" className={styles.insert} onClick={() => onInsert(word.headword)}>
        Insert into my message
      </button>
    </>
  )
}
