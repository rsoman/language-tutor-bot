import { Link } from 'react-router'

import { useConversation } from '../conversation/ConversationContext'
import styles from './ScenarioChip.module.css'

export const scenarioPagePath = '/conversation/scenarios'

/** The pill above the chat: the current scenario and a way to change it. */
export function ScenarioChip() {
  const { scenario } = useConversation()
  return (
    <Link to={scenarioPagePath} className={styles.chip}>
      {scenario ? `Scenario: ${scenario.title} · ` : 'Free conversation · '}
      <span className={styles.action}>{scenario ? 'Change' : 'Choose a scenario'}</span>
    </Link>
  )
}
