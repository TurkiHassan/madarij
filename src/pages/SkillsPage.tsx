import React, { useMemo, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { CRITERIA, DOMAIN_LABEL, DOMAIN_SHORT, GRADE_LABEL, KITS, type Criterion, type SkillDomain } from '../data/skills'
import { SegmentedControl } from '@atlas/ui'

const slug = (code: string) => code.replace('/', '-')

function KitCard({ code }: { code: string }) {
  const kit = KITS[code]
  const c = CRITERIA.find((x) => x.code === code)!
  return (
    <article className="kit-card" data-ui="true">
      <span className="cl-tape cl-tape--kit" aria-hidden="true" />
      <div className="kit-head">
        <span className="kit-code">م {c.code}</span>
        <span className="kit-grade">{GRADE_LABEL[c.grade]}</span>
      </div>
      <h3 className="kit-title">{c.text}</h3>
      <div className="kit-meta">
        <span>العرض التقديمي: {kit.slides.length} شرائح</span>
        <span>الأنشطة: {kit.activities.length}</span>
        <span>
          التقويم:{' '}
          {kit.assessment.mode === 'mcq'
            ? `${kit.assessment.items.length} أسئلة`
            : `${kit.assessment.passage.trim().split(/\s+/).length} كلمة`}
        </span>
      </div>
      <div className="kit-actions">
        <button className="btn btn-primary btn-sm" type="button" onClick={() => go(`/app/skill/${slug(c.code)}/deck`)}>
          ابدأ من العرض
          <Icon name="arrow" size={14} />
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => go(`/app/skill/${slug(c.code)}/assess`)}>
          التقويم الختامي
        </button>
      </div>
    </article>
  )
}

export function SkillsPage() {
  const { state } = useStore()
  const [grade, setGrade] = useState(0)
  const [domain, setDomain] = useState<'all' | SkillDomain>('all')

  const rows = useMemo(
    () =>
      CRITERIA.filter((c) => (grade === 0 || c.grade === grade) && (domain === 'all' || c.domain === domain)),
    [grade, domain],
  )

  const kitCount = Object.keys(KITS).length
  const readingCount = CRITERIA.filter((c) => c.domain === 'reading' || c.domain === 'vocab').length

  const resultsBySkill = useMemo(() => {
    const map = new Map<string, number>()
    for (const s of state.students)
      for (const r of s.results) if (r.skillCode) map.set(r.skillCode, (map.get(r.skillCode) ?? 0) + 1)
    return map
  }, [state.students])

  return (
    <AppShell title="مكتبة المعايير">
      <div className="page-head">
        <div>
          <h1 className="page-title">مكتبة معايير القراءة واللغة</h1>
          <p className="page-sub">
            {CRITERIA.length} معيارًا رسميًا للمرحلة الابتدائية من «الاختبارات التشخيصية لذوي
            صعوبات التعلم» — وزارة التعليم ١٤٣٧/١٤٣٨هـ، وكل معيار منها له عدّة تدريس جاهزة: عرض
            تقديمي، أنشطة تفاعلية، وتقويم ختامي بالمحك الرسمي نفسه.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" type="button" onClick={() => go('/app/student/abdullah/plan')}>
            اربط معيارًا بخطة طالب
          </button>
        </div>
      </div>

      <div className="kit-grid">
        {Object.keys(KITS)
          .slice(0, 6)
          .map((code) => (
            <KitCard key={code} code={code} />
          ))}
      </div>
      {Object.keys(KITS).length > 6 && (
        <p className="kit-more-line">
          و{Object.keys(KITS).length - 6} عدّة جاهزة أخرى — كلها في الجدول أدناه بأرقامها الرسمية.
        </p>
      )}

      <div className="criteria-filters">
        <div className="seg-wrap">
          <SegmentedControl
            value={String(grade)}
            onChange={(v) => setGrade(Number(v))}
            data={[
              { value: '0', label: 'كل الصفوف' },
              ...[1, 2, 3, 4, 5, 6].map((g) => ({ value: String(g), label: GRADE_LABEL[g].replace('الصف ', '') })),
            ]}
            aria-label="فلترة الصف"
          />
        </div>
        <div className="seg-wrap">
          <SegmentedControl
            value={domain}
            onChange={(v) => setDomain(v as 'all' | SkillDomain)}
            data={[
              { value: 'all', label: 'كل المجالات' },
              ...( ['reading', 'vocab', 'writing', 'listening'] as const).map((d) => ({
                value: d,
                label: DOMAIN_LABEL[d],
              })),
            ]}
            aria-label="فلترة المجال"
          />
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">المعايير حسب الصف</h2>
          <span className="chip">{rows.length} معيارًا</span>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table className="table criteria-table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>المعيار (نص رسمي)</th>
                <th>المجال</th>
                <th>المحك</th>
                <th>العدّة</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c: Criterion) => {
                const hasKit = Boolean(KITS[c.code])
                const results = resultsBySkill.get(c.code) ?? 0
                return (
                  <tr
                    key={c.code}
                    onClick={() => hasKit && go(`/app/skill/${slug(c.code)}/deck`)}
                    style={{ cursor: hasKit ? 'pointer' : 'default' }}
                  >
                    <td>
                      <span className="crit-code">م {c.code}</span>
                    </td>
                    <td className="crit-text">{c.text}</td>
                    <td>
                      <span className={`chip ${c.domain === 'reading' ? 'chip-sea' : c.domain === 'writing' ? 'chip-sand' : 'chip-olive'}`}>
                        {DOMAIN_SHORT[c.domain]}
                      </span>
                    </td>
                    <td className="num">{c.mastery ?? '—'}</td>
                    <td>
                      {hasKit ? (
                        <span className="chip chip-coral">
                          جاهزة{results > 0 ? ` · ${results} نتائج` : ''}
                        </span>
                      ) : (
                        <span className="chip">قيد الإعداد</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="criteria-source">
        المصدر: الاختبارات التشخيصية لذوي صعوبات التعلم في مادتي اللغة العربية والرياضيات بالمرحلة
        الابتدائية، الإدارة العامة للتربية الخاصة والإدارة العامة للتقويم وجودة التعليم، وزارة
        التعليم ١٤٣٧/١٤٣٨هـ. صياغة الأهداف من دليل معلم صعوبات التعلم في المرحلة الابتدائية
        ١٤٤٢هـ. النصوص منقولة حرفيًا.
      </p>
    </AppShell>
  )
}
