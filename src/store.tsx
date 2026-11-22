import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ActivityResult, AppState, FeedbackItem, Goal, Probe } from './types'
import { STUDENTS } from './data/seed'

const KEY = 'madarij-demo'
const VERSION = 2

function fresh(): AppState {
  return { version: VERSION, students: structuredClone(STUDENTS), feedback: [], fontScale: 100 }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.version === VERSION && Array.isArray(parsed.students)) return parsed
      // ترقية من النسخة الأولى: نُبقي ملاحظات المعلمين ونُحدّث الطلاب
      // لأن النسخة الثانية أضافت «اهتمام الطالب» وربط الأهداف بالمعايير.
      if (parsed.version === 1 && Array.isArray(parsed.students)) {
        return {
          version: VERSION,
          students: structuredClone(STUDENTS),
          feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
          fontScale: parsed.fontScale ?? 100,
        }
      }
    }
  } catch {
    /* storage unavailable */
  }
  return fresh()
}

type Store = {
  state: AppState
  saveProbe: (studentId: string, probe: Omit<Probe, 'id'>) => void
  updateGoal: (studentId: string, goal: Goal) => void
  addGoal: (studentId: string, goal: Goal) => void
  addResult: (studentId: string, result: Omit<ActivityResult, 'id'>) => void
  addFeedback: (item: Omit<FeedbackItem, 'id' | 'createdAt'>) => void
  removeFeedback: (id: string) => void
  reset: () => void
  setFontScale: (n: number) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore quota errors in demo */
    }
  }, [state])

  const store: Store = {
    state,
    saveProbe: (studentId, probe) =>
      setState((s) => ({
        ...s,
        students: s.students.map((st) =>
          st.id === studentId
            ? { ...st, probes: [...st.probes, { ...probe, id: `${studentId}-p${Date.now()}` }] }
            : st,
        ),
      })),
    updateGoal: (studentId, goal) =>
      setState((s) => ({
        ...s,
        students: s.students.map((st) =>
          st.id === studentId
            ? { ...st, goals: st.goals.map((g) => (g.id === goal.id ? goal : g)) }
            : st,
        ),
      })),
    addGoal: (studentId, goal) =>
      setState((s) => ({
        ...s,
        students: s.students.map((st) =>
          st.id === studentId ? { ...st, goals: [...st.goals, goal] } : st,
        ),
      })),
    addResult: (studentId, result) =>
      setState((s) => ({
        ...s,
        students: s.students.map((st) =>
          st.id === studentId
            ? { ...st, results: [{ ...result, id: `r${Date.now()}` }, ...st.results] }
            : st,
        ),
      })),
    addFeedback: (item) =>
      setState((s) => ({
        ...s,
        feedback: [
          {
            ...item,
            id: `f${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          ...s.feedback,
        ],
      })),
    removeFeedback: (id) =>
      setState((s) => ({ ...s, feedback: s.feedback.filter((f) => f.id !== id) })),
    reset: () => setState(fresh()),
    setFontScale: (n) => setState((s) => ({ ...s, fontScale: n })),
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}
