import type { Scenario } from '../../api/client'
import styles from './ScenarioCard.module.css'

export type CardVariant = 'recommended' | 'level' | 'stretch'

type ScenarioCardProps = {
  scenario: Scenario
  variant: CardVariant
  /** The target language's code, for the `lang` of the native title. */
  languageCode: string
  onPick: (scenario: Scenario) => void
}

/**
 * One scenario as a button. The title comes first in the DOM so the button's name starts
 * with it; the badge is moved to the top right with CSS.
 */
export function ScenarioCard({ scenario, variant, languageCode, onPick }: ScenarioCardProps) {
  const badge = scenario.done ? 'Done' : variant === 'stretch' ? 'Stretch' : null
  return (
    <button
      type="button"
      className={styles.card}
      data-variant={variant}
      onClick={() => onPick(scenario)}
    >
      <span className={styles.title} data-testid="scenario-title">
        {scenario.title}
      </span>
      {badge && (
        <span className={styles.badge} data-badge={scenario.done ? 'done' : 'stretch'}>
          {badge}
        </span>
      )}
      <span className={styles.native} lang={languageCode}>
        {scenario.native_title}
      </span>
      {scenario.done ? (
        <span className={styles.footer}>
          {scenario.last_result && <span>{scenario.last_result}</span>}
          <span className={styles.again}>Practise again</span>
        </span>
      ) : (
        <span className={styles.footer}>{scenario.topics}</span>
      )}
    </button>
  )
}
