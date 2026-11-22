import React, { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Sparkline } from '../components/Charts'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { ACTIVITY_BY_ID, latestProbe } from '../data/seed'
import { daysSince, fmtDateShort, initials, mastery, probeDelta } from '../lib/format'
import { DOMAIN_SHORT } from '../types'

export function Students() {
  const { state } = useStore()
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState('الكل')

  const grades = ['الكل', 'الثاني الابتدائي', 'الثالث الابتدائي', 'الرابع الابتدائي']

  const rows = useMemo(
    () =>
      state.students.filter((s) => {
        const matchQ = s.name.includes(query.trim()) || s.classroom.includes(query.trim())
        const matchG = grade === 'الكل' || s.grade === grade
        return matchQ && matchG
      }),
    [state.students, query, grade],
  )

  return (
    <AppShell title="الطلاب">
      <div className="page-head">
        <div>
          <h1 className="page-title">الطلاب</h1>
          <p className="page-sub">
            {state.students.length} ملفات، و{state.students.reduce((n, s) => n + s.goals.length, 0)}{' '}
            أهداف. اختر طالبًا لرؤية خطته وتقدمه.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={() => go('/app/probe')}>
            <Icon name="probe" size={17} />
            مسبار جديد
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 380 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الصف…"
            aria-label="بحث في الطلاب"
            style={{
              width: '100%',
              height: 44,
              paddingInline: '40px 14px',
              border: '1px solid var(--line)',
              background: 'var(--white)',
              fontSize: '0.9em',
            }}
          />
          <span
            style={{
              position: 'absolute',
              insetInlineStart: 13,
              top: 13,
              color: 'var(--muted)',
              pointerEvents: 'none',
            }}
          >
            <Icon name="search" size={17} />
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {grades.map((g) => (
            <button
              key={g}
              type="button"
              className={`chip ${grade === g ? 'chip-olive' : 'chip-sand'}`}
              style={{ border: 0, padding: '7px 13px', fontSize: '0.78em' }}
              onClick={() => setGrade(g)}
            >
              {g === 'الكل' ? 'كل الصفوف' : g.replace(' الابتدائي', '')}
            </button>
          ))}
        </div>
      </div>

      <section className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>الطالب</th>
                <th className="hide-sm">الهدف الأول</th>
                <th>آخر مسبار</th>
                <th className="hide-sm">الخط</th>
                <th>الإتقان</th>
                <th className="hide-sm">آخر نشاط</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const p = latestProbe(s)
                const delta = probeDelta(s)
                const m = mastery(s, s.goals[0])
                const lastResult = [...s.results].sort((a, b) => b.date.localeCompare(a.date))[0]
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="student-cell">
                        <div className="avatar" style={{ background: s.color }}>
                          {initials(s.name)}
                        </div>
                        <div>
                          <b>{s.name}</b>
                          <small>
                            {s.grade} — {s.classroom.split('—')[1]?.trim()}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td className="hide-sm">
                      <span className="chip chip-sand">{DOMAIN_SHORT[s.goals[0].domain]}</span>
                      <div style={{ fontSize: '0.75em', color: 'var(--muted)', marginTop: 4 }}>
                        {s.goals[0].title}
                      </div>
                    </td>
                    <td>
                      <div className="num" style={{ fontSize: '1.05em' }}>
                        {p?.value ?? '—'}
                        <span style={{ fontSize: '0.65em', color: 'var(--muted)', fontWeight: 400 }}>
                          {' '}
                          / {s.goals[0].target}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7em', color: 'var(--muted)' }}>
                        {p ? `قبل ${daysSince(p.date)} أيام` : 'بلا قياس'}
                      </div>
                    </td>
                    <td className="hide-sm">
                      <Sparkline values={s.probes.map((x) => x.value)} />
                    </td>
                    <td style={{ minWidth: 96 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ minWidth: 54 }}>
                          <span style={{ width: `${Math.round((m ?? 0) * 100)}%` }} />
                        </div>
                        <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>
                          {m === null ? '—' : `${Math.round(m * 100)}%`}
                        </span>
                      </div>
                      {delta !== null && (
                        <span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
                          {delta > 0 ? '+' : ''}
                          {delta} هذا الأسبوع
                        </span>
                      )}
                    </td>
                    <td className="hide-sm" style={{ fontSize: '0.78em', color: 'var(--muted)' }}>
                      {lastResult ? (
                        <>
                          {ACTIVITY_BY_ID[lastResult.activityId]?.title}
                          <div style={{ marginTop: 3 }}>
                            <span className="chip chip-olive">
                              {lastResult.score}/{lastResult.total}
                            </span>{' '}
                            <span style={{ fontSize: '0.85em' }}>{fmtDateShort(lastResult.date)}</span>
                          </div>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => go(`/app/student/${s.id}`)}
                      >
                        الملف
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!rows.length && <div className="empty">لا يوجد طالب مطابق للبحث.</div>}
        </div>
      </section>
    </AppShell>
  )
}
