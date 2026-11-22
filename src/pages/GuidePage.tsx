import React from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'

const STEPS = [
  {
    title: 'افتح لوحة اليوم (دقيقة)',
    body: 'لا تشرح المنتج أولًا. اعرض الشاشة واسأل: «لو كانت هذه شاشتك صباح الاثنين، ما أول شيء تبحث عنه؟»',
    action: { label: 'لوحة اليوم', path: '/app' },
  },
  {
    title: 'افتح ملف فيصل (دقيقتان)',
    body: 'فيصل منخفض التقدم. اقرأ الهدف والملاحظة بصوت عالٍ، واسأل: «هل هذه الصياغة تشبه ما تكتبه فعلًا؟»',
    action: { label: 'ملف فيصل', path: '/app/student/faisal' },
  },
  {
    title: 'اعرض عدّة معيار رسمي (دقيقتان)',
    body: 'افتح مكتبة المعايير ثم عدّة «التاء المربوطة والهاء»: عرض تقديمي واحد، نشاط بتغذية فورية، ثم تقويم ختامي بمحك ٦٠٪. اسأل: «هل هذا ما كنت تقصده بجاهز؟»',
    action: { label: 'عدّة م ٥/١', path: '/app/skill/5-1/deck' },
  },
  {
    title: 'جرّب مسبارًا معه (دقيقتان)',
    body: 'شغّل المؤقت، واطلب من المعلم أن يضغط «صحيحة» و«خطأ» كما يفعل مع طالبه. ثم اعرض النتيجة والخط.',
    action: { label: 'المسبار', path: '/app/probe/faisal' },
  },
  {
    title: 'جرّب نشاطًا قصيرًا (دقيقة)',
    body: 'اختر «التاء المربوطة أم الهاء؟». لاحظ التغذية الراجعة الفورية، ثم احفظ النتيجة وارجع للملف.',
    action: { label: 'الأنشطة', path: '/app/activities' },
  },
  {
    title: 'اعرض التقرير (دقيقة)',
    body: 'اضغط «التقرير» ثم «اطبع». اسأل: «هل تستطيع إرسال هذه الورقة لولي الأمر كما هي؟ ما الناقص؟»',
    action: { label: 'تقرير فيصل', path: '/app/student/faisal/report' },
  },
]

const QUESTIONS = [
  'أي شاشة شعرت أنها تشبه عملك، وأيها لا؟',
  'ما المعلومة التي تبحث عنها ولا تجدها؟',
  'ما الشيء الذي ستحتاج إلى شرحه لزميل جديد؟',
  'هل الصياغة اللغوية قريبة من لغة الخطط في مدرستك؟',
  'ما أول شيء ستحذفه أو تغيّره لو كانت المنصة لك؟',
]

export function GuidePage() {
  const { state, reset } = useStore()

  return (
    <AppShell title="دليل العرض">
      <div className="page-head">
        <div>
          <h1 className="page-title">دليل عرض النموذج على المعلمين</h1>
          <p className="page-sub">
            سبع دقائق، خمس شاشات، وملاحظات تُجمع من داخل النموذج. لا تشرح المزايا؛ دع المعلم يجرّب.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-danger" type="button" onClick={() => {
            if (window.confirm('سيُمسح كل ما أدخلته وتعود البيانات الأصلية. متابعة؟')) reset()
          }}>
            <Icon name="reset" size={17} />
            جلسة نظيفة
          </button>
          <button className="btn btn-primary" type="button" onClick={() => go('/app')}>
            ابدأ العرض
          </button>
        </div>
      </div>

      <div className="guide">
        <section className="panel" style={{ marginBottom: 22 }}>
          <div className="panel-body">
            <h2 className="panel-title">قبل الجلسة</h2>
            <ul style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7, fontSize: '0.88em', color: 'var(--ink-2)' }}>
              <li>— افتح النموذج على آيباد أو شاشة كبيرة، لا على جوال المعلم.</li>
              <li>— أعد ضبط النموذج من الزر أعلاه لتبدأ ببيانات نظيفة.</li>
              <li>— اجلس بجانب المعلم، لا أمامه. دعه يمسك الجهاز.</li>
              <li>— لا تدافع عن أي شاشة. اكتب الملاحظة كما قالها.</li>
            </ul>
          </div>
        </section>

        <section>
          {STEPS.map((s, i) => (
            <div className="guide-step" key={s.title}>
              <div className="guide-num">{['١', '٢', '٣', '٤', '٥', '٦'][i]}</div>
              <div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <button
                  className="link-arrow"
                  type="button"
                  style={{ marginTop: 8, fontSize: '0.86em' }}
                  onClick={() => go(s.action.path)}
                >
                  {s.action.label}
                  <Icon name="arrow" size={15} />
                </button>
              </div>
            </div>
          ))}
        </section>

        <section className="panel" style={{ marginTop: 26 }}>
          <div className="panel-body">
            <h2 className="panel-title">اسأل بعد كل شاشة</h2>
            <div style={{ marginTop: 10 }}>
              {QUESTIONS.map((q) => (
                <div className="guide-q" key={q}>
                  {q}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-body">
            <h2 className="panel-title">كيف تُسجّل الملاحظة؟</h2>
            <p style={{ marginTop: 8, fontSize: '0.88em', lineHeight: 1.85, color: 'var(--ink-2)' }}>
              زر «ملاحظة» أسفل كل شاشة. اختر التقييم السريع، واكتب جملة واحدة بكلمات المعلم. كل
              ملاحظة ترتبط بالشاشة تلقائيًا. بعد الجلسة، افتح «ملاحظات المعلمين» وصدّرها CSV.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => go('/app/feedback')}>
                ملاحظات المعلمين ({state.feedback.length})
              </button>
            </div>
          </div>
        </section>

        <p style={{ marginTop: 24, fontSize: '0.78em', color: 'var(--muted)', lineHeight: 1.9 }}>
          تنبيه: هذه نسخة تجريبية لأخذ الملاحظات. البيانات وهمية، والملاحظات محفوظة في المتصفح فقط.
          لا تُدخل بيانات طالب حقيقي.
        </p>
      </div>
    </AppShell>
  )
}
