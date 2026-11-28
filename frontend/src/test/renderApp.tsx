// Renders the whole app at a given address, with a fresh query cache, for component tests.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import { AppProviders } from '../app/AppProviders'
import { AppRoutes } from '../app/AppRoutes'
import { createQueryClient } from '../app/queryClient'

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppProviders queryClient={createQueryClient()}>
        <AppRoutes />
      </AppProviders>
    </MemoryRouter>,
  )
}
