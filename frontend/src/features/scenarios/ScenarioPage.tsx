import { useEffect, useId } from 'react'
import { Link, useNavigate } from 'react-router'

import type { Scenario } from '../../api/client'
import { appName } from '../../config'
import { useConversation } from '../conversation/ConversationContext'
import { LanguagePrompt } from '../language/LanguagePrompt'
import { useLanguageChoice } from '../language/LanguageChoiceContext'
import { ScenarioCard, type CardVariant } from './ScenarioCard'
import { groupScenarios } from './groupScenarios'
import styles from './ScenarioPage.module.css'
import { useScenarios } from './useScenarios'

const conversationPath = '/conversation'

/** "Choose a scenario": the page behind the scenario chip (spec 005). */
export function ScenarioPage() {
  const { choice } = useLanguageChoice()

  useEffect(() => {
    document.title = `Choose a scenario · ${appName}`
  }, [])

  if (!choice) {
    return (
      <section className={styles.panel} aria-labelledby="scenario-heading">
        <h1 id="scenario-heading" className={styles.heading}>
          Choose a scenario
        </h1>
        <LanguagePrompt />
      </section>
    )
  }
  return <ScenarioChooser language={choice.language.code} level={choice.level} />
}

type ScenarioChooserProps = { language: string; level: string }

function ScenarioChooser({ language, level }: ScenarioChooserProps) {
  const scenarios = useScenarios(language, level)
  const { chooseScenario } = useConversation()
  const navigate = useNavigate()

  function pick(scenario: Scenario | null) {
    chooseScenario(language, level, scenario)
    void navigate(conversationPath)
  }

  const groups = scenarios.data ? groupScenarios(scenarios.data, level) : null

  return (
    <section className={styles.page} aria-labelledby="scenario-heading">
      <div className={styles.topBar}>
        <Link to={conversationPath} className={styles.back}>
          <span aria-hidden="true" className={styles.arrow}>
            ←
          </span>
          Back to conversation
        </Link>
        <button type="button" className={styles.free} onClick={() => pick(null)}>
          Free conversation
        </button>
      </div>

      <div className={styles.titleRow}>
        <h1 id="scenario-heading" className={styles.heading}>
          Choose a scenario
        </h1>
        {groups && (
          <p className={styles.progress}>
            {`${groups.doneCount} of ${groups.atLevel.length} ${level} scenarios done`}
          </p>
        )}
      </div>

      {scenarios.isPending && <p className={styles.status}>Loading scenarios…</p>}
      {scenarios.isError && (
        <div className={styles.status}>
          <p>Couldn't load scenarios.</p>
          <button type="button" className={styles.retry} onClick={() => void scenarios.refetch()}>
            Try again
          </button>
        </div>
      )}

      {groups && (
        <>
          <ScenarioSection
            heading="Recommended next"
            scenarios={groups.recommended}
            variant="recommended"
            language={language}
            onPick={pick}
          />
          <ScenarioSection
            heading={`All ${level} scenarios`}
            scenarios={groups.atLevel}
            variant="level"
            language={language}
            onPick={pick}
          />
          <ScenarioSection
            heading={`Stretch · ${groups.stretchLevels.join(', ')}`}
            note="A step up. The tutor keeps its replies simple and gives more hints."
            scenarios={groups.stretch}
            variant="stretch"
            language={language}
            onPick={pick}
          />
        </>
      )}
    </section>
  )
}

type ScenarioSectionProps = {
  heading: string
  note?: string
  scenarios: Scenario[]
  variant: CardVariant
  language: string
  onPick: (scenario: Scenario) => void
}

/** One titled list of cards. Left out when it has no scenarios. */
function ScenarioSection({
  heading,
  note,
  scenarios,
  variant,
  language,
  onPick,
}: ScenarioSectionProps) {
  const headingId = useId()
  if (scenarios.length === 0) return null
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionHeading}>
        {heading}
      </h2>
      {note && <p className={styles.note}>{note}</p>}
      <ul className={styles.list} data-variant={variant}>
        {scenarios.map((scenario) => (
          <li key={scenario.id}>
            <ScenarioCard
              scenario={scenario}
              variant={variant}
              languageCode={language}
              onPick={onPick}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
