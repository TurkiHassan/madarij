import React, { useState } from 'react'
import { Icon, type IconName } from './Icon'
import { go, useRoute } from '../router'
import { useStore } from '../store'
import { FeedbackWidget } from './FeedbackWidget'

const LINKS: { path: string; label: string; icon: IconName }[] = [
  { path: '/app', label: 'لوحة اليوم', icon: 'home' },
  { path: '/app/skills', label: 'مكتبة المعايير', icon: 'skills' },
  { path: '/app/students', label: 'الطلاب', icon: 'users' },
  { path: '/app/activities', label: 'الأنشطة', icon: 'activity' },
  { path: '/app/probe', label: 'المسبار الأسبوعي', icon: 'probe' },
  { path: '/app/feedback', label: 'ملاحظات المعلمين', icon: 'note' },
  { path: '/app/guide', label: 'دليل العرض', icon: 'book' },
]

export function AppShell({
  title,
  children,
  active,
}: {
  title: string
  children: React.ReactNode
  active?: string
}) {
  const { state, setFontScale } = useStore()
  const route = useRoute()
  const [open, setOpen] = useState(false)

  const current = active ?? route

  return (
    <div className="app" style={{ '--fs': state.fontScale / 100 } as React.CSSProperties}>
      <aside className={`app-sidebar no-print ${open ? 'open' : ''}`}>
        <button
          className="side-brand"
          type="button"
          onClick={() => {
            setOpen(false)
            go('/')
          }}
        >
          مدارج <small>نسخة تجريبية</small>
        </button>
        <nav className="side-nav" aria-label="أقسام النموذج">
          {LINKS.map((l) => {
            const isActive =
              l.path === '/app'
                ? current === '/app'
                : l.path === '/app/students'
                  ? current.startsWith('/app/student')
                  : l.path === '/app/skills'
                    ? current.startsWith('/app/skill')
                    : current.startsWith(l.path)
            return (
              <a
                key={l.path}
                href={`#${l.path}`}
                className={`side-link ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setOpen(false)
                  go(l.path)
                }}
              >
                <Icon name={l.icon} />
                {l.label}
              </a>
            )
          })}
        </nav>
        <div className="side-foot">
          نموذج تجريبي لأخذ ملاحظات المعلمين.
          <br />
          البيانات وهمية وتُحفظ على جهازك.
          <br />
          <a
            href="#/"
            onClick={(e) => {
              e.preventDefault()
              go('/')
            }}
          >
            العودة إلى صفحة التعريف
          </a>
        </div>
      </aside>

      {open && (
        <button
          className="feedback-overlay"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
          style={{ zIndex: 40 }}
        />
      )}

      <div className="app-main">
        <header className="app-topbar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="menu-btn" type="button" onClick={() => setOpen(true)} aria-label="افتح القائمة">
              <Icon name="menu" />
            </button>
            <div className="top-title">{title}</div>
          </div>
          <div className="top-actions">
            <div className="scale-group" role="group" aria-label="حجم الخط">
              {[
                { v: 100, l: 'أ', size: 12 },
                { v: 112, l: 'أ', size: 14 },
                { v: 125, l: 'أ', size: 17 },
              ].map((s) => (
                <button
                  key={s.v}
                  className={`scale-btn ${state.fontScale === s.v ? 'active' : ''}`}
                  type="button"
                  onClick={() => setFontScale(s.v)}
                  aria-pressed={state.fontScale === s.v}
                  title={`حجم الخط ${s.v}%`}
                  style={{ fontSize: s.size }}
                >
                  {s.l}
                </button>
              ))}
            </div>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => go('/')}
            >
              الموقع
            </button>
            <div className="teacher-chip">
              <b>ل</b>
              <span>أ. لمياء العسيري</span>
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>

      <FeedbackWidget />
    </div>
  )
}
