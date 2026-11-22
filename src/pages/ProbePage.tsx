import React, { useEffect, useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { LineChart } from '../components/Charts'
import { useStore } from '../store'
import { go } from '../router'
import { PASSAGES, TODAY, latestProbe } from '../data/seed'
import { fmtDateShort, initials, targetLabel } from '../lib/format'
import { Select } from '@atlas/ui'
import { notifications } from '@atlas/ui/notifications'

type Phase = 'setup' | 'running' | 'result'

export function ProbePage({ studentId }: { studentId?: string }) {
  const { state, saveProbe } = useStore()
  const students = state.students

  const [selected, setSelected] = useState(studentId ?? students[0]?.id ?? '')
  const student = students.find((s) => s.id === selected) ?? students[0]
  const [passageId, setPassageId] = useState(PASSAGES[0].id)
  const [phase, setPhase] = useState<Phase>('setup')
  const [seconds, setSeconds] = useState(60)
  const [correct, setCorrect] = useState(0)
  const [errors, setErrors] = useState(0)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!studentId) return
    setSelected(studentId)
    setPhase('setup')
    setSeconds(60)
    setCorrect(0)
    setErrors(0)
    setNote('')
    setSaved(false)
  }, [studentId])

  const passage = PASSAGES.find((p) => p.id === passageId) ?? PASSAGES[0]
  const last = student ? latestProbe(student) : undefined
  const goal = student?.goals[0]

  useEffect(() => {
    if (phase !== 'running') return
    if (seconds <= 0) return
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [phase, seconds])

  useEffect(() => {
    if (phase === 'running' && seconds === 0) {
      setPhase('result')
    }
  }, [phase, seconds])

  const elapsed = 60 - seconds
  const rawAccuracy = correct + errors > 0 ? Math.round((correct / (correct + errors)) * 100) : 100
  const value = useMemo(() => {
    if (phase !== 'result') return 0
    if (seconds === 0) return correct
    return Math.max(0, Math.round(correct * (60 / Math.max(20, elapsed))))
  }, [phase, correct, elapsed, seconds])

  function start() {
    setCorrect(0)
    setErrors(0)
    setSeconds(60)
    setNote('')
    setSaved(false)
    setPhase('running')
  }

  function finish() {
    setPhase('result')
  }

  function save() {
    if (!student) return
    saveProbe(student.id, {
      date: TODAY,
      value,
      errors,
      accuracy: rawAccuracy,
      passage: passage.title,
      note: note.trim() || undefined,
    })
    setSaved(true)
    notifications.show({
      message: `حُفظ مسبار ${student.name}: ${value} كلمة/دقيقة بدقة ${rawAccuracy}٪.`,
      color: 'coral',
      autoClose: 3200,
      withBorder: true,
    })
    window.setTimeout(() => go(`/app/student/${student.id}/progress`), 700)
  }

  function reset() {
    setPhase('setup')
    setSeconds(60)
    setCorrect(0)
    setErrors(0)
    setNote('')
    setSaved(false)
  }

  const previewPoints = student
    ? [...student.probes.map((p) => ({ date: p.date, value: p.value })), { date: TODAY, value }]
    : []

  return (
    <AppShell title="المسبار الأسبوعي">
      <div className="page-head">
        <div>
          <h1 className="page-title">مسبار الطلاقة القرائية</h1>
          <p className="page-sub">
            ستون ثانية. سجّل الكلمات الصحيحة والأخطاء أثناء القراءة، ولا توقف الطالب عند الخطأ.
          </p>
        </div>
      </div>

      <div className="probe-layout">
        <div>
          {phase === 'setup' && (
            <div className="probe-start">
              <h2>جهّز الجلسة</h2>
              <div className="probe-instructions">
                اجلس بجانب الطالب، وضع النص أمامه. اقرأ التعليمات مرة واحدة، ثم ابدأ المؤقت.
                <ol>
                  <li>الطالب يقرأ بصوت مسموع لمدة ستين ثانية.</li>
                  <li>اضغط «صحيحة» عند كل كلمة يقرؤها صحيحة، و«خطأ» عند الخطأ أو التردد الطويل.</li>
                  <li>لا تصحح للطالب أثناء المسبار؛ التصحيح بعد النهاية.</li>
                </ol>
              </div>

              <div className="probe-fields">
                <div className="field" style={{ minWidth: 210, marginBottom: 0 }}>
                  <label htmlFor="probe-student">الطالب</label>
                  <Select
                    id="probe-student"
                    value={selected}
                    onChange={(v) => setSelected(v ?? '')}
                    data={students.map((s) => ({ value: s.id, label: `${s.name} — ${s.grade}` }))}
                    allowDeselect={false}
                    checkIconPosition="right"
                    maxDropdownHeight={220}
                  />
                </div>
                <div className="field" style={{ minWidth: 230, marginBottom: 0 }}>
                  <label htmlFor="probe-passage">النص</label>
                  <Select
                    id="probe-passage"
                    value={passageId}
                    onChange={(v) => setPassageId(v ?? PASSAGES[0].id)}
                    data={PASSAGES.map((p) => ({ value: p.id, label: `${p.title} — ${p.words} كلمة` }))}
                    allowDeselect={false}
                    maxDropdownHeight={220}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  alignItems: 'center',
                  marginTop: 24,
                }}
              >
                <button className="btn btn-primary" type="button" onClick={start}>
                  <Icon name="probe" size={17} />
                  ابدأ المسبار
                </button>
                {goal && (
                  <span style={{ fontSize: '0.82em', color: 'var(--muted)' }}>
                    هدف {student?.name.split(' ')[0]}: {targetLabel(goal)}
                  </span>
                )}
              </div>

              {last && (
                <div
                  style={{
                    marginTop: 26,
                    paddingTop: 18,
                    borderTop: '1px solid var(--line)',
                    fontSize: '0.85em',
                    color: 'var(--ink-2)',
                  }}
                >
                  آخر مسبار: <b>{last.value}</b> {goal?.unit} في {fmtDateShort(last.date)} بدقة{' '}
                  {last.accuracy}%. النص: {last.passage}.
                </div>
              )}
            </div>
          )}

          {phase === 'running' && (
            <div>
              <div
                className="panel"
                style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '18px 22px', flexWrap: 'wrap' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ background: student?.color }}>
                    {student ? initials(student.name) : 'ط'}
                  </div>
                  <div>
                    <b style={{ display: 'block', fontSize: '0.95em' }}>{student?.name}</b>
                    <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>
                      {passage.title} — {passage.words} كلمة
                    </span>
                  </div>
                </div>
                <div className="probe-timer low" aria-live="polite">
                  {String(seconds).padStart(2, '0')}
                </div>
              </div>

              <div className="probe-passage" dir="rtl">
                <div className="probe-passage-title">{passage.title}</div>
                {passage.text}
              </div>

              <div className="probe-tally" style={{ marginTop: 18 }}>
                <div className="probe-counts">
                  <button className="tally-btn tally-good" type="button" onClick={() => setCorrect((c) => c + 1)}>
                    صحيحة
                    <b>{correct}</b>
                  </button>
                  <button className="tally-btn tally-bad" type="button" onClick={() => setErrors((c) => c + 1)}>
                    خطأ
                    <b>{errors}</b>
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: '0.78em', color: 'var(--muted)' }}>
                    لا تصحح للطالب الآن. ستظهر النتيجة بعد انتهاء الوقت.
                  </span>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={finish}>
                    أنهِ المسبار الآن
                  </button>
                </div>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <div className="panel">
              <div className="panel-head">
                <h2 className="panel-title">نتيجة المسبار</h2>
                <span className="chip chip-sea">{fmtDateShort(TODAY)}</span>
              </div>
              <div className="panel-body">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <div className="probe-result-value">{value}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>كلمة صحيحة في الدقيقة</div>
                    <div className="probe-result-unit">
                      {seconds === 0 ? 'ستون ثانية كاملة' : 'معدل تقديري لأن المسبار انتهى مبكرًا'}
                    </div>
                  </div>
                </div>

                <div className="probe-summary">
                  <div>
                    <b>{correct}</b>
                    <span>كلمة صحيحة</span>
                  </div>
                  <div>
                    <b>{errors}</b>
                    <span>خطأ أو تردد</span>
                  </div>
                  <div>
                    <b>{rawAccuracy}%</b>
                    <span>الدقة</span>
                  </div>
                  <div>
                    <b>{goal ? `${goal.target}` : '—'}</b>
                    <span>الهدف</span>
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <LineChart points={previewPoints} target={goal?.target} unit={goal?.unit} height={210} compact />
                </div>

                <div className="field" style={{ marginTop: 20 }}>
                  <label htmlFor="probe-note">ملاحظة المسبار (اختياري)</label>
                  <input
                    id="probe-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="مثال: توقف عند كلمة غير مألوفة، واحتاج تلميحًا."
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
                  <button className="btn btn-primary" type="button" onClick={save} disabled={saved || correct + errors === 0}>
                    احفظ في ملف الطالب
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={reset}>
                    أعد المحاولة
                  </button>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => student && go(`/app/student/${student.id}`)}
                  >
                    ملف الطالب
                  </button>
                </div>
                {saved && (
                  <p style={{ marginTop: 12, fontSize: '0.82em', color: 'var(--ok)' }}>
                    حُفظ المسبار. نفتح شاشة التقدم…
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <aside className="panel">
          <div className="panel-head">
            <h2 className="panel-title">لماذا هذا المسبار؟</h2>
          </div>
          <div className="panel-body">
            <p style={{ fontSize: '0.84em', lineHeight: 1.85, color: 'var(--ink-2)' }}>
              القياس القصير المتكرر يكشف أثر التدخل أسرع من الاختبار الطويل. النص نفسه يُعاد استخدامه
              لأسبوعين، ثم يُغيَّر لاختبار التعميم.
            </p>
            <div className="info-list" style={{ marginTop: 14 }}>
              <div className="info-item">
                <span>مدة المسبار</span>
                <b>٦٠ ثانية</b>
              </div>
              <div className="info-item">
                <span>وحدة القياس</span>
                <b>كلمة صحيحة/دقيقة</b>
              </div>
              <div className="info-item">
                <span>تكرار القياس</span>
                <b>أسبوعيًا</b>
              </div>
              <div className="info-item">
                <span>الحد الأدنى للدقة</span>
                <b>٩٢%</b>
              </div>
            </div>
            <p style={{ fontSize: '0.76em', color: 'var(--muted)', marginTop: 16, lineHeight: 1.8 }}>
              في هذا النموذج تُحفظ النتيجة على جهازك فقط، ولا تُرسل إلى أي خادم.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
