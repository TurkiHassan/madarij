import React, { useState } from 'react'
import { AppShell } from '../components/AppShell'
import { LineChart, Progress } from '../components/Charts'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { ACTIVITY_BY_ID, latestProbe } from '../data/seed'
import { daysSince, fmtDate, fmtDateShort, initials, mastery, probeDelta, targetLabel } from '../lib/format'
import { DOMAIN_LABEL, DOMAIN_SHORT, type Goal, type Student } from '../types'
import { CRITERIA, criterionByCode, GRADE_LABEL } from '../data/skills'
import { Progress as MantineProgress } from '@atlas/ui'
import { notifications } from '@atlas/ui/notifications'

const skillSlug = (code: string) => code.replace('/', '-')

const TABS = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'plan', label: 'الخطة الفردية' },
  { id: 'progress', label: 'التقدم' },
  { id: 'activities', label: 'الأنشطة' },
  { id: 'report', label: 'التقرير' },
] as const

export type Tab = (typeof TABS)[number]['id']

function nextStep(s: Student) {
  const p = latestProbe(s)
  if (!p) return 'ابدأ بمسبار قصير لتأسيس خط الأساس قبل تعديل الخطة.'
  const goal = s.goals[0]
  if (p.value >= goal.target) return 'الهدف تحقق. راجع الخطة وحدد هدفًا جديدًا بمستوى أعلى.'
  const delta = probeDelta(s)
  if (delta !== null && delta < 0)
    return 'انخفض القياس عن الأسبوع الماضي. جرّب نصًا أقصر، وأعد تدريس الكلمات الصعبة قبل المسبار القادم.'
  if (delta === 0) return 'القياس ثابت. ثبّت الاستراتيجية أسبوعًا آخر، وغيّر النص لاختبار التعميم.'
  if (p.accuracy < 92)
    return 'الدقة أقل من المستهدف. خصص خمس دقائق للقراءة الزوجية مع تصحيح فوري قبل رفع السرعة.'
  return 'المنحنى في تحسن. استمر في القراءة اليومية القصيرة، وحافظ على نفس نص المسبار أسبوعًا آخر للمقارنة.'
}

function GoalEditor({ studentId, goal }: { studentId: string; goal: Goal }) {
  const { updateGoal } = useStore()
  const [statement, setStatement] = useState(goal.statement)
  const [strategies, setStrategies] = useState(goal.strategies.join('\n'))
  const [due, setDue] = useState(goal.due)
  const [status, setStatus] = useState(goal.status)
  const [skillCode, setSkillCode] = useState(goal.skillCode ?? '')
  const [saved, setSaved] = useState(false)

  function pickCriterion(code: string) {
    setSkillCode(code)
    const c = criterionByCode(code)
    if (c) {
      setStatement(`وفق المعيار الرسمي م ${c.code}: ${c.text} — المحك ${c.mastery ?? '60%'}.`)
    }
  }

  function save() {
    updateGoal(studentId, {
      ...goal,
      statement,
      strategies: strategies
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean),
      due,
      status,
      skillCode: skillCode || undefined,
    })
    setSaved(true)
    notifications.show({
      message: 'حُفظت الخطة، وستظهر في التقرير التالي.',
      color: 'coral',
      autoClose: 2400,
      withBorder: true,
    })
  }

  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <div className="panel-head">
        <div>
          {goal.title !== DOMAIN_LABEL[goal.domain] && (
            <span className="goal-domain">{DOMAIN_LABEL[goal.domain]}</span>
          )}
          <h3 className="panel-title" style={{ marginTop: 2 }}>{goal.title}</h3>
        </div>
        <span className={`chip ${status === 'achieved' ? 'chip-olive' : 'chip-sand'}`}>
          {status === 'active' ? 'نشط' : status === 'achieved' ? 'تحقق' : 'للمراجعة'}
        </span>
      </div>
      <div className="panel-body">
        <div className="field">
          <label htmlFor={`sk-${goal.id}`}>ربط بمعيار رسمي (اختياري)</label>
          <select id={`sk-${goal.id}`} value={skillCode} onChange={(e) => pickCriterion(e.target.value)}>
            <option value="">بدون ربط</option>
            {CRITERIA.filter((c) => c.domain === 'reading' || c.domain === 'vocab').map((c) => (
              <option key={c.code} value={c.code}>
                م {c.code} — {GRADE_LABEL[c.grade]} — {c.text.slice(0, 60)}…
              </option>
            ))}
          </select>
          {skillCode && (
            <p className="field-note">المحك الرسمي: {criterionByCode(skillCode)?.mastery ?? '60%'} — يظهر في التقرير.</p>
          )}
        </div>
        <div className="field">
          <label htmlFor={`st-${goal.id}`}>صياغة الهدف (قابلة للقياس)</label>
          <textarea
            id={`st-${goal.id}`}
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--line)',
              background: 'var(--white)',
              fontSize: '0.9em',
              lineHeight: 1.8,
              resize: 'vertical',
            }}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor={`due-${goal.id}`}>تاريخ المراجعة</label>
            <input id={`due-${goal.id}`} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor={`status-${goal.id}`}>حالة الهدف</label>
            <select id={`status-${goal.id}`} value={status} onChange={(e) => setStatus(e.target.value as Goal['status'])}>
              <option value="active">نشط</option>
              <option value="review">للمراجعة</option>
              <option value="achieved">تحقق</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor={`strat-${goal.id}`}>الاستراتيجيات (كل سطر استراتيجية)</label>
          <textarea
            id={`strat-${goal.id}`}
            value={strategies}
            onChange={(e) => setStrategies(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid var(--line)',
              background: 'var(--white)',
              fontSize: '0.9em',
              lineHeight: 1.8,
              resize: 'vertical',
            }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="button" onClick={save}>
            احفظ التعديل
          </button>
          <span style={{ fontSize: '0.78em', color: 'var(--ok)' }} aria-live="polite">
            {saved ? 'حُفظت الخطة، وستظهر في التقرير التالي.' : ''}
          </span>
          <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>
            خط الأساس {goal.baseline} ← الهدف {targetLabel(goal)}
          </span>
        </div>
      </div>
    </section>
  )
}

