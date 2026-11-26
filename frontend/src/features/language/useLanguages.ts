import { useQuery } from '@tanstack/react-query'

import { fetchLanguages } from '../../api/client'

/** The languages the backend offers, with TanStack Query's loading and error state. */
export function useLanguages() {
  return useQuery({ queryKey: ['languages'], queryFn: fetchLanguages })
}
