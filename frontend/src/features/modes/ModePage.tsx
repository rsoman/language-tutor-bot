import { useEffect, type ComponentType } from 'react'

import { appName } from '../../config'
import { ConversationScreen } from '../conversation/ConversationScreen'
import { GrammarTopicsScreen } from '../grammar/GrammarTopicsScreen'
import { LanguagePrompt } from '../language/LanguagePrompt'
import { useLanguageChoice } from '../language/LanguageChoiceContext'
import styles from './ModePage.module.css'
import type { Mode, ModeIcon } from './modes'

/** Modes that are built so far. The others show their placeholder. */
const screens: Partial<Record<ModeIcon, ComponentType>> = {
  conversation: ConversationScreen,
  grammar: GrammarTopicsScreen,
}

type ModePageProps = {
  mode: Mode
}

/** One practice mode: its screen once a language is chosen, else the language prompt. */
export function ModePage({ mode }: ModePageProps) {
  const { choice } = useLanguageChoice()

  useEffect(() => {
    document.title = `${mode.label} · ${appName}`
  }, [mode.label])

  const Screen = screens[mode.icon]
  if (choice && Screen) {
    return (
      <section className={styles.screen} aria-labelledby="mode-heading">
        <h1 id="mode-heading" className="visually-hidden">
          {mode.label}
        </h1>
        <Screen />
      </section>
    )
  }

  return (
    <section className={styles.panel} aria-labelledby="mode-heading">
      <h1 id="mode-heading" className={styles.heading}>
        {mode.label}
      </h1>
      {choice ? <p className={styles.text}>{mode.comingSoon}</p> : <LanguagePrompt />}
    </section>
  )
}