function AddGoal({ student }: { student: Student }) {
  const { addGoal } = useStore()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('هدف جديد')
  const [domain, setDomain] = useState<Goal['domain']>('comprehension')
  const [statement, setStatement] = useState('')
  const [baseline, setBaseline] = useState(40)
  const [target, setTarget] = useState(80)
  const [unit, setUnit] = useState('نسبة الإتقان')
  const [due, setDue] = useState('2026-12-24')
  const [skillCode, setSkillCode] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!statement.trim()) return
    addGoal(student.id, {
      id: `${student.id}-g${Date.now()}`,
      domain,
      title: title.trim() || 'هدف جديد',
      statement: statement.trim(),
      baseline: Number(baseline),
      target: Number(target),
      unit,
      due,
      status: 'active',
      strategies: [],
      supports: student.supports.slice(0, 2),
      skillCode: skillCode || undefined,
    })
    setOpen(false)
    setStatement('')
    setTitle('هدف جديد')
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <button className="btn btn-ghost" type="button" onClick={() => setOpen((v) => !v)}>
        <Icon name="plus" size={17} />
        أضف هدفًا جديدًا
      </button>
      {open && (
        <form className="panel" style={{ marginTop: 12, padding: 22 }} onSubmit={submit}>
          <div className="field">
            <label htmlFor="ng-skill">ربط بمعيار رسمي (اختياري)</label>
            <select
              id="ng-skill"
              value={skillCode}
              onChange={(e) => {
                const code = e.target.value
                setSkillCode(code)
                const c = criterionByCode(code)
                if (c) {
                  setTitle(c.text.slice(0, 28))
                  setStatement(`وفق المعيار الرسمي م ${c.code}: ${c.text} — المحك ${c.mastery ?? '60%'}.`)
                  setBaseline(40)
                  setTarget(c.mastery === '100%' ? 100 : 60)
                  setUnit('نسبة الإتقان')
                }
              }}
            >
              <option value="">بدون ربط</option>
              {CRITERIA.filter((c) => c.domain === 'reading' || c.domain === 'vocab').map((c) => (
                <option key={c.code} value={c.code}>
                  م {c.code} — {GRADE_LABEL[c.grade]}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ng-title">اسم الهدف</label>
              <input id="ng-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="ng-domain">المهارة</label>
              <select id="ng-domain" value={domain} onChange={(e) => setDomain(e.target.value as Goal['domain'])}>
                {Object.entries(DOMAIN_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="ng-statement">الصياغة القابلة للقياس</label>
            <textarea
              id="ng-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={3}
              placeholder="أن يستخرج الطالب الفكرة الرئيسة من نص قصير بدقة 80% في 3 محاولات."
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid var(--line)',
                background: 'var(--white)',
                fontSize: '0.9em',
                lineHeight: 1.8,
              }}
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ng-base">خط الأساس</label>
              <input id="ng-base" type="number" value={baseline} onChange={(e) => setBaseline(Number(e.target.value))} />
            </div>
            <div className="field">
              <label htmlFor="ng-target">المعيار</label>
              <input id="ng-target" type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="ng-unit">الوحدة</label>
              <select id="ng-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option>نسبة الإتقان</option>
                <option>كلمة صحيحة/دقيقة</option>
                <option>عدد المحاولات</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="ng-due">تاريخ المراجعة</label>
              <input id="ng-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit">
            أضف الهدف إلى الخطة
          </button>
        </form>
      )}
    </div>
  )
}

export function StudentFile({ id, tab = 'overview' }: { id: string; tab?: Tab }) {
  const { state } = useStore()
  const student = state.students.find((s) => s.id === id)

  if (!student) {
    return (
      <AppShell title="ملف الطالب">
        <div className="empty">
          لم نجد هذا الطالب. <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/students')}>عُد إلى الطلاب</button>
        </div>
      </AppShell>
    )
  }

  const p = latestProbe(student)
  const delta = probeDelta(student)
  const points = student.probes.map((x) => ({ date: x.date, value: x.value }))
  const goal = student.goals[0]
  const lastResults = [...student.results].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <AppShell title="ملف الطالب" active={`/app/student/${student.id}`}>
      <div className="page-head no-print">
        <div className="student-id">
          <div className="avatar" style={{ background: student.color }}>
            {initials(student.name)}
          </div>
          <div>
            <h1 className="page-title">{student.name}</h1>
            <div className="student-meta">
              <span>{student.grade}</span>
              <span>·</span>
              <span>{student.classroom}</span>
              <span>·</span>
              <span>المعلمة: أ. لمياء العسيري</span>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={() => go(`/app/probe/${student.id}`)}>
            <Icon name="probe" size={17} />
            سجّل مسبارًا
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => go(`/app/student/${student.id}/report`)}>
            <Icon name="print" size={17} />
            التقرير
          </button>
        </div>
      </div>

      <div className="student-head no-print">
        <div>
          <div className="student-meta" style={{ marginTop: 0 }}>
            {student.goals.map((g) => (
              <span key={g.id} className="chip chip-sand">
                {DOMAIN_SHORT[g.domain]}
              </span>
            ))}
            <span className="chip chip-sand">اهتمام: {student.interest ?? '—'}</span>
            {p && (
              <span className="chip chip-sea">
                آخر مسبار {fmtDateShort(p.date)} — قبل {daysSince(p.date)} أيام
              </span>
            )}
          </div>
          <p className="student-note">{student.note}</p>
        </div>
        <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.72em', color: 'var(--muted)' }}>آخر قياس</div>
            <div style={{ fontSize: '1.5em', fontWeight: 600 }}>{p?.value ?? '—'}</div>
            <div style={{ fontSize: '0.7em', color: 'var(--muted)' }}>{goal.unit}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72em', color: 'var(--muted)' }}>تغير الأسبوع</div>
            <div
              style={{
                fontSize: '1.5em',
                fontWeight: 600,
                color: delta && delta > 0 ? 'var(--ok)' : delta && delta < 0 ? 'var(--warn)' : 'var(--ink)',
              }}
            >
              {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}`}
            </div>
            <div style={{ fontSize: '0.7em', color: 'var(--muted)' }}>كلمة/دقيقة</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72em', color: 'var(--muted)' }}>إتمام الهدف</div>
            <div style={{ fontSize: '1.5em', fontWeight: 600 }}>
              {(() => {
                const m = mastery(student, goal)
                return m === null ? '—' : `${Math.round(m * 100)}%`
              })()}
            </div>
            <div style={{ fontSize: '0.7em', color: 'var(--muted)' }}>حتى آخر مسبار</div>
          </div>
        </div>
      </div>

      <nav className="tabs no-print" aria-label="أقسام ملف الطالب">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            type="button"
            onClick={() => go(`/app/student/${student.id}/${t.id}`)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'overview' && (
        <div className="dash-grid">
          <div>
            <div className="goals">
              {student.goals.map((g) => {
                const m = mastery(student, g)
                return (
                  <article className="goal-card" key={g.id}>
                    <div className="goal-top">
                      <div>
                        {g.title !== DOMAIN_LABEL[g.domain] && (
                          <span className="goal-domain">{DOMAIN_LABEL[g.domain]}</span>
                        )}
                        <h3>{g.title}</h3>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {g.skillCode && (
                          <button
                            className="chip chip-sea skill-chip"
                            type="button"
                            title={criterionByCode(g.skillCode)?.text}
                            onClick={() => go(`/app/skill/${skillSlug(g.skillCode!)}/deck`)}
                          >
                            م {g.skillCode}
                          </button>
                        )}
                        <span className={`chip ${g.status === 'achieved' ? 'chip-olive' : 'chip-sand'}`}>
                          {g.status === 'active' ? 'نشط' : g.status === 'achieved' ? 'تحقق' : 'للمراجعة'}
                        </span>
                      </div>
                    </div>
                    <p className="goal-statement">{g.statement}</p>
                    <div className="goal-meta">
                      <span>خط الأساس {g.baseline}</span>
                      <span>الهدف {targetLabel(g)}</span>
                      <span>المراجعة {fmtDateShort(g.due)}</span>
                    </div>
                    <div className="goal-progress">
                      <div className="goal-progress-head">
                        <span>التقدم نحو الهدف</span>
                        <span>{m === null ? 'بانتظار أول نشاط' : `${Math.round(m * 100)}%`}</span>
                      </div>
                      <MantineProgress value={m === null ? 0 : Math.round(m * 100)} color="cobalt" size={7} />
                    </div>
                  </article>
                )
              })}
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-ghost" type="button" onClick={() => go(`/app/student/${student.id}/plan`)}>
                عدّل الخطة الفردية
              </button>
            </div>
          </div>

          <div className="dash-col">
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">خط الطلاقة القرائية</h2>
                <span className="chip chip-sea">8 أسابيع</span>
              </div>
              <div className="panel-body">
                <LineChart points={points} target={goal.target} unit={goal.unit} height={200} compact />
                <div className="chart-legend">
                  <span className="legend-item"><i className="legend-dot" /> القياس الأسبوعي</span>
                  <span className="legend-item"><i className="legend-dot coral" /> الهدف {goal.target}</span>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 14 }}
                  type="button"
                  onClick={() => go(`/app/student/${student.id}/progress`)}
                >
                  افتح شاشة التقدم
                </button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">التسهيلات المعتمدة</h2>
              </div>
              <div className="panel-body">
                <div className="support-chips">
                  {student.supports.map((x) => (
                    <span className="chip chip-sand" key={x}>
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">الخطوة التالية</h2>
              </div>
              <div className="panel-body">
                <p style={{ fontSize: '0.86em', lineHeight: 1.85, color: 'var(--ink-2)' }}>
                  {nextStep(student)}
                </p>
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'plan' && (
        <div>
          <p className="lead" style={{ marginTop: 0, marginBottom: 22, fontSize: '0.94em' }}>
            كل هدف هنا قابل للتعديل. احفظ التغيير، وسيظهر في التقرير التالي مع بقاء القياسات السابقة
            للمقارنة.
          </p>
          <AddGoal student={student} />
          {student.goals.map((g) => (
            <GoalEditor key={g.id} studentId={student.id} goal={g} />
          ))}
        </div>
      )}

      {tab === 'progress' && (
        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">تقدم {student.name.split(' ')[0]} — {goal.title}</h2>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => go(`/app/probe/${student.id}`)}>
                سجّل مسبارًا
              </button>
            </div>
            <div className="panel-body">
              <LineChart points={points} target={goal.target} unit={goal.unit} />
              <div className="chart-legend">
                <span className="legend-item"><i className="legend-dot" /> كلمة صحيحة/دقيقة</span>
                <span className="legend-item"><i className="legend-dot coral" /> الهدف {goal.target}</span>
                <span className="legend-item">
                  <i className="legend-dot sage" /> خط الأساس {goal.baseline}
                </span>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">سجل القياسات</h2>
              <span className="chip chip-sand">{student.probes.length} مسبارًا</span>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>النص</th>
                    <th>القراءة</th>
                    <th>الدقة</th>
                    <th className="hide-sm">الأخطاء</th>
                    <th className="hide-sm">ملاحظة</th>
                  </tr>
                </thead>
                <tbody>
                  {[...student.probes].reverse().map((probe) => (
                    <tr key={probe.id}>
                      <td>{fmtDate(probe.date)}</td>
                      <td style={{ color: 'var(--muted)' }}>{probe.passage}</td>
                      <td className="num">{probe.value}</td>
                      <td>{probe.accuracy}%</td>
                      <td className="hide-sm">{probe.errors}</td>
                      <td className="hide-sm" style={{ color: 'var(--muted)', fontSize: '0.92em' }}>
                        {probe.note ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {tab === 'activities' && (
        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">نتائج الأنشطة</h2>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => go(`/app/activities/${student.id}`)}>
                ابدأ نشاطًا
              </button>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {lastResults.length ? (
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
                    {lastResults.map((r) => (
                      <tr key={r.id}>
                        <td>{ACTIVITY_BY_ID[r.activityId]?.title ?? 'نشاط'}</td>
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
                <div className="empty">لم يسجل هذا الطالب أي نشاط بعد.</div>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">أنشطة مرتبطة بأهدافه</h2>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {student.goals.map((g) => (
                  <span className="chip chip-sand" key={g.id}>
                    {DOMAIN_LABEL[g.domain]}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: '0.84em', color: 'var(--muted)', marginTop: 12, lineHeight: 1.8 }}>
                كل نشاط يُسجل نتيجته في هذا الملف، ويظهر أثره في نسبة إتقان الهدف المرتبط به.
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === 'report' && (
        <div>
          <div className="report-toolbar no-print">
            <p style={{ fontSize: '0.86em', color: 'var(--muted)' }}>
              معاينة التقرير. استخدم زر الطباعة، أو احفظه PDF من نافذة الطباعة.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="button" onClick={() => window.print()}>
                <Icon name="print" size={17} />
                اطبع التقرير
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => go(`/app/student/${student.id}`)}>
                عُد إلى الملف
              </button>
            </div>
          </div>

          <div className="report-sheet">
            <div className="report-head">
              <div>
                <span className="brand">مدارج</span>
                <small>تقرير تقدم فردي — خطة صعوبات التعلم</small>
              </div>
              <div style={{ textAlign: 'left' }}>
                <small>تاريخ التقرير</small>
                <b style={{ display: 'block', fontSize: 13, marginTop: 3 }}>21 نوفمبر 2026</b>
                <small style={{ marginTop: 6, display: 'block' }}>المعلمة: أ. لمياء العسيري</small>
              </div>
            </div>

            <div className="report-meta">
              <div>
                الطالب
                <b>{student.name}</b>
              </div>
              <div>
                الصف
                <b>{student.grade}</b>
              </div>
              <div>
                الفصل
                <b>{student.classroom}</b>
              </div>
            </div>

            <section className="report-section">
              <h3>الهدف الحالي</h3>
              <div className="report-goal">
                <b>
                  {goal.skillCode && <span className="chip chip-sea">م {goal.skillCode}</span>}{' '}
                  {goal.title !== DOMAIN_LABEL[goal.domain] ? `${DOMAIN_LABEL[goal.domain]} — ${goal.title}` : goal.title}
                </b>
                {goal.statement}
                {goal.skillCode && (
                  <small style={{ display: 'block', marginTop: 6 }}>
                    المعيار من الاختبارات التشخيصية لذوي صعوبات التعلم — وزارة التعليم ١٤٣٧/١٤٣٨هـ.
                  </small>
                )}
              </div>
              <p>
                خط الأساس {goal.baseline}، والمعيار {targetLabel(goal)}، وتاريخ المراجعة{' '}
                {fmtDate(goal.due)}.
              </p>
            </section>

            <section className="report-section">
              <h3>ملخص القياسات</h3>
              <LineChart points={points} target={goal.target} unit={goal.unit} height={210} />
              <p>
                آخر قياس {p?.value} {goal.unit} بتاريخ {p ? fmtDate(p.date) : '—'}، بدقة{' '}
                {p?.accuracy ?? '—'}%. التغير عن القياس السابق{' '}
                {delta === null ? '—' : `${delta > 0 ? '+' : ''}${delta}`} كلمة/دقيقة.
              </p>
            </section>

            <section className="report-section">
              <h3>ما تم تنفيذه</h3>
              {lastResults.length ? (
                <div className="report-goal">
                  <b>الأنشطة المسجلة</b>
                  {lastResults
                    .slice(0, 3)
                    .map(
                      (r) =>
                        `${ACTIVITY_BY_ID[r.activityId]?.title ?? 'نشاط'}: ${r.score}/${r.total} — ${fmtDate(r.date)}. `,
                    )
                    .join('')}
                </div>
              ) : (
                <p>لم تُسجل أنشطة في هذه الفترة.</p>
              )}
              <p>
                التسهيلات: {student.supports.join('، ')}.
              </p>
            </section>

            <section className="report-section">
              <h3>الخطوة التالية</h3>
              <p>{nextStep(student)}</p>
            </section>

            <div className="report-sign">
              <div>
                توقيع المعلمة
                <span />
              </div>
              <div>
                اطلاع ولي الأمر
                <span />
              </div>
              <div>
                التاريخ
                <span />
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
