import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { LanguageChoiceProvider } from '../features/language/LanguageChoiceContext'

type AppProvidersProps = {
  queryClient: QueryClient
  children: ReactNode
}

/** Everything the screens need from React context, in one place (also used by tests). */
export function AppProviders({ queryClient, children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageChoiceProvider>{children}</LanguageChoiceProvider>
    </QueryClientProvider>
  )
}
