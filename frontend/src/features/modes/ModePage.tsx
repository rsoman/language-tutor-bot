import { useEffect } from 'react'

import { appName } from '../../config'
import { LanguagePrompt } from '../language/LanguagePrompt'
import { useLanguageChoice } from '../language/LanguageChoiceContext'
import styles from './ModePage.module.css'
import type { Mode } from './modes'

type ModePageProps = {
  mode: Mode
}

/** One practice mode. For now a placeholder; the real content comes in later specs. */
export function ModePage({ mode }: ModePageProps) {
  const { choice } = useLanguageChoice()

  useEffect(() => {
    document.title = `${mode.label} · ${appName}`
  }, [mode.label])

  return (
    <section className={styles.panel} aria-labelledby="mode-heading">
      <h1 id="mode-heading" className={styles.heading}>
        {mode.label}
      </h1>
      {choice ? <p className={styles.text}>{mode.comingSoon}</p> : <LanguagePrompt />}
    </section>
  )
}
