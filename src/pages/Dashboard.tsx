import React from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { LineChart } from '../components/Charts'
import { useStore } from '../store'
import { go } from '../router'
import {
  ACTIVITY_BY_ID,
  PROBE_DATES,
  latestProbe,
  previousProbe,
} from '../data/seed'
import { classAverage, daysSince, fmtDateShort, initials, mastery, probeDelta } from '../lib/format'

const TODAY_LABEL = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date('2026-11-21T12:00:00'))

export function Dashboard() {
  const { state } = useStore()
  const { students, feedback } = state

  const activeGoals = students.reduce(
    (n, s) => n + s.goals.filter((g) => g.status === 'active').length,
    0,
  )

  const allMastery = students.flatMap((s) =>
    s.goals.map((g) => mastery(s, g)).filter((v): v is number => v !== null),
  )
  const avgMastery = allMastery.length
    ? Math.round((allMastery.reduce((a, b) => a + b, 0) / allMastery.length) * 100)
    : 0

  const ranked = [...students]
    .map((s) => {
      const vals = s.goals.map((g) => mastery(s, g)).filter((v): v is number => v !== null)
      const m = vals.length ? Math.min(...vals) : 0
      return { s, m }
    })
    .sort((a, b) => a.m - b.m)
    .slice(0, 3)

  const classPoints = PROBE_DATES.map((d) => ({
    date: d,
    value: classAverage(students, d) ?? 0,
  })).filter((p) => p.value > 0)

  const recentResults = students
    .flatMap((s) => s.results.map((r) => ({ s, r })))
    .sort((a, b) => b.r.date.localeCompare(a.r.date))
    .slice(0, 4)

  const probesThisWeek = students.filter((s) => {
    const p = latestProbe(s)
    return p && daysSince(p.date) <= 7
  }).length

  return (
    <AppShell title="لوحة اليوم">
      <div className="page-head">
        <div>
          <h1 className="page-title">صباح الخير، أ. لمياء.</h1>
          <p className="page-sub">
            {TODAY_LABEL} — {probesThisWeek} ملفات مسابيرها محدثة هذا الأسبوع
            {feedback.length > 0 ? `، و${feedback.length} ملاحظة من الزملاء` : '، ولا ملاحظات من الزملاء بعد'}.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={() => go('/app/probe')}>
            <Icon name="probe" size={17} />
            سجّل مسبارًا
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => go('/app/activities')}>
            <Icon name="activity" size={17} />
            ابدأ نشاطًا
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">طلاب في الملف</div>
        </div>
        <div className="stat">
          <div className="stat-value">{activeGoals}</div>
          <div className="stat-label">أهداف نشطة</div>
        </div>
        <div className="stat">
          <div className="stat-value">{avgMastery}%</div>
          <div className="stat-label">متوسط إتقان الأهداف</div>
        </div>
        <div className="stat">
          <div className="stat-value">{feedback.length}</div>
          <div className="stat-label">ملاحظات مجموعة</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">ملفات تحتاج قرارك هذا الأسبوع</h2>
              <span className="chip chip-coral">٣ ملفات</span>
            </div>
            <div className="panel-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {ranked.map(({ s, m }, i) => {
                const p = latestProbe(s)
                const delta = probeDelta(s)
                const reason =
                  i === 0
                    ? `أدنى إتقان بين أهدافه (${Math.round(m * 100)}%). راجع الاستراتيجية أو المدة.`
                    : i === 1
                      ? `آخر مسبار ${p?.value ?? '—'} كلمة/دقيقة، والهدف ${s.goals[0].target}.`
                      : delta !== null && delta < 0
                        ? `تراجع ${Math.abs(delta)} كلمة في آخر مسبار. جرّب نصًا أقصر.`
                        : `موعد مراجعة الخطة ${fmtDateShort(s.goals[s.goals.length - 1].due)}.`
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      padding: '14px 0',
                      borderBottom: i === 2 ? 'none' : '1px solid #eee8da',
                    }}
                  >
                    <div className="avatar" style={{ background: s.color }}>
                      {initials(s.name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <b style={{ fontSize: '0.94em' }}>{s.name}</b>
                        {delta !== null && (
                          <span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
                            {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'} {Math.abs(delta)}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8em', color: 'var(--muted)', marginTop: 3 }}>{reason}</p>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => go(`/app/student/${s.id}`)}
                    >
                      افتح
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">متوسط الصف — الطلاقة القرائية</h2>
              <span className="chip chip-sea">{students.length} طلاب</span>
            </div>
            <div className="panel-body">
              <LineChart points={classPoints} unit="كلمة/دقيقة" height={220} compact />
              <div className="chart-legend">
                <span className="legend-item">
                  <i className="legend-dot" /> متوسط كلمة صحيحة/دقيقة
                </span>
                <span className="legend-item">
                  <i className="legend-dot sage" /> آخر ثمانية أسابيع
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="dash-col">
          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">مسبار هذا الأسبوع</h2>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/probe')}>
                كل المسابير
              </button>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>الطالب</th>
                    <th>آخر مسبار</th>
                    <th>الهدف</th>
                    <th>الفرق</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const p = latestProbe(s)
                    const prev = previousProbe(s)
                    const delta = p && prev ? p.value - prev.value : null
                    const goal = s.goals[0]
                    const done = p && p.value >= goal.target
                    return (
                      <tr key={s.id}>
                        <td>
                          <div className="student-cell">
                            <div className="avatar" style={{ background: s.color, width: 30, height: 30, fontSize: 11 }}>
                              {initials(s.name)}
                            </div>
                            <div>
                              <b>{s.name.split(' ')[0]}</b>
                              <small>{s.grade}</small>
                            </div>
                          </div>
                        </td>
                        <td className="num">{p ? p.value : '—'}</td>
                        <td className="num" style={{ color: 'var(--muted)' }}>{goal.target}</td>
                        <td>
                          {delta === null ? (
                            <span className="delta flat">—</span>
                          ) : (
                            <span className={`delta ${done ? 'up' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
                              {delta > 0 ? '+' : ''}
                              {delta}
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className={`chip ${done ? 'chip-olive' : 'chip-sand'}`}>
                            {done ? 'تحقق' : 'قيد العمل'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">آخر الأنشطة</h2>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/activities')}>
                كل الأنشطة
              </button>
            </div>
            <div className="panel-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {recentResults.map(({ s, r }, i) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 0',
                    borderBottom: i === recentResults.length - 1 ? 'none' : '1px solid #eee8da',
                  }}
                >
                  <div className="avatar" style={{ background: s.color, width: 32, height: 32, fontSize: 12 }}>
                    {initials(s.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ fontSize: '0.86em', display: 'block' }}>
                      {ACTIVITY_BY_ID[r.activityId]?.title ?? 'نشاط'}
                    </b>
                    <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>
                      {s.name.split(' ')[0]} — {fmtDateShort(r.date)}
                    </span>
                  </div>
                  <span className="chip chip-olive">
                    {r.score}/{r.total}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  )
}
