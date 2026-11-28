import { useQuery } from '@tanstack/react-query'

import { fetchLanguages, type Language } from '../../api/client'

/** Each language's levels easiest first, by rank, whatever order the API sent them in. */
export function sortLevelsByRank(languages: Language[]): Language[] {
  return languages.map((language) => ({
    ...language,
    levels: [...language.levels].sort((a, b) => a.rank - b.rank),
  }))
}

/** The languages the backend offers, with TanStack Query's loading and error state. */
export function useLanguages() {
  return useQuery({ queryKey: ['languages'], queryFn: fetchLanguages, select: sortLevelsByRank })
}
