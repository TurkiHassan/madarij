import type { Goal, Student } from '../types'
import { goalMastery, latestProbe, previousProbe, TODAY } from '../data/seed'

const AR_DATE = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  day: 'numeric',
  month: 'long',
})

const AR_DATE_SHORT = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  day: 'numeric',
  month: 'short',
})

export function fmtDate(iso: string) {
  return AR_DATE.format(new Date(`${iso}T12:00:00`))
}

export function fmtDateShort(iso: string) {
  return AR_DATE_SHORT.format(new Date(`${iso}T12:00:00`))
}

export function fmtDateTime(iso: string) {
  const d = new Date(iso)
  return `${AR_DATE_SHORT.format(d)} — ${d.toLocaleTimeString('ar-SA-u-nu-latn', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function daysSince(iso: string) {
  const a = new Date(`${iso}T12:00:00`).getTime()
  const b = new Date(`${TODAY}T12:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}

export function probeDelta(student: Student): number | null {
  const latest = latestProbe(student)
  const prev = previousProbe(student)
  if (!latest || !prev) return null
  return latest.value - prev.value
}

export function mastery(student: Student, goal: Goal): number | null {
  return goalMastery(student, goal)
}

export function targetLabel(goal: Goal): string {
  if (goal.unit.includes('نسبة') || goal.unit.includes('%')) return `${goal.target}%`
  return `${goal.target} ${goal.unit}`
}

export function goalStatusLabel(status: Goal['status']) {
  return status === 'active' ? 'نشط' : status === 'achieved' ? 'تحقق' : 'للمراجعة'
}

export function percent(n: number | null): string {
  if (n === null) return '—'
  return `${Math.round(n * 100)}%`
}

export function classAverage(students: Student[], date: string): number | null {
  const vals = students
    .map((s) => s.probes.find((p) => p.date === date)?.value)
    .filter((v): v is number => typeof v === 'number')
  if (!vals.length) return null
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts[0]?.[0] ?? 'ط'
}
