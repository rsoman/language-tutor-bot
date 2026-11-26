import { Navigate, Route, Routes } from 'react-router'

import { NotBuiltYet } from '../features/grammar/NotBuiltYet'
import { ModePage } from '../features/modes/ModePage'
import { modes } from '../features/modes/modes'
import { ScenarioPage } from '../features/scenarios/ScenarioPage'
import { scenarioPagePath } from '../features/scenarios/ScenarioChip'
import { AppLayout } from './AppLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {modes.map((mode) => (
          <Route key={mode.path} path={mode.path} element={<ModePage mode={mode} />} />
        ))}
        <Route path={scenarioPagePath} element={<ScenarioPage />} />
        {/* Placeholders until specs 007 (lessons) and 008 (tests). */}
        <Route path="/grammar/topics/:topicId/lesson" element={<NotBuiltYet title="Lesson" />} />
        <Route path="/grammar/topics/:topicId/test" element={<NotBuiltYet title="Test" />} />
        <Route path="/grammar/test" element={<NotBuiltYet title="Combination test" />} />
      </Route>
      {/* "/" and any unknown address go to the first mode. */}
      <Route path="*" element={<Navigate to={modes[0].path} replace />} />
    </Routes>
  )
}
