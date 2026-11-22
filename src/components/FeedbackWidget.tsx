import { useEffect, useState } from 'react'
import { useRoute } from '../router'
import { useStore } from '../store'
import type { FeedbackItem } from '../types'
import { Icon } from './Icon'
import { Button, Dialog, Textarea, TextInput } from '@atlas/ui'
import { notifications } from '@atlas/ui/notifications'

function screenLabel(route: string) {
  if (route === '/' || route === '') return 'الصفحة التعريفية'
  if (route === '/app') return 'لوحة اليوم'
  if (route === '/app/students') return 'قائمة الطلاب'
  if (route.includes('/student/') && route.endsWith('/plan')) return 'الخطة الفردية'
  if (route.includes('/student/') && route.endsWith('/progress')) return 'شاشة التقدم'
  if (route.includes('/student/') && route.endsWith('/activities')) return 'أنشطة الطالب'
  if (route.includes('/student/') && route.endsWith('/report')) return 'التقرير'
  if (route.includes('/student/')) return 'ملف الطالب'
  if (route.startsWith('/app/skill/')) return 'عدّة معيار'
  if (route.startsWith('/app/skills')) return 'مكتبة المعايير'
  if (route.startsWith('/app/probe')) return 'المسبار الأسبوعي'
  if (route.startsWith('/app/activities')) return 'الأنشطة'
  if (route === '/app/feedback') return 'ملاحظات المعلمين'
  if (route === '/app/guide') return 'دليل العرض'
  return 'شاشة أخرى'
}

const MOODS: { id: FeedbackItem['mood']; label: string }[] = [
  { id: 'clear', label: 'واضح' },
  { id: 'confused', label: 'يحتاج توضيحًا' },
  { id: 'problem', label: 'فيه مشكلة' },
  { id: 'idea', label: 'عندي فكرة' },
]

export function FeedbackWidget() {
  const route = useRoute()
  const { state, addFeedback } = useStore()
  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<FeedbackItem['mood']>('clear')
  const [note, setNote] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function save() {
    addFeedback({ screen: screenLabel(route), mood, note: note.trim(), name: name.trim() })
    setOpen(false)
    setNote('')
    setMood('clear')
    notifications.show({
      message: 'شكرًا — أُضيفت الملاحظة إلى قائمة المعلمين.',
      color: 'coral',
      radius: 0,
      autoClose: 2600,
      withBorder: true,
    })
  }

  return (
    <>
      <Button
        component="button"
        onClick={() => setOpen(true)}
        className="feedback-fab no-print"
        variant="filled"
        color="coral"
        size="sm"
        leftSection={<Icon name="note" size={16} />}
        styles={{ root: { fontFamily: 'inherit' } }}
      >
        ملاحظة
        {state.feedback.length > 0 && <b>{state.feedback.length}</b>}
      </Button>

      <Dialog
        opened={open}
        onClose={() => setOpen(false)}
        position={{ bottom: 84 }}
        size="md"
        classNames={{ root: 'feedback-dialog' }}
      >
        <h3 className="feedback-title">ما رأيك في هذه الشاشة؟</h3>
        <p className="feedback-screen">أنت الآن في: {screenLabel(route)}</p>

        <div className="feedback-moods" role="group" aria-label="التقييم السريع">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`mood-btn ${mood === m.id ? 'active' : ''}`}
              onClick={() => setMood(m.id)}
              aria-pressed={mood === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          placeholder="ما الذي فهمته بسرعة؟ وما الذي احتاج شرحًا أو كان مربكًا؟"
          minRows={4}
          autosize
          aria-label="الملاحظة"
          mt={10}
        />
        <TextInput
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="اسمك أو تخصصك (اختياري)"
          aria-label="الاسم"
          mt={8}
        />

        <div className="feedback-actions">
          <Button onClick={save} variant="filled" color="coral" size="sm">
            احفظ الملاحظة
          </Button>
          <small>تُحفظ على هذا الجهاز فقط.</small>
        </div>
      </Dialog>
    </>
  )
}
