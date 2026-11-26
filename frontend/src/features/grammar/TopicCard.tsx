import { useId } from 'react'
import { Link } from 'react-router'

import type { GrammarTopic } from '../../api/client'
import { lessonPath, topicTestPath } from './grammarPaths'
import { progressLine } from './progressLine'
import styles from './TopicCard.module.css'

type TopicCardProps = {
  topic: GrammarTopic
  /** The target language's code, for the `lang` of the example. */
  languageCode: string
  ticked: boolean
  onToggle: (topicId: string) => void
}

/** One grammar topic: tick it for the combination test, or learn or test it on its own. */
export function TopicCard({ topic, languageCode, ticked, onToggle }: TopicCardProps) {
  const titleId = useId()
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      <div className={styles.top}>
        <label className={styles.label}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={ticked}
            onChange={() => onToggle(topic.id)}
            aria-label={`Include ${topic.title} in combination test`}
          />
          <span id={titleId} className={styles.title} data-testid="topic-title">
            {topic.title}
          </span>
        </label>
        {topic.passed && <span className={styles.badge}>Passed</span>}
      </div>
      <span className={styles.example} lang={languageCode}>
        {topic.example}
      </span>
      <div className={styles.bottom}>
        <span className={styles.progress}>{progressLine(topic)}</span>
        <span className={styles.actions}>
          <Link to={lessonPath(topic.id)} className={styles.secondary}>
            {topic.times_learned === 0 ? 'Learn' : 'Learn again'}
          </Link>
          <Link to={topicTestPath(topic.id)} className={styles.primary}>
            Test
          </Link>
        </span>
      </div>
    </article>
  )
}
