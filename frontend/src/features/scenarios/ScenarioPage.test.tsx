import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import { saveChoice } from '../language/languageStorage'
import { renderApp } from '../../test/renderApp'
import { server } from '../../test/server'

function openScenarioPage() {
  saveChoice({ code: 'xx', level: 'L1' })
  return renderApp('/conversation/scenarios')
}

describe('ScenarioPage', () => {
  test('says it is loading', async () => {
    server.use(
      http.get('*/api/scenarios', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    )
    openScenarioPage()
    expect(await screen.findByText('Loading scenarios…')).toBeInTheDocument()
  })

  test('a failed load offers Try again', async () => {
    server.use(http.get('*/api/scenarios', () => new HttpResponse(null, { status: 500 })))
    openScenarioPage()
    expect(await screen.findByText("Couldn't load scenarios.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  test('leaves out the stretch section when every scenario is at the learner level', async () => {
    openScenarioPage()
    expect(await screen.findByRole('region', { name: 'All L1 scenarios' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /^Stretch/ })).not.toBeInTheDocument()
  })

  test("a card's target-language title carries the language code", async () => {
    openScenarioPage()
    const region = await screen.findByRole('region', { name: 'All L1 scenarios' })
    expect(within(region).getByText('Scene one native')).toHaveAttribute('lang', 'xx')
  })

  test('the scenario is cleared when the level changes', async () => {
    const user = userEvent.setup()
    openScenarioPage()
    const region = await screen.findByRole('region', { name: 'All L1 scenarios' })
    await user.click(within(region).getByRole('button', { name: /^Scene one/ }))
    expect(
      await screen.findByRole('link', { name: 'Scenario: Scene one · Change' }),
    ).toBeInTheDocument()

    const pill = within(screen.getByRole('banner')).getAllByRole('button')[0]
    if (!pill) throw new Error('No language button')
    await user.click(pill)
    await user.click(screen.getByRole('radio', { name: 'L2' }))
    expect(
      await screen.findByRole('link', { name: 'Free conversation · Choose a scenario' }),
    ).toBeInTheDocument()
  })
})
