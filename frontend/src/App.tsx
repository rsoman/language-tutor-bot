import { BrowserRouter } from 'react-router'

import { AppProviders } from './app/AppProviders'
import { AppRoutes } from './app/AppRoutes'
import { createQueryClient } from './app/queryClient'

const queryClient = createQueryClient()

export function App() {
  return (
    <BrowserRouter>
      <AppProviders queryClient={queryClient}>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  )
}
