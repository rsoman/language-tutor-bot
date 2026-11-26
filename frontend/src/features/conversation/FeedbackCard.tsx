import { useId } from 'react'

import type { Feedback } from '../../api/client'
import { CorrectedSentence } from './CorrectedSentence'
import styles from './FeedbackCard.module.css'

type FeedbackCardProps = {
  feedback: Feedback
}

/** Red (mistake) or amber (help), as on the Cards board. */
type Tone = 'mistake' | 'help'

const cardCopy: Record<Feedback['kind'], { heading: string; tone: Tone; note: string | null }> = {
  grammar_error: { heading: 'Almost there', tone: 'mistake', note: null },
  new_word: { heading: 'New word', tone: 'help', note: 'Added to your drills' },
  known_word: { heading: "You've seen this one", tone: 'mistake', note: 'Moved up in your drills' },
  unclear_word: { heading: 'Which word did you mean?', tone: 'help', note: null },
}

/** One feedback card under a learner message (D0001, D0002). */
export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const headingId = useId()
  const copy = cardCopy[feedback.kind]
  const original = feedback.original ?? null
  const replacement = feedback.replacement ?? null
  const explanation = feedback.explanation ?? null
  const sentence = feedback.corrected_sentence ?? null

  return (
    <article className={styles.card} data-tone={copy.tone} aria-labelledby={headingId}>
      <div className={styles.top}>
        <h2 id={headingId} className={styles.heading}>
          {copy.heading}
        </h2>
        {copy.note && <span className={styles.note}>{copy.note}</span>}
      </div>

      {feedback.kind === 'new_word' && original && replacement && (
        <p className={styles.change}>
          {original} = <strong>{replacement}</strong>
        </p>
      )}

      {(feedback.kind === 'grammar_error' || feedback.kind === 'known_word') &&
        original &&
        replacement && (
          <p className={styles.change}>
            <s className={styles.original}>{original}</s> <span aria-hidden="true">→</span>
            <span className="visually-hidden">should be</span> <strong>{replacement}</strong>
          </p>
        )}

      {explanation && <p className={styles.explanation}>{explanation}</p>}

      {feedback.kind !== 'unclear_word' && sentence && (
        <CorrectedSentence segments={sentence} className={styles.sentence} />
      )}
    </article>
  )
}
