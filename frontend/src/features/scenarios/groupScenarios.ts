import type { Scenario } from '../../api/client'

export type ScenarioGroups = {
  recommended: Scenario[]
  atLevel: Scenario[]
  stretch: Scenario[]
  /** The level names of the stretch scenarios, as the API sends them. */
  stretchLevels: string[]
  doneCount: number
}

/**
 * Splits the flat list from the API into the page's sections. "Stretch" is any level other
 * than the learner's; which one is the server's choice (spec 005).
 */
export function groupScenarios(scenarios: Scenario[], level: string): ScenarioGroups {
  const atLevel = scenarios.filter((s) => s.level === level)
  const stretch = scenarios.filter((s) => s.level !== level)
  return {
    recommended: atLevel.filter((s) => s.recommended),
    atLevel,
    stretch,
    stretchLevels: [...new Set(stretch.map((s) => s.level))],
    doneCount: atLevel.filter((s) => s.done).length,
  }
}
