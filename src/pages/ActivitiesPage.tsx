import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { ACTIVITIES, ACTIVITY_BY_ID, TODAY } from '../data/seed'
import { fmtDate, initials, targetLabel } from '../lib/format'
import { Select } from '@atlas/ui'
import { notifications } from '@atlas/ui/notifications'
import { DOMAIN_LABEL, type ActivityDef } from '../types'

const VISUAL: Record<string, string> = {
  'letters-ta': 'ة / ه',
  'letters-lookalike': 'ب ت ث',
  'comp-mainidea': '؟',
  'spelling-harakat': 'بَ بُ بِ',
}

export function ActivitiesPage({ studentId }: { studentId?: string }) {
  const { state, addResult } = useStore()
  const [selected, setSelected] = useState(studentId ?? state.students[0]?.id ?? '')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saved, setSaved] = useState(false)
  const startedAt = useRef<number>(Date.now())

  useEffect(() => {
    if (!studentId) return
    setSelected(studentId)
    setActiveId(null)
    setFinished(false)
    setPicked(null)
    setIndex(0)
    setScore(0)
  }, [studentId])

  const student = state.students.find((s) => s.id === selected) ?? state.students[0]
  const activity: ActivityDef | null = activeId ? ACTIVITY_BY_ID[activeId] ?? null : null
  const GOAL_KEY: Record<string, string> = {
    'letters-ta': 'التاء',
    'letters-lookalike': 'المتشابهة',
    'comp-mainidea': 'الفكرة',
    'spelling-harakat': 'الحركات',
  }
  const linkedGoal = activity
    ? student?.goals.find(
        (g) => g.title.includes(GOAL_KEY[activity.id]) || g.statement.includes(GOAL_KEY[activity.id]),
      )
    : undefined

  const results = useMemo(
    () =>
      student
        ? [...student.results]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((r) => ({ ...r, def: ACTIVITY_BY_ID[r.activityId] }))
        : [],
    [student],
  )

  function start(id: string) {
    setActiveId(id)
    setIndex(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
    setSaved(false)
    startedAt.current = Date.now()
  }

  function choose(i: number) {
    if (picked !== null || !activity) return
    setPicked(i)
    if (i === activity.items[index].answer) setScore((s) => s + 1)
  }

  function next() {
    if (!activity) return
    if (index + 1 >= activity.items.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  function saveResult() {
    if (!activity || !student) return
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    addResult(student.id, {
      date: TODAY,
      activityId: activity.id,
      score,
      total: activity.items.length,
      duration: minutes,
    })
    setSaved(true)
    notifications.show({
      message: `حُفظت نتيجة النشاط في ملف ${student.name} وأثّرت في الهدف المرتبط بالمعيار.`,
      color: 'coral',
      autoClose: 3000,
      withBorder: true,
    })
  }

  function exit() {
    setActiveId(null)
    setFinished(false)
    setPicked(null)
    setIndex(0)
    setScore(0)
  }

  const item = activity?.items[index]
  const isCorrect = picked !== null && activity && picked === item?.answer

  return (
    <AppShell title="الأنشطة">
      {!activity && (
        <>
          <div className="page-head">
            <div>
              <h1 className="page-title">أنشطة قصيرة، مرتبطة بهدف.</h1>
              <p className="page-sub">
                كل نشاط يُسجل نتيجته في ملف الطالب، ويغذي نسبة إتقان الهدف المرتبط به. بلا مؤقت
                إجباري، وبلا ترتيب علني.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: '0.82em', color: 'var(--muted)' }}>الطالب:</span>
            <Select
              value={selected}
              onChange={(v) => setSelected(v ?? '')}
              data={state.students.map((s) => ({ value: s.id, label: `${s.name} — ${s.grade}` }))}
              aria-label="اختر الطالب"
              allowDeselect={false}
              checkIconPosition="right"
              maxDropdownHeight={220}
              styles={{ root: { minWidth: 250 } }}
            />
            {student && (
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => go(`/app/student/${student.id}`)}
              >
                ملف {student.name.split(' ')[0]}
              </button>
            )}
          </div>

          <div className="activity-grid">
            {ACTIVITIES.map((a) => (
              <article className="activity-card" key={a.id}>
                <div className="activity-visual">
                  <span>{VISUAL[a.id]}</span>
                </div>
                <h3>{a.title}</h3>
                <span className="chip chip-sand">{DOMAIN_LABEL[a.domain]}</span>
                <p>{a.blurb}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => start(a.id)}>
                    ابدأ النشاط
                  </button>
                  <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>
                    {a.items.length} أسئلة · {a.minutes} دقائق
                  </span>
                </div>
              </article>
            ))}
          </div>

          <section className="panel" style={{ marginTop: 24 }}>
            <div className="panel-head">
              <h2 className="panel-title">آخر نتائج {student?.name.split(' ')[0]}</h2>
              <span className="chip chip-sand">{results.length} نشاط</span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {results.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>النشاط</th>
                      <th>التاريخ</th>
                      <th>النتيجة</th>
                      <th>المدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id}>
                        <td>{r.def?.title ?? 'نشاط'}</td>
                        <td>{fmtDate(r.date)}</td>
                        <td>
                          <span className="chip chip-olive">
                            {r.score}/{r.total}
                          </span>
                        </td>
                        <td>{r.duration} د</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty">لا نتائج بعد لهذا الطالب.</div>
              )}
            </div>
          </section>
        </>
      )}

      {activity && student && item && !finished && (
        <div className="activity-player">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="avatar" style={{ background: student.color, width: 34, height: 34, fontSize: 12 }}>
                {initials(student.name)}
              </div>
              <div>
                <b style={{ fontSize: '0.9em', display: 'block' }}>{activity.title}</b>
                <span style={{ fontSize: '0.74em', color: 'var(--muted)' }}>
                  {student.name.split(' ')[0]} · {DOMAIN_LABEL[activity.domain]}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm" type="button" onClick={exit}>
              خروج
            </button>
          </div>

          <div className="activity-progress" aria-hidden="true">
            {activity.items.map((_, i) => (
              <span key={i} className={i < index ? 'done' : i === index ? 'now' : ''} />
            ))}
          </div>

          <div className="activity-counter">
            السؤال {index + 1} من {activity.items.length}
          </div>
          {item.passage && <div className="activity-passage">{item.passage}</div>}
          <div className="activity-prompt">{item.prompt}</div>

          <div className="activity-options">
            {item.options.map((opt, i) => {
              const klass =
                picked === null
                  ? ''
                  : i === item.answer
                    ? 'correct'
                    : i === picked
                      ? 'wrong'
                      : ''
              return (
                <button
                  key={opt}
                  type="button"
                  className={`activity-option ${klass}`}
                  onClick={() => choose(i)}
                  disabled={picked !== null}
                >
                  <span>{opt}</span>
                  {picked !== null && i === item.answer && <Icon name="check" size={18} />}
                  {picked !== null && i === picked && i !== item.answer && <Icon name="x" size={18} />}
                </button>
              )
            })}
          </div>

          {picked !== null && (
            <div className="activity-feedback">
              <span style={{ color: isCorrect ? 'var(--ok)' : 'var(--warn)' }}>
                {isCorrect ? 'إجابة صحيحة.' : `ليست الصحيحة. الإجابة: ${item.options[item.answer]}.`}
                {item.hint && !isCorrect ? ` ${item.hint}` : ''}
              </span>
              <button className="btn btn-primary btn-sm" type="button" onClick={next}>
                {index + 1 >= activity.items.length ? 'اعرض النتيجة' : 'السؤال التالي'}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          )}

          {linkedGoal && (
            <p style={{ marginTop: 24, fontSize: '0.76em', color: 'var(--muted)' }}>
              مرتبط بهدف: {linkedGoal.title} — {targetLabel(linkedGoal)}
            </p>
          )}
        </div>
      )}

      {activity && student && finished && (
        <div className="panel" style={{ maxWidth: 620, marginInline: 'auto' }}>
          <div className="panel-head">
            <h2 className="panel-title">نتيجة النشاط</h2>
            <span className="chip chip-olive">{activity.title}</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div className="probe-result-value">{score}</div>
              <div style={{ fontSize: '1.1em', color: 'var(--muted)' }}>من {activity.items.length}</div>
            </div>
            <p style={{ marginTop: 10, fontSize: '0.9em', color: 'var(--ink-2)' }}>
              {score === activity.items.length
                ? 'أتقن الطالب جميع الأسئلة. يمكن رفع مستوى الهدف أو تغيير نوع النص.'
                : score >= Math.ceil(activity.items.length * 0.7)
                  ? 'نتيجة جيدة. راجع الأخطاء مع الطالب قبل تسجيل الهدف.'
                  : 'يحتاج الطالب إلى تدريب إضافي على هذه المهارة. جرّب نشاطًا أقصر قبل التوسع.'}
            </p>

            {linkedGoal && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--paper-2)', fontSize: '0.84em' }}>
                الهدف المرتبط: {linkedGoal.title} — المعيار {targetLabel(linkedGoal)}.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <button className="btn btn-primary" type="button" onClick={saveResult} disabled={saved}>
                احفظ النتيجة في الملف
              </button>
              <button className="btn btn-ghost" type="button" onClick={exit}>
                عُد إلى الأنشطة
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => go(`/app/student/${student.id}`)}
              >
                ملف الطالب
              </button>
            </div>
            {saved && (
              <p style={{ marginTop: 14, fontSize: '0.84em', color: 'var(--ok)' }}>
                حُفظت النتيجة، وستظهر في سجل الأنشطة ونسبة إتقان الهدف.
              </p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
