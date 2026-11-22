import React from 'react'
import { Journey } from './pages/Journey'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { StudentFile } from './pages/StudentFile'
import { ProbePage } from './pages/ProbePage'
import { ActivitiesPage } from './pages/ActivitiesPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { GuidePage } from './pages/GuidePage'
import { SkillsPage } from './pages/SkillsPage'
import { SkillPage, type SkillTab } from './pages/SkillPage'
import { routeParts, useRoute } from './router'
import type { Tab } from './pages/StudentFile'

const TABS: Tab[] = ['overview', 'plan', 'progress', 'activities', 'report']

const SKILL_TABS: SkillTab[] = ['deck', 'activities', 'assess']

export function App() {
  const route = useRoute()
  const parts = routeParts(route)

  if (route === '/app') return <Dashboard />
  if (route === '/app/skills') return <SkillsPage />
  if (route === '/app/students') return <Students />
  if (route === '/app/activities') return <ActivitiesPage />
  if (parts[0] === 'app' && parts[1] === 'activities' && parts[2])
    return <ActivitiesPage studentId={parts[2]} />
  if (route === '/app/probe') return <ProbePage />
  if (parts[0] === 'app' && parts[1] === 'probe' && parts[2]) return <ProbePage studentId={parts[2]} />
  if (parts[0] === 'app' && parts[1] === 'student' && parts[2]) {
    const tab = TABS.includes(parts[3] as Tab) ? (parts[3] as Tab) : 'overview'
    return <StudentFile id={parts[2]} tab={tab} />
  }
  if (parts[0] === 'app' && parts[1] === 'skill' && parts[2]) {
    const tab = SKILL_TABS.includes(parts[3] as SkillTab) ? (parts[3] as SkillTab) : 'deck'
    return <SkillPage codeSlug={parts[2]} tab={tab} />
  }
  if (route === '/app/feedback') return <FeedbackPage />
  if (route === '/app/guide') return <GuidePage />
  if (route === '/story') return <Landing />
  return <Journey />
}
