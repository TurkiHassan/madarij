import React from 'react'
import { AppShell } from '../components/AppShell'
import { Icon } from '../components/Icon'
import { useStore } from '../store'
import { go } from '../router'
import { fmtDateTime } from '../lib/format'
import type { FeedbackItem } from '../types'

const MOOD: Record<FeedbackItem['mood'], { label: string; chip: string }> = {
  clear: { label: 'واضح', chip: 'chip-olive' },
  confused: { label: 'يحتاج توضيحًا', chip: 'chip-sand' },
  problem: { label: 'فيه مشكلة', chip: 'chip-coral' },
  idea: { label: 'فكرة', chip: 'chip-sea' },
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export function FeedbackPage() {
  const { state, removeFeedback, reset } = useStore()

  function exportJson() {
    download(
      'madarij-feedback.json',
      JSON.stringify(state.feedback, null, 2),
      'application/json;charset=utf-8',
    )
  }

  function exportCsv() {
    const rows = [
      ['التاريخ', 'الشاشة', 'التقييم', 'الملاحظة', 'الاسم'],
      ...state.feedback.map((f) => [
        f.createdAt,
        f.screen,
        MOOD[f.mood].label,
        f.note.replace(/\n/g, ' '),
        f.name,
      ]),
    ]
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    download('madarij-feedback.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8')
  }

  function copyAll() {
    const text = state.feedback
      .map(
        (f) =>
          `• ${f.screen} — ${MOOD[f.mood].label}${f.name ? ` (${f.name})` : ''}\n  ${f.note || 'بلا نص'}`,
      )
      .join('\n\n')
    navigator.clipboard.writeText(text).catch(() => undefined)
  }

  function resetDemo() {
    if (window.confirm('سيُعاد النموذج إلى بياناته الأصلية وتُمسح الملاحظات. هل تريد المتابعة؟')) {
      reset()
    }
  }

  return (
    <AppShell title="ملاحظات المعلمين">
      <div className="page-head">
        <div>
          <h1 className="page-title">ملاحظات المعلمين</h1>
          <p className="page-sub">
            كل ملاحظة يحفظها المعلم من زر «ملاحظة» تظهر هنا، مع الشاشة التي كان يراها. صدّرها بعد
            الجلسة.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" type="button" onClick={exportCsv} disabled={!state.feedback.length}>
            <Icon name="download" size={17} />
            صدّر CSV
          </button>
          <button className="btn btn-ghost" type="button" onClick={exportJson} disabled={!state.feedback.length}>
            JSON
          </button>
          <button className="btn btn-ghost" type="button" onClick={copyAll} disabled={!state.feedback.length}>
            نسخ الكل
          </button>
        </div>
      </div>

      {!state.feedback.length ? (
        <div className="panel">
          <div className="empty">
            <p style={{ marginBottom: 10 }}>لا ملاحظات بعد.</p>
            <p style={{ fontSize: '0.9em' }}>
              افتح أي شاشة من شريط التنقل، ثم اضغط زر «ملاحظة» أسفل الشاشة وسجّل رأيك.
            </p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} type="button" onClick={() => go('/app')}>
              ابدأ من لوحة اليوم
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.feedback.map((f) => (
            <article className="panel" key={f.id}>
              <div className="panel-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className={`chip ${MOOD[f.mood].chip}`}>{MOOD[f.mood].label}</span>
                    <b style={{ fontSize: '0.9em' }}>{f.screen}</b>
                    <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>{fmtDateTime(f.createdAt)}</span>
                    {f.name && (
                      <span style={{ fontSize: '0.75em', color: 'var(--muted)' }}>— {f.name}</span>
                    )}
                  </div>
                  {f.note && (
                    <p style={{ marginTop: 8, fontSize: '0.9em', lineHeight: 1.8, color: 'var(--ink-2)' }}>
                      {f.note}
                    </p>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => removeFeedback(f.id)}
                  aria-label="احذف الملاحظة"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="panel" style={{ marginTop: 28 }}>
        <div className="panel-head">
          <h2 className="panel-title">إدارة النموذج</h2>
        </div>
        <div className="panel-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.84em', color: 'var(--muted)', maxWidth: 560, lineHeight: 1.8 }}>
            الملاحظات والمسابير والأنشطة محفوظة في متصفح هذا الجهاز فقط. إن أردت بدء جلسة مع معلم
            جديد من بيانات نظيفة، أعد ضبط النموذج.
          </p>
          <button className="btn btn-danger" type="button" onClick={resetDemo}>
            <Icon name="reset" size={17} />
            أعد ضبط النموذج
          </button>
        </div>
      </section>
    </AppShell>
  )
}
