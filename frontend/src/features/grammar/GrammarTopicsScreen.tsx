import { useState } from 'react'

import { useLanguageChoice } from '../language/LanguageChoiceContext'
import { ComboTestBar } from './ComboTestBar'
import styles from './GrammarTopicsScreen.module.css'
import { TopicCard } from './TopicCard'
import { useGrammarTopics } from './useGrammarTopics'

/** Grammar mode once a language is chosen: the level's topics and the combination test. */
export function GrammarTopicsScreen() {
  const { choice } = useLanguageChoice()
  if (!choice) return null
  const code = choice.language.code
  // A new language or level remounts the list, which clears the ticks.
  return <GrammarTopics key={`${code}:${choice.level}`} language={code} level={choice.level} />
}

type GrammarTopicsProps = { language: string; level: string }

function GrammarTopics({ language, level }: GrammarTopicsProps) {
  const topics = useGrammarTopics(language, level)
  const [ticked, setTicked] = useState<ReadonlySet<string>>(new Set())

  function toggle(topicId: string) {
    setTicked((current) => {
      const next = new Set(current)
      if (next.has(topicId)) next.delete(topicId)
      else next.add(topicId)
      return next
    })
  }

  const list = topics.data ?? []
  // In list order, so the test address is stable whatever order the boxes were ticked in.
  const tickedIds = list.filter((topic) => ticked.has(topic.id)).map((topic) => topic.id)

  return (
    <div className={styles.screen}>
      <div className={styles.headingRow}>
        <h2 className={styles.heading}>{`${level} grammar topics`}</h2>
        <p className={styles.intro}>Learn a topic as often as you like, then test yourself</p>
      </div>

      {topics.isPending && <p className={styles.status}>Loading grammar topics…</p>}
      {topics.isError && (
        <div className={styles.status}>
          <p>Couldn't load grammar topics.</p>
          <button type="button" className={styles.retry} onClick={() => void topics.refetch()}>
            Try again
          </button>
        </div>
      )}

      {topics.data && (
        <>
          <ComboTestBar
            tickedIds={tickedIds}
            onSelectPassed={() =>
              setTicked(new Set(list.filter((topic) => topic.passed).map((topic) => topic.id)))
            }
            onClear={() => setTicked(new Set())}
          />
          <ul className={styles.list} aria-label="Grammar topics">
            {list.map((topic) => (
              <li key={topic.id}>
                <TopicCard
                  topic={topic}
                  languageCode={language}
                  ticked={ticked.has(topic.id)}
                  onToggle={toggle}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
