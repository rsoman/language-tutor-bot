import { useQuery } from '@tanstack/react-query'

import { fetchScenarios } from '../../api/client'

/** The scenarios on offer for this language and level (stretch ones included). */
export function useScenarios(language: string, level: string) {
  return useQuery({
    queryKey: ['scenarios', language, level],
    queryFn: () => fetchScenarios(language, level),
  })
}
