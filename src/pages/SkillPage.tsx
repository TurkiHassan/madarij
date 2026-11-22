import React, { useEffect, useRef, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { TODAY } from '../data/seed'
import { Select } from '@atlas/ui'
import { notifications } from '@atlas/ui/notifications'
import { initials } from '../lib/format'
import {
  DOMAIN_LABEL,
  GRADE_LABEL,
  KITS,
  criterionByCode,
  type KitActivity,
  type QuizItem,
  type Slide,
} from '../data/skills'

export type SkillTab = 'deck' | 'activities' | 'assess'
const TABS: { id: SkillTab; label: string }[] = [
  { id: 'deck', label: 'العرض التقديمي' },
  { id: 'activities', label: 'الأنشطة التفاعلية' },
  { id: 'assess', label: 'التقويم الختامي' },
]

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
const arNum = (n: number) => String(n).split('').map((d) => AR_DIGITS[Number(d)] ?? d).join('')

/* ----------------------------------------------------------------
   عرض تقديمي
---------------------------------------------------------------- */

function SlideBody({ slide, picked, onPick }: { slide: Slide; picked: number | null; onPick: (i: number) => void }) {
  if (slide.kind === 'intro') {
    return (
      <div className="slide-copy">
        <h3 className="slide-title">{slide.title}</h3>
        <p className="slide-body">{slide.body}</p>
        {slide.prompt && (
          <div className="slide-prompt">
            <span className="cl-note-pin" aria-hidden="true" />
            <p>{slide.prompt}</p>
            <span>توجيه للمعلم</span>
          </div>
        )}
      </div>
    )
  }

  if (slide.kind === 'letters') {
    return (
      <div className="slide-copy">
        <h3 className="slide-title">{slide.title}</h3>
        {slide.note && <p className="slide-note">{slide.note}</p>}
        {slide.groups.map((g) => (
          <div className="letter-group" key={g.label}>
            <span className="letter-group-label">{g.label}</span>
            <div className="letter-tiles">
              {g.items.map((it, idx) => (
                <span className="letter-tile" key={`${it}-${idx}`}>
                  {it}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (slide.kind === 'compare') {
    return (
      <div className="slide-copy">
        <h3 className="slide-title">{slide.title}</h3>
        <div className="compare-rows">
          {slide.rows.map((r, i) => (
            <div className="compare-row" key={i}>
              {r.label && <span className="compare-label">{r.label}</span>}
              <span className="compare-glyph">{r.a}</span>
              <p className="compare-text">{r.b}</p>
            </div>
          ))}
        </div>
        {slide.note && (
          <div className="slide-prompt">
            <span className="cl-note-pin" aria-hidden="true" />
            <p>{slide.note}</p>
            <span>توجيه للمعلم</span>
          </div>
        )}
      </div>
    )
  }

  if (slide.kind === 'quiz') {
    return (
      <div className="slide-copy">
        <h3 className="slide-title">{slide.title}</h3>
        <p className="slide-quiz-q">{slide.question}</p>
        <div className="slide-quiz-options">
          {slide.options.map((opt, i) => {
            const cls =
              picked === null ? '' : i === slide.answer ? 'correct' : i === picked ? 'wrong' : ''
            return (
              <button
                key={opt}
                type="button"
                className={`activity-option ${cls}`}
                disabled={picked !== null}
                onClick={() => onPick(i)}
              >
                <span>{opt}</span>
                {picked !== null && i === slide.answer && <Icon name="check" size={18} />}
                {picked !== null && i === picked && i !== slide.answer && <Icon name="x" size={18} />}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <p className="slide-quiz-feedback">
            {picked === slide.answer
              ? 'إجابة صحيحة — أكمل العرض بالسهم الأيسر.'
              : `ليست الصحيحة. ${slide.hint ?? ''} الإجابة: ${slide.options[slide.answer]}.`}
          </p>
        )}
      </div>
    )
  }

  if (slide.kind === 'passage') {
    return (
      <div className="slide-copy">
        <h3 className="slide-title">{slide.title}</h3>
        <p className="slide-passage-text">{slide.text}</p>
        {slide.note && <p className="slide-note">{slide.note}</p>}
      </div>
    )
  }

  return (
    <div className="slide-copy">
      <h3 className="slide-title">{slide.title}</h3>
      <p className="slide-body">{slide.body}</p>
      {slide.next && <p className="slide-note">{slide.next}</p>}
    </div>
  )
}

function Deck({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const slide = slides[i]

  useEffect(() => {
    setPicked(null)
  }, [i])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setI((v) => Math.min(v + 1, slides.length - 1))
      if (e.key === 'ArrowRight') setI((v) => Math.max(v - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  return (
    <div className="slide-stage" data-ui="true">
      <span className="cl-tape cl-tape--slide" aria-hidden="true" />
      <div className="slide-top">
        <span className="slide-phase">{slide.phase}</span>
        <span className="slide-count">
          {arNum(i + 1)} / {arNum(slides.length)}
        </span>
      </div>
      <SlideBody slide={slide} picked={picked} onPick={setPicked} />
      <div className="slide-dots" aria-hidden="true">
        {slides.map((_, d) => (
          <span key={d} className={d === i ? 'now' : d < i ? 'done' : ''} />
        ))}
      </div>
      <div className="slide-nav">
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setI((v) => Math.max(v - 1, 0))} disabled={i === 0}>
          السابق
        </button>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() => setI((v) => Math.min(v + 1, slides.length - 1))}
          disabled={i === slides.length - 1}
        >
          التالي
          <Icon name="arrow" size={14} />
        </button>
        {i === slides.length - 1 && (
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setI(0)}>
            <Icon name="reset" size={14} />
            إعادة العرض
          </button>
        )}
      </div>
      <p className="slide-hint">الأسهم يمين ويسار للتنقل بين الشرائح.</p>
    </div>
  )
}

/* ----------------------------------------------------------------
   مشغّل الأسئلة (تدريب بتغذية راجعة / تقويم بلا تغذية)
---------------------------------------------------------------- */

function PlayerFooter({ note }: { note: string }) {
  return <p className="player-note">{note}</p>
}

function PracticePlayer({
  activity,
  studentName,
  studentColor,
  onFinish,
  onExit,
}: {
  activity: KitActivity
  studentName: string
  studentColor: string
  onFinish: (score: number) => void
  onExit: () => void
}) {
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const item = activity.items[i]

  function pick(idx: number) {
    if (picked !== null) return
    setPicked(idx)
    setAnswers((a) => {
      const copy = [...a]
      copy[i] = idx
      return copy
    })
  }

  function next() {
    if (i + 1 >= activity.items.length) {
      const score = answers.reduce<number>(
        (acc, a, idx) => acc + (a === activity.items[idx].answer ? 1 : 0),
        0,
      )
      onFinish(score)
      return
    }
    setI((v) => v + 1)
    setPicked(null)
  }

  const correct = picked !== null && picked === item.answer

  return (
    <div className="activity-player" data-ui="true">
      <div className="player-top">
        <div className="player-student">
          <span className="avatar" style={{ background: studentColor }}>{initials(studentName)}</span>
          <div>
            <b>{activity.title}</b>
            <small>{studentName}</small>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onExit}>خروج</button>
      </div>
      <div className="activity-progress" aria-hidden="true">
        {activity.items.map((_, d) => (
          <span key={d} className={d < i ? 'done' : d === i ? 'now' : ''} />
        ))}
      </div>
      {item.passage && <div className="activity-passage">{item.passage}</div>}
      <div className="activity-prompt">{item.prompt}</div>
      <div className="activity-options">
        {item.options.map((opt, idx) => {
          const cls = picked === null ? '' : idx === item.answer ? 'correct' : idx === picked ? 'wrong' : ''
          return (
            <button key={opt} type="button" className={`activity-option ${cls}`} onClick={() => pick(idx)} disabled={picked !== null}>
              <span>{opt}</span>
              {picked !== null && idx === item.answer && <Icon name="check" size={18} />}
              {picked !== null && idx === picked && idx !== item.answer && <Icon name="x" size={18} />}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="activity-feedback">
          <span style={{ color: correct ? 'var(--ok)' : 'var(--coral-2)' }}>
            {correct ? 'إجابة صحيحة.' : `ليست الصحيحة. الإجابة: ${item.options[item.answer]}.`}
            {!correct && item.hint ? ` ${item.hint}` : ''}
          </span>
          <button className="btn btn-primary btn-sm" type="button" onClick={next}>
            {i + 1 >= activity.items.length ? 'اعرض النتيجة' : 'السؤال التالي'}
            <Icon name="arrow" size={14} />
          </button>
        </div>
      )}
      <PlayerFooter note="بلا مؤقت، وبلا ترتيب علني — التغذية الراجعة فورية." />
    </div>
  )
}

function AssessPlayer({
  items,
  title,
  studentName,
  studentColor,
  onExit,
  onDone,
}: {
  items: QuizItem[]
  title: string
  studentName: string
  studentColor: string
  onExit: () => void
  onDone: (score: number, answers: (number | null)[]) => void
}) {
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const item = items[i]
  const chosen = answers[i] ?? null

  function choose(idx: number) {
    setAnswers((a) => {
      const copy = [...a]
      copy[i] = idx
      return copy
    })
  }

  return (
    <div className="activity-player" data-ui="true">
      <div className="player-top">
        <div className="player-student">
          <span className="avatar" style={{ background: studentColor }}>{initials(studentName)}</span>
          <div>
            <b>{title}</b>
            <small>{studentName}</small>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onExit}>إلغاء</button>
      </div>
      <div className="activity-progress" aria-hidden="true">
        {items.map((_, d) => (
          <span key={d} className={d < i ? 'done' : chosen !== null && d === i ? 'now' : ''} />
        ))}
      </div>
      {item.passage && <div className="activity-passage">{item.passage}</div>}
      <div className="activity-prompt">{item.prompt}</div>
      <div className="activity-options">
        {item.options.map((opt, idx) => (
          <button
            key={opt}
            type="button"
            className={`activity-option ${chosen === idx ? 'picked' : ''}`}
            onClick={() => choose(idx)}
          >
            <span>{opt}</span>
          </button>
        ))}
      </div>
      <div className="activity-feedback">
        <span style={{ fontSize: '0.78em', color: 'var(--muted)' }}>
          التقويم بلا تغذية راجعة أثناء الأداء؛ النتيجة بعد الإرسال.
        </span>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={chosen === null}
          onClick={() => {
            if (i + 1 >= items.length) {
              const score = answers.reduce<number>((acc, a, idx) => acc + (a === items[idx].answer ? 1 : 0), 0)
              onDone(score, answers)
            } else {
              setI((v) => v + 1)
            }
          }}
        >
          {i + 1 >= items.length ? 'أرسل التقويم' : 'السؤال التالي'}
          <Icon name="arrow" size={14} />
        </button>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------
   بطاقة المعلم: رصد كلمات الخطأ في قراءة شفهية
---------------------------------------------------------------- */

function TallyPlayer({
  passage,
  title,
  studentName,
  studentColor,
  onExit,
  onDone,
}: {
  passage: string
  title: string
  studentName: string
  studentColor: string
  onExit: () => void
  onDone: (score: number, total: number, markedWords: string[]) => void
}) {
  const words = passage.trim().split(/\s+/)
  const [marked, setMarked] = useState<Set<number>>(new Set())

  function toggle(i: number) {
    setMarked((prev) => {
      const copy = new Set(prev)
      if (copy.has(i)) copy.delete(i)
      else copy.add(i)
      return copy
    })
  }

  const errors = marked.size
  const score = words.length - errors

  return (
    <div className="activity-player" data-ui="true">
      <div className="player-top">
        <div className="player-student">
          <span className="avatar" style={{ background: studentColor }}>{initials(studentName)}</span>
          <div>
            <b>{title}</b>
            <small>{studentName} — اضغط كل كلمة أخطأ فيها الطالب</small>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" type="button" onClick={onExit}>إلغاء</button>
      </div>
      <div className="tally-board" data-ui="true">
        {words.map((w, i) => (
          <button
            key={`${w}-${i}`}
            type="button"
            className={`tally-word ${marked.has(i) ? 'is-wrong' : ''}`}
            onClick={() => toggle(i)}
            aria-pressed={marked.has(i)}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="tally-foot">
        <span className="chip chip-coral">أخطاء: {arNum(errors)}</span>
        <span className="chip chip-olive">صحيحة: {arNum(score)} من {arNum(words.length)}</span>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          onClick={() =>
            onDone(score, words.length, [...marked].sort((a, b) => a - b).map((i) => words[i]))
          }
        >
          أنهِ التقويم واحفظ
          <Icon name="check" size={14} />
        </button>
      </div>
      <PlayerFooter note="اضغط الكلمة مرة لتحديدها كمخطئة، ومرتين للتراجع. النتيجة = الكلمات الصحيحة من مجموع النص." />
    </div>
  )
}

/* ----------------------------------------------------------------
   صفحة المهارة
---------------------------------------------------------------- */

export function SkillPage({ codeSlug, tab = 'deck' }: { codeSlug: string; tab?: SkillTab }) {
  const { state, addResult } = useStore()
  const code = codeSlug.replace('-', '/')
  const criterion = criterionByCode(code)
  const kit = KITS[code]

  const [selected, setSelected] = useState(state.students[0]?.id ?? '')
  const student = state.students.find((s) => s.id === selected) ?? state.students[0]
  const [activeActivity, setActiveActivity] = useState<string | null>(null)
  const [assessRunning, setAssessRunning] = useState(false)
  const [assessDone, setAssessDone] = useState<{
    score: number
    total: number
    wrong: { label: string; sub: string }[]
  } | null>(null)
  const [savedMsg, setSavedMsg] = useState(false)
  const startedAt = useRef<number>(Date.now())

  useEffect(() => {
    setActiveActivity(null)
    setAssessRunning(false)
    setAssessDone(null)
    setSavedMsg(false)
  }, [tab, codeSlug])

  if (!criterion) {
    return (
      <AppShell title="المعيار">
        <div className="empty">
          لم أجد هذا المعيار.{' '}
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/skills')}>
            عُد إلى مكتبة المعايير
          </button>
        </div>
      </AppShell>
    )
  }

  const currentTab: SkillTab = tab

  const saveResult = (score: number, total: number, kind: 'نشاط' | 'تقويم ختامي', activityId: string) => {
    if (!student) return
    const minutes = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    addResult(student.id, {
      date: TODAY,
      activityId,
      score,
      total,
      duration: minutes,
      kind,
      skillCode: criterion.code,
    })
    setSavedMsg(true)
    notifications.show({
      message:
        kind === 'تقويم ختامي'
          ? 'حُفظ التقويم الختامي في ملف الطالب، وأثّر في الهدف المرتبط بالمعيار.'
          : 'حُفظت نتيجة النشاط في ملف الطالب وأثّرت في الهدف المرتبط بالمعيار.',
      color: 'coral',
      autoClose: 2800,
      withBorder: true,
    })
  }

  if (!kit) {
    return (
      <AppShell title="مكتبة المعايير" active="/app/skills">
    <div className="skill-hero" data-ui="true">
      <span className="cl-tape cl-tape--skill" aria-hidden="true" />
      <div className="skill-hero-top">
        <span className="kit-code kit-code--big">م {criterion.code}</span>
        <div className="skill-chips">
          <span className="chip chip-sea">{GRADE_LABEL[criterion.grade]}</span>
          <span className="chip chip-olive">{DOMAIN_LABEL[criterion.domain]}</span>
          {criterion.mastery && <span className="chip chip-coral">المحك {criterion.mastery}</span>}
        </div>
      </div>
      <h1 className="skill-title">{criterion.text}</h1>
      {criterion.masteryNote && <p className="skill-mastery-note">{criterion.masteryNote}</p>}
      <p className="skill-source">
        المصدر الرسمي: الاختبارات التشخيصية لذوي صعوبات التعلم — وزارة التعليم ١٤٣٧/١٤٣٨هـ.
      </p>
    </div>

        <div className="panel">
          <div className="panel-body">
            <p style={{ lineHeight: 1.9 }}>
              نص المعيار معتمد كما هو أعلاه، ويُربط بأهداف الخطة الفردية وقياس التقدم. عدّة التدريس
              (العرض والأنشطة والتقويم الختامي) لهذا المعيار قيد الإعداد.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/skills')}>
                عُد إلى المكتبة
              </button>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/student/abdullah/plan')}>
                اربطه بهدف في خطة
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  const asm = kit.assessment
  const mcqItems = asm.mode === 'mcq' ? asm.items : []
  const tallyPassage = asm.mode === 'tally' ? asm.passage : ''

  return (
    <AppShell title="مكتبة المعايير" active="/app/skills">
    <div className="skill-hero" data-ui="true">
      <span className="cl-tape cl-tape--skill" aria-hidden="true" />
      <div className="skill-hero-top">
        <span className="kit-code kit-code--big">م {criterion.code}</span>
        <div className="skill-chips">
          <span className="chip chip-sea">{GRADE_LABEL[criterion.grade]}</span>
          <span className="chip chip-olive">{DOMAIN_LABEL[criterion.domain]}</span>
          {criterion.mastery && <span className="chip chip-coral">المحك {criterion.mastery}</span>}
        </div>
      </div>
      <h1 className="skill-title">{criterion.text}</h1>
      {criterion.masteryNote && <p className="skill-mastery-note">{criterion.masteryNote}</p>}
      <p className="skill-source">
        المصدر الرسمي: الاختبارات التشخيصية لذوي صعوبات التعلم — وزارة التعليم ١٤٣٧/١٤٣٨هـ.
      </p>
    </div>

        <nav className="tabs" aria-label="أقسام عدّة المهارة">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${currentTab === t.id ? 'active' : ''}`}
              type="button"
              onClick={() => go(`/app/skill/${codeSlug}/${t.id}`)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      {currentTab === 'deck' && <Deck slides={kit.slides} />}

        {currentTab === 'activities' && (
          <div>
            {activeActivity ? (
              (() => {
                const activity = kit.activities.find((a) => a.id === activeActivity)!
                return (
                  <PracticePlayer
                    activity={activity}
                    studentName={student?.name ?? ''}
                    studentColor={student?.color ?? '#2947c8'}
                    onFinish={(score) => {
                      saveResult(score, activity.items.length, 'نشاط', activity.id)
                      setActiveActivity(null)
                    }}
                    onExit={() => setActiveActivity(null)}
                  />
                )
              })()
            ) : (
              <div>
                <div className="student-picker">
                  <span>الطالب:</span>
                  <Select
                    value={selected}
                    onChange={(v) => setSelected(v ?? "")}
                    data={state.students.map((s) => ({ value: s.id, label: `${s.name} — ${s.grade}` }))}
                    aria-label="اختر الطالب"
                    allowDeselect={false}
                    checkIconPosition="right"
                    maxDropdownHeight={220}
                    styles={{ root: { minWidth: 260 } }}
                  />
                </div>
                <div className="kit-grid">
                  {kit.activities.map((a) => (
                    <article className="kit-card kit-card--activity" key={a.id} data-ui="true">
                      <span className="cl-tape cl-tape--kit" aria-hidden="true" />
                      <h3 className="kit-title">{a.title}</h3>
                      <p className="kit-blurb">{a.blurb}</p>
                      <div className="kit-meta">
                        <span>{a.items.length} أسئلة</span>
                        <span>بلا مؤقت</span>
                        <span>تغذية فورية</span>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        type="button"
                        onClick={() => {
                          startedAt.current = Date.now()
                          setActiveActivity(a.id)
                        }}
                      >
                        ابدأ النشاط
                        <Icon name="arrow" size={14} />
                      </button>
                    </article>
                  ))}
                </div>
                {savedMsg && (
                  <p className="saved-line">
                    حُفظت نتيجة النشاط في ملف الطالب وستظهر في نسبة إتقان الهدف المرتبط بالمعيار م{' '}
                    {criterion.code}.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {currentTab === 'assess' && (
          <div>
            {assessRunning && student && asm.mode === 'tally' ? (
              <TallyPlayer
                passage={tallyPassage}
                title={asm.title}
                studentName={student.name}
                studentColor={student.color}
                onExit={() => setAssessRunning(false)}
                onDone={(score, total, markedWords) => {
                  setAssessRunning(false)
                  setAssessDone({
                    score,
                    total,
                    wrong: markedWords.map((w) => ({ label: w, sub: 'كلمة مرصودة كخطأ قراءة' })),
                  })
                  saveResult(score, total, 'تقويم ختامي', `assess:${criterion.code}`)
                }}
              />
            ) : assessRunning && student && asm.mode === 'mcq' ? (
              <AssessPlayer
                items={mcqItems}
                title={asm.title}
                studentName={student.name}
                studentColor={student.color}
                onExit={() => setAssessRunning(false)}
                onDone={(score, answers) => {
                  setAssessRunning(false)
                  const items = mcqItems
                  const wrong = items
                    .map((it, idx) => ({ it, idx, chosen: answers[idx] }))
                    .filter((x) => x.chosen !== x.it.answer)
                    .map((x) => ({
                      label: x.it.prompt,
                      sub: `اختر: ${x.chosen !== null ? x.it.options[x.chosen] : '—'} · الصحيح: ${x.it.options[x.it.answer]}`,
                    }))
                  setAssessDone({ score, total: items.length, wrong })
                  saveResult(score, items.length, 'تقويم ختامي', `assess:${criterion.code}`)
                }}
              />
            ) : assessDone && student ? (
              (() => {
                const pct = Math.round((assessDone.score / assessDone.total) * 100)
                const passed = pct >= asm.passPct
                return (
                  <div className="assess-result" data-ui="true">
                    <span className="cl-tape cl-tape--slide" aria-hidden="true" />
                    <div className={`assess-banner ${passed ? 'is-pass' : 'is-fail'}`}>
                      <b>{passed ? 'تحقق المحك الرسمي' : 'لم يتحقق المحك بعد'}</b>
                      <span>
                        {arNum(assessDone.score)} من {arNum(assessDone.total)} ({pct}٪) — المحك{' '}
                        {asm.passPct}٪
                      </span>
                    </div>
                    <div className="assess-name">
                      <span className="avatar" style={{ background: student.color }}>{initials(student.name)}</span>
                      <div>
                        <b>{student.name}</b>
                        <small>م {criterion.code} — {asm.title}</small>
                      </div>
                    </div>
                    {assessDone.wrong.length > 0 && (
                      <div className="assess-wrong">
                        <b>{asm.mode === 'tally' ? 'كلمات تحتاج تدريبًا:' : 'بنود تحتاج تدريبًا:'}</b>
                        {assessDone.wrong.map((w, idx) => (
                          <div className="assess-wrong-item" key={idx}>
                            <span>{w.label}</span>
                            <small>{w.sub}</small>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="assess-actions">
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setAssessDone(null); setAssessRunning(true) }}>
                        <Icon name="reset" size={14} />
                        أعد التقويم
                      </button>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => go(`/app/student/${student.id}`)}>
                        ملف الطالب
                      </button>
                    </div>
                    <PlayerFooter note="حُفظت النتيجة في ملف الطالب (تقويم ختامي) وأثرت في نسبة إتقان الهدف المرتبط بالمعيار." />
                  </div>
                )
              })()
            ) : (
              <div className="panel">
                <div className="panel-head">
                  <h2 className="panel-title">{asm.title}</h2>
                  <span className="chip chip-coral">المحك {asm.passPct}٪</span>
                </div>
                <div className="panel-body">
                  {asm.mode === 'tally' ? (
                    <>
                      <p style={{ lineHeight: 1.9 }}>
                        بطاقة المعلم: يقرأ الطالب النص بصوت مسموع، وأنت ترصد كل كلمة أخطأ فيها بضغطة
                        واحدة. النتيجة = الكلمات الصحيحة من مجموع النص، وتُقارن بالمحك الرسمي{' '}
                        {asm.passPct}٪ تلقائيًا.
                      </p>
                      {asm.mode === 'tally' && asm.note && <p className="field-note">{asm.note}</p>}
                    </>
                  ) : (
                    <p style={{ lineHeight: 1.9 }}>
                      {mcqItems.length} بنود قصيرة تقيس المعيار مباشرة، بلا تغذية راجعة
                      أثناء الأداء، ثم تُقارن النتيجة بالمحك الرسمي وتُسجل في ملف الطالب.
                    </p>
                  )}
                  {criterion.masteryNote && <p className="field-note">المحك الرسمي: {criterion.masteryNote}</p>}
                  <div className="student-picker">
                    <span>الطالب:</span>
                    <Select
                      value={selected}
                      onChange={(v) => setSelected(v ?? "")}
                      data={state.students.map((st) => ({ value: st.id, label: `${st.name} — ${st.grade}` }))}
                      aria-label="اختر الطالب"
                      allowDeselect={false}
                      checkIconPosition="right"
                      maxDropdownHeight={220}
                      styles={{ root: { minWidth: 260 } }}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      startedAt.current = Date.now()
                      setSavedMsg(false)
                      setAssessRunning(true)
                    }}
                  >
                    ابدأ التقويم الختامي
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </AppShell>
  )
}
