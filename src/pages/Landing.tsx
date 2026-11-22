import React, { useLayoutEffect, useState } from 'react'
import { LineChart } from '../components/Charts'
import { Icon } from '../components/Icon'
import { STUDENTS, latestProbe } from '../data/seed'
import { probeDelta } from '../lib/format'
import { CRITERIA, GRADE_LABEL, criterionByCode } from '../data/skills'
import { go, scrollToId } from '../router'

const SKILLS = [
  { id: 'fluency', label: 'الطلاقة القرائية', targets: [25, 30, 35, 40, 45, 50, 60] },
  { id: 'comprehension', label: 'الفهم القرائي', targets: [80, 85, 90] },
  { id: 'letters', label: 'التاء المربوطة والهاء', targets: [80, 85, 90] },
  { id: 'spelling', label: 'الحركات والتشكيل', targets: [85, 90, 95] },
]

const GRADES = ['الثاني', 'الثالث', 'الرابع']

function useReveal() {
  useLayoutEffect(() => {
    const root = document.querySelector('.cl-page')
    if (!root) return
    const els = Array.from(
      root.querySelectorAll<HTMLElement>(
        '.cl-copy > *, .cl-board, .cl-postcard, .cl-section h2, .cl-section .cl-lede, .cl-note-card, .cl-cycle-card, .cl-letter-card, .cl-tool-row, .cl-builder-paper, .cl-faq details, .cl-cta-paper, .cl-footer-grid > *',
      ),
    )
    els.forEach((el) => {
      el.classList.add('reveal')
      const parent = el.parentElement
      if (!parent) return
      const siblings = Array.from(parent.children).filter((c) => els.includes(c as HTMLElement))
      const index = siblings.indexOf(el)
      el.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 70}ms`)
    })
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' },
    )
    els.forEach((el) => io.observe(el))
    const fallback = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('is-in'))
    }, 2600)
    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [])
}

function buildGoal(skill: string, grade: string, target: number, attempts: number, weeks: number) {
  if (skill === 'fluency') {
    return `أن يقرأ الطالب نصًا قصيرًا مناسبًا للصف ${grade} الابتدائي بمعدل ${target} كلمة صحيحة في الدقيقة، بدقة 95%، في ${attempts} محاولات متتالية خلال ${weeks} أسابيع.`
  }
  if (skill === 'comprehension') {
    return `أن يجيب الطالب عن أسئلة الفهم المباشر والاستنتاجي في نص قصير مناسب للصف ${grade} بدقة ${target}% في ${attempts} محاولات، خلال ${weeks} أسابيع.`
  }
  if (skill === 'letters') {
    return `أن يميّز الطالب بين التاء المربوطة والهاء في نهاية الكلمة في ${target}% من الكلمات، في ${attempts} محاولات متتالية، خلال ${weeks} أسابيع.`
  }
  return `أن يقرأ الطالب الكلمات المشكولة قراءة صحيحة مع مراعاة الحركات في ${target}% من الكلمات، في ${attempts} محاولات، خلال ${weeks} أسابيع.`
}

export function GoalBuilder() {
  const [criterion, setCriterion] = useState('none')
  const [skill, setSkill] = useState('fluency')
  const [grade, setGrade] = useState('الثالث')
  const [target, setTarget] = useState(40)
  const [attempts, setAttempts] = useState(3)
  const [weeks, setWeeks] = useState(6)
  const [copied, setCopied] = useState(false)

  const active = SKILLS.find((s) => s.id === skill)!
  const pickedCriterion = criterion !== 'none' ? criterionByCode(criterion) : undefined
  const text = pickedCriterion
    ? `وفق المعيار الرسمي م ${pickedCriterion.code} من الاختبارات التشخيصية: أن يتقن الطالب ${pickedCriterion.text} بمحك ${pickedCriterion.mastery ?? '60%'} خلال ${weeks} أسابيع.`
    : buildGoal(skill, grade, target, attempts, weeks)

  React.useEffect(() => {
    setTarget(SKILLS.find((s) => s.id === skill)!.targets[3] ?? 40)
  }, [skill])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2400)
  }

  return (
    <div className="builder">
      <div className="builder-controls">
        <div className="field">
          <label htmlFor="gb-criterion">معيار رسمي (من دليل الوزارة)</label>
          <select id="gb-criterion" value={criterion} onChange={(e) => setCriterion(e.target.value)}>
            <option value="none">أصوغ هدفًا حرًا</option>
            {CRITERIA.filter((c) => c.domain === 'reading' || c.domain === 'vocab').slice(0, 12).map((c) => (
              <option key={c.code} value={c.code}>
                م {c.code} — {c.text.slice(0, 46)}…
              </option>
            ))}
          </select>
        </div>
        {criterion === 'none' && (
        <>
        <div className="field">
          <label htmlFor="gb-skill">المهارة</label>
          <select id="gb-skill" value={skill} onChange={(e) => setSkill(e.target.value)}>
            {SKILLS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="gb-grade">الصف</label>
          <select id="gb-grade" value={grade} onChange={(e) => setGrade(e.target.value)}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g} الابتدائي
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="gb-target">معيار الإتقان</label>
            <select id="gb-target" value={target} onChange={(e) => setTarget(Number(e.target.value))}>
              {active.targets.map((t) => (
                <option key={t} value={t}>
                  {t}
                  {skill === 'fluency' ? ' كلمة/دقيقة' : '%'}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="gb-weeks">المدة</label>
            <select id="gb-weeks" value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
              {[4, 6, 8].map((w) => (
                <option key={w} value={w}>
                  {w} أسابيع
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="gb-attempts">عدد المحاولات المتتالية</label>
          <select id="gb-attempts" value={attempts} onChange={(e) => setAttempts(Number(e.target.value))}>
            {[2, 3, 4].map((a) => (
              <option key={a} value={a}>
                {a} محاولات
              </option>
            ))}
          </select>
        </div>
        </>
        )}
        {pickedCriterion && (
          <p className="builder-official">
            {GRADE_LABEL[pickedCriterion.grade]} · المجال الرسمي · المحك {pickedCriterion.mastery ?? '60%'}
            {pickedCriterion.masteryNote ? ` — ${pickedCriterion.masteryNote}` : ''}
          </p>
        )}
      </div>

      <div className="builder-result">
        <p className="goal-text">{text}</p>
        <p className="builder-label">صياغة جاهزة للخطة الفردية</p>
        <p className="goal-meta">
          المعيار قابل للقياس، والمدة واضحة، ويمكن تعديل كل جزء منها داخل ملف الطالب.
        </p>
        <div className="builder-actions">
          <button className="btn btn-primary" onClick={copy} type="button">
            <Icon name="copy" size={17} />
            انسخ الهدف
          </button>
          <span className="copy-note" aria-live="polite">
            {copied ? 'نُسخ الهدف.' : ''}
          </span>
          <button className="link-arrow" onClick={() => go('/app/student/abdullah/plan')} type="button">
            شاهده في الخطة
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SampleActivity() {
  const [picked, setPicked] = useState<number | null>(null)
  const correct = 0
  return (
    <div className="sample-card" data-ui="true">
      <span className="cl-tape cl-tape--sample" aria-hidden="true" />
      <p className="sample-q">أي كلمة تنتهي بتاء مربوطة؟</p>
      <p className="sample-hint">سؤال من نشاط «التاء المربوطة أم الهاء؟» داخل النموذج.</p>
      <div className="sample-options">
        {['حَدِيقَة', 'وَجْه', 'بِنْت'].map((opt, i) => {
          const klass = picked === null ? '' : i === correct ? 'correct' : i === picked ? 'wrong' : ''
          return (
            <button key={opt} type="button" className={`sample-opt ${klass}`} onClick={() => setPicked(i)}>
              <span>{opt}</span>
              {picked !== null && i === correct && <Icon name="check" size={18} />}
              {picked !== null && i === picked && i !== correct && <Icon name="x" size={18} />}
            </button>
          )
        })}
      </div>
      <div className="sample-feedback" aria-live="polite">
        {picked === null && 'اختر إجابة لتجربة التغذية الراجعة.'}
        {picked === correct && 'إجابة صحيحة: التاء المربوطة تُلفظ هاءً عند الوقف، لكنها تُكتب ة.'}
        {picked !== null && picked !== correct && 'ليست الإجابة الصحيحة. جرّب مرة أخرى، أو استخدم التلميح.'}
      </div>
      {picked !== null && (
        <button className="sample-reset" onClick={() => setPicked(null)} type="button">
          أعد المحاولة
        </button>
      )}
    </div>
  )
}

function BoardChart({ values, target }: { values: number[]; target: number }) {
  const w = 440
  const h = 112
  const pad = 8
  const max = Math.max(target, ...values) * 1.06
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
    const y = h - pad - (v / max) * (h - pad * 2)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const ty = h - pad - (target / max) * (h - pad * 2)
  return (
    <svg
      className="cl-board-chart"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`تقدم الطلاقة من ${values[0]} إلى ${values[values.length - 1]} كلمة في الدقيقة، والهدف ${target}`}
    >
      <line x1={pad} x2={w - pad} y1={ty} y2={ty} stroke="#171a1f" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.5" />
      <path d={d} fill="none" stroke="#1f4bff" strokeWidth="2.6" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === pts.length - 1 ? 5.2 : 3.4}
          fill={i === pts.length - 1 ? '#c9f227' : '#f7f0df'}
          stroke="#1f4bff"
          strokeWidth="2"
        />
      ))}
    </svg>
  )
}

const FAQS = [
  {
    q: 'من أين تأتي معايير المهارات؟',
    a: 'من «الاختبارات التشخيصية لذوي صعوبات التعلم» الصادرة عن وزارة التعليم (١٤٣٧/١٤٣٨هـ) — معايير مرقمة لكل صف، منقولة حرفيًا، ومحك إتقان رسمي لكل معيار — وعدّة كاملة (عرض + أنشطة + تقويم) جاهزة لكل المعايير الـ٤٤. وصياغة الأهداف من دليل معلم صعوبات التعلم في المرحلة الابتدائية (١٤٤٢هـ).',
  },
  {
    q: 'هل تغني عن نظام نور؟',
    a: 'لا. مدارج يعمل بجانب الأنظمة المدرسية: يبني الخطة، ويجمع أدلة التقدم، ويصدر تقريرًا يمكن نقل ما تحتاجه منه. لا يدّعي أنه بديل رسمي لأي نظام.',
  },
  {
    q: 'أين تُحفظ بيانات الطلاب في هذا النموذج؟',
    a: 'في هذا النموذج التجريبي لا يُرسل شيء إلى خادم. كل اسم أو مسبار أو ملاحظة تُدخله يبقى في متصفح جهازك، ويمكنك مسحه من صفحة «الملاحظات» في أي وقت.',
  },
  {
    q: 'هل يعمل على الآيباد والجوال؟',
    a: 'نعم. الواجهة مصممة لللمس أولًا: أزرار كبيرة، وخط يمكن تكبيره من أعلى الشاشة، ومسار واحد لا يتطلب تدريبًا طويلًا.',
  },
  {
    q: 'هل الألعاب إلزامية للطالب؟',
    a: 'لا. النشاط أداة لجمع دليل على الهدف، ويمكن استبداله بتقييم قصير أو ملاحظة معلم. الأنشطة هنا قصيرة، وبلا مؤقت إجباري، وبلا ترتيب علني.',
  },
  {
    q: 'كم يستغرق المسبار الأسبوعي؟',
    a: 'ستون ثانية لقراءة النص، ودقيقة لتسجيل النتيجة. النص نفسه متاح داخل الشاشة، مع إمكانية إخفائه إن أراد المعلم.',
  },
  {
    q: 'هل يمكن تعديل الخطة بعد حفظها؟',
    a: 'نعم. كل هدف قابل للتعديل: الصياغة، والمعيار، والاستراتيجيات، وتاريخ المراجعة. التعديل يظهر في التقرير التالي، ويبقى القياس السابق محفوظًا للمقارنة.',
  },
]

export function Landing() {
  useReveal()
  const board = STUDENTS[0]
  const latest = latestProbe(board)!
  const goal = board.goals[0]
  const delta = probeDelta(board)
  const progress = Math.round(((latest.value - goal.baseline) / (goal.target - goal.baseline)) * 100)
  const points = board.probes.map((p) => ({ date: p.date, value: p.value }))

  const jump = (id: string) => scrollToId(id)

  return (
    <div className="cl-page">
      <div className="cl-shapes" aria-hidden="true">
        <span className="cl-shape cl-shape--mint" />
        <span className="cl-shape cl-shape--coral" />
        <span className="cl-shape cl-shape--paper" />
        <span className="cl-tape cl-tape--one" />
        <span className="cl-tape cl-tape--two" />
      </div>

      <header className="cl-nav">
        <button className="cl-brand" type="button" onClick={() => go('/')} aria-label="مدارج">
          <span className="cl-brand-paper">مدارج</span>
          <span className="cl-brand-sub">ملف المعلم</span>
        </button>
        <nav className="cl-links" aria-label="التنقل الرئيسي">
          <button type="button" onClick={() => jump('platform')}>المنصة</button>
          <button type="button" onClick={() => jump('cycle')}>الدورة</button>
          <button type="button" onClick={() => jump('standards')}>المعايير</button>
          <button type="button" onClick={() => jump('arabic')}>خصوصية العربية</button>
          <button type="button" onClick={() => jump('faq')}>الأسئلة</button>
        </nav>
        <button className="cl-navcta" type="button" onClick={() => go('/app')}>
          افتح ملفًا
          <Icon name="arrow" size={15} />
        </button>
      </header>

      <main>
        <section className="cl-hero">
          <div className="cl-copy">
            <h1 className="cl-title">
              الخطة تبدأ
              <br />
              <span className="cl-title-paper">من الطفل.</span>
            </h1>
            <p className="cl-lede">
              لا من قالب جاهز. هدف من كلماته، ونشاط من اهتمامه، ومسبار أسبوعي يخبرك إن كان الطريق
              يعمل. كل ذلك في ملف واحد، بلا أوراق ضائعة.
            </p>
            <div className="cl-actions">
              <button className="cl-cta" type="button" onClick={() => go('/app/student/abdullah')}>
                افتح ملف عبدالله
                <Icon name="arrow" size={16} />
              </button>
              <button className="cl-ghost" type="button" onClick={() => jump('cycle')}>
                كيف تُبنى الخطة؟
              </button>
            </div>
            <p className="cl-footnote">
              <span className="cl-footnote-tape" aria-hidden="true" />
              عبدالله يحتاج خمس دقائق هادئة قبل أن يبدأ. هذه أول جملة في خطته.
            </p>
          </div>

          <div className="cl-board" aria-label="لوحة خطة عبدالله">
            <div className="cl-board-paper" data-ui="true">
              <span className="cl-board-tape" aria-hidden="true" />
              <div className="cl-board-head">
                <span className="cl-avatar">ع</span>
                <div>
                  <h2>عبدالله الحربي</h2>
                  <p>الصف الثالث · أ · طلاقة قرائية</p>
                </div>
                <span className="cl-stamp">خطة الأسبوع ٨</span>
              </div>

              <div className="cl-goal-strip">
                <span>الهدف</span>
                <p>يقرأ ٤٥ كلمة صحيحة في الدقيقة، بدقة ٩٥٪، خلال ستة أسابيع.</p>
              </div>

              <div className="cl-board-grid">
                <div className="cl-mini-card">
                  <span className="cl-mini-label">ما يعرفه عنه المعلم</span>
                  <p>{board.note}</p>
                  <span className="cl-chip cl-chip--mint">اهتمام: {board.interest}</span>
                </div>
                <div className="cl-mini-card cl-mini-card--progress">
                  <span className="cl-mini-label">الرحلة</span>
                  <div className="cl-dots" aria-label="ستة أسابيع، خمسة مكتملة">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <i key={i} className="is-done" />
                    ))}
                    <i className="is-today" />
                  </div>
                  <p>
                    <strong>{latest.value}</strong> من {goal.target} كلمة/دقيقة · الدقة{' '}
                    {latest.accuracy}٪
                  </p>
                </div>
              </div>

              <figure className="cl-chart">
                <figcaption>
                  <span>الطلاقة</span>
                  <span>آخر ٨ أسابيع</span>
                </figcaption>
                <BoardChart values={board.probes.map((p) => p.value)} target={goal.target} />
                <div className="cl-chart-foot">
                  <span>خط الأساس {goal.baseline}</span>
                  <span>الهدف {goal.target}</span>
                  <strong>{progress}٪ من الطريق</strong>
                </div>
              </figure>

              <div className="cl-note">
                <span className="cl-note-pin" aria-hidden="true" />
                <p>«قرأ اليوم عن الصقر بثقة. ننتقل غدًا إلى الفكرة الرئيسة، لا إلى نص أطول.»</p>
                <span>ملاحظة المعلم · الأربعاء</span>
              </div>

              <button className="cl-board-link" type="button" onClick={() => go('/app/student/abdullah')}>
                افتح الخطة كاملة
                <Icon name="arrow" size={15} />
              </button>
            </div>
            <span className="cl-tab-sticker">ملف عبدالله</span>
            <span className="cl-tape cl-tape--board" aria-hidden="true" />
            <span className="cl-doodle" aria-hidden="true">خطوة صغيرة كل أسبوع</span>
          </div>
        </section>

        <section className="cl-section cl-problem" id="platform">
          <div className="cl-wrap cl-problem-grid">
            <div>
              <h2 className="cl-h2">المعلم لا ينقصه حماس، ينقصه وقت.</h2>
              <p className="cl-lede">
                بين كتابة الخطة، وتحضير النشاط، وجمع أدلة التقدم، يضيع الوقت الذي يحتاجه الطالب.
                مدارج يختصر الدورة إلى ما يمكن إنجازه فعلًا في أسبوع واحد.
              </p>
              <div className="cl-notes">
                <div className="cl-note-card">
                  <span className="cl-note-term">الخطة</span>
                  <p>هدف واحد قابل للقياس، لا صفحة تُكتب مرة وتُنسى. كل تعديل يبقى في مكان واحد.</p>
                </div>
                <div className="cl-note-card">
                  <span className="cl-note-term">النشاط</span>
                  <p>تدريب قصير مرتبط بالهدف، بلا مؤقت إجباري ولا ترتيب علني يُحرج الطالب.</p>
                </div>
                <div className="cl-note-card">
                  <span className="cl-note-term">المسبار</span>
                  <p>ستون ثانية من القراءة كل أسبوع، وخط يتحرك أمامك بدل الذاكرة والتقدير.</p>
                </div>
                <div className="cl-note-card">
                  <span className="cl-note-term">التقرير</span>
                  <p>ورقة واحدة تُطبع بضغطة، فيها ما تحتاجه الأسرة: الهدف، والقياس، والخطوة التالية.</p>
                </div>
              </div>
            </div>
            <figure className="cl-postcard">
              <span className="cl-tape cl-tape--postcard" aria-hidden="true" />
              <picture>
                <source
                  type="image/webp"
                  srcSet="./hero-harbor-960.webp 960w, ./hero-harbor-1440.webp 1440w"
                  sizes="(max-width: 920px) 100vw, 40vw"
                />
                <img
                  src="./hero-harbor.jpg"
                  alt="لوحة ميناء إيطالي على سفح جبال، كأنها من عالم الطفل."
                  loading="lazy"
                />
              </picture>
              <figcaption>من عالم الطفل: ميناء، صقور، وخرائط. الخطة تبدأ من شيء يحبه.</figcaption>
            </figure>
          </div>
        </section>

        <section className="cl-section cl-cycle-section" id="cycle">
          <div className="cl-wrap">
            <h2 className="cl-h2">دورة واحدة، تُتقن قبل أن تتوسع.</h2>
            <p className="cl-lede">
              لا نبني كل شيء. خمس خطوات تتكرر كل أسبوع، وتُنتج أثرًا يمكن قياسه أمام المعلم
              والأسرة.
            </p>
            <ol className="cl-cycle">
              {[
                ['١', 'هدف قابل للقياس', 'مهارة واحدة، ومعيار واضح، ومدة محددة.'],
                ['٢', 'خطة قصيرة', 'استراتيجيات وتسهيلات يختارها المعلم، لا تُفرض عليه.'],
                ['٣', 'نشاط من خمس دقائق', 'تدريب مرتبط بالهدف، مع تغذية راجعة فورية.'],
                ['٤', 'مسبار أسبوعي', 'ستون ثانية، ثم نتيجة تُرسم على خط التقدم.'],
                ['٥', 'تقرير يحدّث الخطة', 'قرار الأسبوع القادم يُبنى على القياس، لا على الانطباع.'],
              ].map(([num, title, text]) => (
                <li className="cl-cycle-card" key={num}>
                  <span className="cl-cycle-num">{num}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="cl-section cl-standards" id="standards">
          <div className="cl-wrap">
            <h2 className="cl-h2">كل مهارة من دليل الوزارة، بعدة تدريس جاهزة.</h2>
            <p className="cl-lede">
              المعايير منقولة حرفيًا من «الاختبارات التشخيصية لذوي صعوبات التعلم» بوزارة التعليم، وعدّة كاملة جاهزة لكل معايير اللغة العربية في المرحلة الابتدائية (٤٤ معيارًا: قراءة وفهماً وكتابة). لكل
              معيار: عرض تقديمي بمراحل الدرس، أنشطة تفاعلية بتغذية راجعة، وتقويم ختامي بالمحك
              الرسمي نفسه — ثم يُربط بهدف الخطة الفردية ويُقاس على خط التقدم.
            </p>
            <div className="kit-cards-landing">
              {['1/1', '5/1', '13/1'].map((code) => {
                const c = CRITERIA.find((x) => x.code === code)!
                return (
                  <div className="kit-card-mini" key={code} data-ui="true">
                    <span className="cl-tape cl-tape--kit" aria-hidden="true" />
                    <div className="kit-head">
                      <span className="kit-code">م {c.code}</span>
                      <span className="kit-grade">{GRADE_LABEL[c.grade]}</span>
                    </div>
                    <p>{c.text}</p>
                    <span className="chip chip-coral">المحك {c.mastery}</span>
                  </div>
                )
              })}
            </div>
            <div className="cl-actions" style={{ marginTop: 34 }}>
              <button className="cl-cta" type="button" onClick={() => go('/app/skills')}>
                افتح مكتبة المعايير
                <Icon name="arrow" size={16} />
              </button>
              <button className="cl-ghost" type="button" onClick={() => go('/app/skill/5-1/deck')}>
                جرّب عدّة «التاء المربوطة والهاء»
              </button>
            </div>
            <p className="cl-standards-source">
              المصدر: الاختبارات التشخيصية لذوي صعوبات التعلم في مادتي اللغة العربية والرياضيات
              بالمرحلة الابتدائية — وزارة التعليم ١٤٣٧/١٤٣٨هـ، وصياغة الأهداف من دليل معلم صعوبات
              التعلم في المرحلة الابتدائية ١٤٤٢هـ.
            </p>
          </div>
        </section>

        <section className="cl-section cl-arabic" id="arabic">
          <div className="cl-wrap cl-arabic-grid">
            <div>
              <h2 className="cl-h2">العربية ليست ترجمة. لها أخطاؤها الخاصة.</h2>
              <p className="cl-lede">
                معظم المنصات العالمية تتعامل مع العربية كواجهة تُضاف في النهاية. مدارج يبني
                التمارين على ما يتعثر فيه الطالب العربي فعلًا.
              </p>
              <div className="cl-letter-grid">
                {[
                  ['ب ت ث', 'تمييز الحروف المتشابهة في أول الكلمة ووسطها وآخرها.'],
                  ['ة ه', 'التاء المربوطة والهاء عند الوقف، وهي من أكثر مواضع الخلط.'],
                  ['بَ بُ بِ', 'الحركات التي تغيّر معنى الكلمة، وتُتجاوز عند القراءة السريعة.'],
                  ['ال', 'اللام الشمسية والقمرية، والوصل والفصل في أول الكلمة.'],
                ].map(([glyph, desc], i) => (
                  <div className={`cl-letter-card cl-letter-card--${i + 1}`} key={glyph}>
                    <span className="cl-letter-glyph">{glyph}</span>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <SampleActivity />
          </div>
        </section>

        <section className="cl-section cl-tools" id="tools">
          <div className="cl-wrap">
            <h2 className="cl-h2">ما ستراه في النموذج.</h2>
            <p className="cl-lede">
              ليست صورًا توضيحية. هذه مقتطفات حقيقية من الشاشات التي ستفتحها بعد قليل.
            </p>

            <div className="cl-tool-row">
              <div className="cl-tool-copy">
                <h3>خطة فردية تُقرأ، لا تُحفظ.</h3>
                <p>
                  الهدف مكتوب بصيغة قابلة للقياس، وتحته الاستراتيجيات والتسهيلات وتاريخ المراجعة.
                  المعلم يعدّل، والتقرير يتحدث تلقائيًا.
                </p>
              </div>
              <div className="cl-tool-frag">
                <div className="cl-frag-paper cl-frag-paper--plan" data-ui="true">
                  <span className="cl-tape cl-tape--frag" aria-hidden="true" />
                  <div className="cl-frag-head">
                    <span>خطة عبدالله الحربي</span>
                    <span className="cl-stamp cl-stamp--small">نشط</span>
                  </div>
                  <p className="cl-frag-goal">
                    يقرأ ٤٥ كلمة صحيحة في الدقيقة، بدقة ٩٥٪، خلال ستة أسابيع.
                  </p>
                  <div className="cl-frag-meta">
                    <span>الطلاقة القرائية</span>
                    <span>المراجعة ٢٤ ديسمبر</span>
                    <span>{progress}٪ من الهدف</span>
                  </div>
                  <div className="cl-frag-bar">
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <span className="cl-chip cl-chip--mint">اهتمام: الصقور</span>
                </div>
                <p className="cl-frag-cap">مقتطف من شاشة «الخطة الفردية».</p>
              </div>
            </div>

            <div className="cl-tool-row cl-tool-row--flip">
              <div className="cl-tool-copy">
                <h3>مسبار واحد كل أسبوع، لا أكثر.</h3>
                <p>
                  تسجّل الكلمات الصحيحة والأخطاء أثناء قراءة الطالب، فيُحسب المعدل تلقائيًا. الخط
                  يوضح إن كان التدخل يعمل، أو يحتاج تغييرًا.
                </p>
              </div>
              <div className="cl-tool-frag">
                <div className="cl-data-panel" data-ui="true">
                  <div className="cl-data-top">
                    <span>قياس A-014</span>
                    <span className="cl-live"><i /> آخر ٨ أسابيع</span>
                  </div>
                  <div className="cl-data-body">
                    <div className="cl-data-head">
                      <div>
                        <b>عبدالله الحربي</b>
                        <span>الصف الثالث · الطلاقة القرائية</span>
                      </div>
                      <strong>{latest.value}</strong>
                    </div>
                    <LineChart points={points} target={goal.target} unit={goal.unit} height={196} compact />
                    <div className="cl-data-foot">
                      <span>الدقة {latest.accuracy}٪</span>
                      <span>الأخطاء {latest.errors}</span>
                      <span>الفرق {delta !== null && delta > 0 ? '+' : ''}{delta}</span>
                      <b>الهدف {goal.target}</b>
                    </div>
                  </div>
                </div>
                <p className="cl-frag-cap">مقتطف من شاشة «التقدم».</p>
              </div>
            </div>

            <div className="cl-tool-row">
              <div className="cl-tool-copy">
                <h3>تقرير يخرج من البيانات، لا من الذاكرة.</h3>
                <p>
                  ملخص الهدف، ومعدل القراءة، وما تحقق من نشاط، وخطة الأسبوع القادم. جاهز للطباعة أو
                  للمشاركة في اجتماع ولي الأمر.
                </p>
              </div>
              <div className="cl-tool-frag">
                <div className="cl-report-mini" data-ui="true">
                  <div className="cl-report-head">
                    <div>
                      <strong>مدارج</strong>
                      <span>تقرير تقدم فردي</span>
                    </div>
                    <span>١٨ نوفمبر ٢٠٢٦</span>
                  </div>
                  <p className="cl-report-title">الطلاقة القرائية — عبدالله الحربي</p>
                  <div className="cl-report-line" />
                  <div className="cl-report-line w80" />
                  <div className="cl-report-line w60" />
                  <div className="cl-report-foot">
                    <span>36 كلمة/دقيقة</span>
                    <span>الهدف 45</span>
                    <span>التالية: قراءة زوجية</span>
                  </div>
                </div>
                <p className="cl-frag-cap">مقتطف من شاشة «التقرير».</p>
              </div>
            </div>
          </div>
        </section>

        <section className="cl-section cl-builder-section" id="builder">
          <div className="cl-wrap">
            <h2 className="cl-h2">اكتب هدفًا قابلًا للقياس الآن.</h2>
            <p className="cl-lede">
              اختر المهارة والمعيار، وستحصل على صياغة جاهزة للخطة الفردية. جرّبها، ثم انسخها.
            </p>
            <div className="cl-builder-paper">
              <span className="cl-tape cl-tape--builder" aria-hidden="true" />
              <GoalBuilder />
            </div>
          </div>
        </section>

        <section className="cl-section cl-faq-section" id="faq">
          <div className="cl-wrap cl-faq-grid">
            <div>
              <h2 className="cl-h2">أسئلة المعلمين.</h2>
              <p className="cl-lede">
                ستة أسئلة تتكرر في كل جلسة مع معلمي صعوبات التعلم. أجبنا عنها بصراحة، بما في ذلك ما
                لا تفعله المنصة.
              </p>
              <p className="cl-faq-note">
                لم تجد سؤالك؟ سجّله من زر «ملاحظة» داخل النموذج، وسنضيفه إلى قائمة الأسئلة في
                الجلسة القادمة.
              </p>
            </div>
            <div className="cl-faq">
              {FAQS.map((f, i) => (
                <details key={f.q} className={`cl-faq-card cl-faq-card--${(i % 3) + 1}`}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cl-cta-section">
          <div className="cl-wrap cl-cta-inner">
            <div className="cl-cta-paper">
              <span className="cl-tape cl-tape--cta" aria-hidden="true" />
              <h2>خذ النموذج إلى اجتماع المعلمين.</h2>
              <p>
                افتحه على الآيباد، جرّب مسبارًا مع طالب، ثم سجّل ملاحظتك من زر «ملاحظة» في كل
                شاشة. الملاحظات تُجمع في مكان واحد وتُصدَّر بضغطة.
              </p>
              <div className="cl-cta-actions">
                <button className="cl-cta" type="button" onClick={() => go('/app')}>
                  افتح لوحة اليوم
                  <Icon name="arrow" size={16} />
                </button>
                <button className="cl-ghost cl-ghost--dark" type="button" onClick={() => go('/app/guide')}>
                  دليل العرض
                </button>
              </div>
            </div>
            <div className="cl-cta-note">
              <span className="cl-note-pin" aria-hidden="true" />
              <p>«سجّل الجملة كما قالها المعلم، لا كما تحب أن تسمعها.»</p>
              <span>قاعدة الجلسة</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="cl-footer">
        <div className="cl-wrap cl-footer-grid">
          <div>
            <div className="cl-footer-mark">مدارج</div>
            <p className="cl-footer-desc">
              منصة عربية لخطط صعوبات التعلم الفردية، ومتابعة التقدم، وتقارير الأسرة. تُبنى مع
              المعلم، لا حوله.
            </p>
          </div>
          <div className="cl-footer-side">
            <div className="cl-footer-links">
              <button type="button" onClick={() => go('/app')}>النموذج التجريبي</button>
              <button type="button" onClick={() => go('/app/guide')}>دليل العرض</button>
              <button type="button" onClick={() => go('/app/feedback')}>ملاحظات المعلمين</button>
            </div>
            <div className="cl-footer-stack" aria-hidden="true">
              <span>خطة</span>
              <span>حكاية</span>
              <span>تقدّم</span>
            </div>
          </div>
        </div>
        <p className="cl-footer-note">
          نموذج تجريبي ٢٠٢٦ — البيانات المعروضة وهمية، والملاحظات تُحفظ على جهازك. صُمم لمعلمي
          صعوبات التعلم في المرحلة الابتدائية.
        </p>
      </footer>
    </div>
  )
}
