import { useLanguageChoice } from './LanguageChoiceContext'
import styles from './LanguagePrompt.module.css'

/** Shown in a mode while no language is chosen: asks for one, or explains why it can't. */
export function LanguagePrompt() {
  const { status, languages, openPicker, retry } = useLanguageChoice()

  if (status === 'loading') {
    return <p className={styles.text}>Loading languages…</p>
  }

  if (status === 'error') {
    return (
      <div className={styles.prompt}>
        <p className={styles.text}>Languages could not be loaded.</p>
        <button type="button" className={styles.button} onClick={retry}>
          Try again
        </button>
      </div>
    )
  }

  if (languages.length === 0) {
    return <p className={styles.text}>No languages are available yet.</p>
  }

  return (
    <div className={styles.prompt}>
      <p className={styles.text}>Choose the language you want to practise</p>
      <button type="button" className={styles.button} onClick={openPicker}>
        Choose a language
      </button>
    </div>
  )
}
