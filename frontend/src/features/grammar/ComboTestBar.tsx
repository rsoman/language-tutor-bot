import { useId } from 'react'
import { Link } from 'react-router'

import styles from './ComboTestBar.module.css'
import { comboTestPath } from './grammarPaths'

type ComboTestBarProps = {
  /** The ticked topics, in list order. */
  tickedIds: string[]
  onSelectPassed: () => void
  onClear: () => void
}

/**
 * The combination test panel. On phones it becomes a bar pinned above the tab bar, and only
 * the buttons show (the heading stays for screen readers).
 */
export function ComboTestBar({ tickedIds, onSelectPassed, onClear }: ComboTestBarProps) {
  const headingId = useId()
  const count = tickedIds.length
  return (
    <section className={styles.bar} aria-labelledby={headingId}>
      <div className={styles.text}>
        <h3 id={headingId} className={styles.heading}>
          Combination test
        </h3>
        <p className={styles.description}>
          Tick the topics to test together. It starts with questions on your past mistakes.
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onSelectPassed}>
          Select all passed
        </button>
        <button type="button" className={styles.secondary} onClick={onClear}>
          Clear
        </button>
        {count > 0 ? (
          <Link to={comboTestPath(tickedIds)} className={styles.primary} data-testid="combo-action">
            {`Start test · ${count} ${count === 1 ? 'topic' : 'topics'}`}
          </Link>
        ) : (
          <button type="button" className={styles.primary} disabled data-testid="combo-action">
            Choose topics first
          </button>
        )}
      </div>
    </section>
  )
}
