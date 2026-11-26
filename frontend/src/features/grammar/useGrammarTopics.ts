import { useQuery } from '@tanstack/react-query'

import { fetchGrammarTopics } from '../../api/client'

/** The grammar topics of this language and level, with the learner's progress. */
export function useGrammarTopics(language: string, level: string) {
  return useQuery({
    queryKey: ['grammarTopics', language, level],
    queryFn: () => fetchGrammarTopics(language, level),
  })
}
