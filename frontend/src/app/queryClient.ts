import { QueryClient } from '@tanstack/react-query'

// TanStack Query caches server data (here, the language list) and tracks loading and errors.
// retry: false shows a failure straight away; the learner retries with the "Try again" button.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  })
}
