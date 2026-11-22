/* ============================================================
   مدارج — شاشات مرسومة بالـcanvas تطفو في العالم ثلاثي الأبعاد
   (بديل «أعمال» LOSHA: كل بطاقة شاشة حقيقية من النموذج،
   مرسومة بهوية الورق والحبر الزيتوني والمرجاني)
   ============================================================ */
import * as THREE from 'three'
import { CSS, SERIF, SANS, ar } from './palette'
import { canvasTex, rr, type CanvasTex } from './helpers'
import { STUDENTS } from '../data/seed'
import { CRITERIA } from '../data/skills'

const board = STUDENTS[0]
const VALUES = board.probes.map((p) => p.value) // 22 → 36
const ACCS = board.probes.map((p) => p.accuracy)

/* ---------- عناصر ورقية مشتركة ---------- */
function paperBase(g: CanvasRenderingContext2D, w: number, h: number) {
  g.fillStyle = CSS.paper
  rr(g, 0, 0, w, h, 46)
  g.fill()
  g.strokeStyle = 'rgba(168,176,141,.55)'
  g.lineWidth = 3
  rr(g, 1.5, 1.5, w - 3, h - 3, 45)
  g.stroke()
  const hl = g.createRadialGradient(w * 0.82, 0, 0, w * 0.82, 0, w * 0.75)
  hl.addColorStop(0, 'rgba(220,128,101,.10)')
  hl.addColorStop(1, 'rgba(220,128,101,0)')
  g.fillStyle = hl
  rr(g, 0, 0, w, h, 46)
  g.fill()
}

function tape(g: CanvasRenderingContext2D, cx: number, y: number, w: number, rot: number, color = 'rgba(220,128,101,.8)') {
  g.save()
  g.translate(cx, y)
  g.rotate(rot)
  g.fillStyle = color
  g.fillRect(-w / 2, -16, w, 32)
  g.restore()
}

function chip(g: CanvasRenderingContext2D, text: string, x: number, y: number, fill: string, fg: string, size = 24) {
  g.font = `500 ${size}px ${SANS}`
  g.textAlign = 'right'
  g.direction = 'rtl'
  const tw = g.measureText(text).width
  rr(g, x - tw - 30, y, tw + 60, size + 30, (size + 30) / 2)
  g.fillStyle = fill
  g.fill()
  g.fillStyle = fg
  g.fillText(text, x - 15, y + size + 7)
}

function spark(
  g: CanvasRenderingContext2D,
  values: number[],
  target: number,
  x: number,
  y: number,
  w: number,
  h: number,
  upTo?: number,
) {
  const n = upTo ?? values.length
  const vals = values.slice(0, n)
  const max = Math.max(target, ...vals) * 1.06
  const px = (i: number) => x + (i * w) / Math.max(1, n - 1)
  const py = (v: number) => y + h - (v / max) * h
  // خط الهدف
  g.setLineDash([10, 8])
  g.strokeStyle = 'rgba(169,83,62,.6)'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(x, py(target))
  g.lineTo(x + w, py(target))
  g.stroke()
  g.setLineDash([])
  g.font = `700 22px ${SANS}`
  g.fillStyle = 'rgba(169,83,62,.85)'
  g.textAlign = 'left'
  g.direction = 'rtl'
  g.fillText(`الهدف ${ar(target)}`, x, py(target) - 12)
  // المنحنى
  g.strokeStyle = CSS.sea
  g.lineWidth = 6
  g.lineJoin = 'round'
  g.lineCap = 'round'
  g.beginPath()
  vals.forEach((v, i) => (i ? g.lineTo(px(i), py(v)) : g.moveTo(px(i), py(v))))
  g.stroke()
  vals.forEach((v, i) => {
    g.beginPath()
    g.arc(px(i), py(v), i === vals.length - 1 ? 12 : 7, 0, 7)
    g.fillStyle = i === vals.length - 1 ? CSS.coral : CSS.paper
    g.fill()
    g.strokeStyle = CSS.sea
    g.lineWidth = 4
    g.stroke()
  })
}

function cardHead(g: CanvasRenderingContext2D, w: number, title: string, sub: string, y = 64) {
  g.direction = 'rtl'
  g.textAlign = 'right'
  g.fillStyle = CSS.ink
  g.font = `700 44px ${SERIF}`
  g.fillText(title, w - 56, y)
  if (sub) {
    g.fillStyle = 'rgba(104,112,92,.9)'
    g.font = `400 26px ${SANS}`
    g.fillText(sub, w - 56, y + 46)
  }
}

/* ---------- بلاطة من دورة الأسبوع (٥ بلاطات) ---------- */
const CYCLE = [
  { n: '١', t: 'الهدف', d: 'قابل للقياس، من كلمات الطفل' },
  { n: '٢', t: 'الخطة', d: 'استراتيجيات يختارها المعلم' },
  { n: '٣', t: 'النشاط', d: 'خمس دقائق مرتبطة بالهدف' },
  { n: '٤', t: 'المسبار', d: 'ستون ثانية كل أسبوع' },
  { n: '٥', t: 'التقرير', d: 'ورقة واحدة للأسرة' },
]

export function tileFaceTexture(i: number, maxAniso: number): CanvasTex {
  const { n, t, d } = CYCLE[i]
  return canvasTex(
    512,
    512,
    (g, w, h) => {
      g.fillStyle = CSS.paper
      rr(g, 6, 6, w - 12, h - 12, 44)
      g.fill()
      g.strokeStyle = 'rgba(168,176,141,.6)'
      g.lineWidth = 4
      rr(g, 6, 6, w - 12, h - 12, 44)
      g.stroke()
      // رقم كبير
      g.direction = 'rtl'
      g.textAlign = 'center'
      g.font = `900 190px ${SANS}`
      g.fillStyle = CSS.coral
      g.fillText(n, w / 2, 200)
      // شريط مرجاني تحت الرقم
      g.fillStyle = CSS.coral
      rr(g, w / 2 - 34, 232, 68, 10, 5)
      g.fill()
      g.fillStyle = CSS.ink
      g.font = `700 64px ${SERIF}`
      g.fillText(t, w / 2, 330)
      g.fillStyle = 'rgba(104,112,92,.95)'
      g.font = `400 28px ${SANS}`
      g.fillText(d, w / 2, 400)
    },
    maxAniso,
  )
}

/* ---------- لوحات الأرقام ---------- */
export type Stat = { to: number; suf: string; label: string }

export const STATS: Stat[] = [
  { to: 44, suf: '+', label: 'معيارًا رسميًا من دليل الوزارة' },
  { to: 60, suf: '', label: 'ثانية تكفي لكل مسبار' },
  { to: 5, suf: '', label: 'خطوات تتكرر كل أسبوع' },
  { to: 1, suf: '', label: 'تقرير جاهز للأسرة' },
]

export function drawStatPanel(g: CanvasRenderingContext2D, v: number, st: Stat) {
  const w = 820
  const h = 540
  g.clearRect(0, 0, w, h)
  const bg = g.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, 'rgba(252,250,244,1)')
  bg.addColorStop(1, 'rgba(237,232,218,1)')
  rr(g, 0, 0, w, h, 60)
  g.fillStyle = bg
  g.fill()
  const hl = g.createRadialGradient(w * 0.85, 0, 0, w * 0.85, 0, w * 0.7)
  hl.addColorStop(0, 'rgba(220,128,101,.30)')
  hl.addColorStop(1, 'rgba(220,128,101,0)')
  g.fillStyle = hl
  rr(g, 0, 0, w, h, 60)
  g.fill()
  g.strokeStyle = 'rgba(168,176,141,.8)'
  g.lineWidth = 4
  rr(g, 2, 2, w - 4, h - 4, 58)
  g.stroke()
  g.direction = 'rtl'
  g.textAlign = 'right'
  const ng = g.createLinearGradient(w * 0.2, 0, w, 0)
  ng.addColorStop(0, CSS.coral2)
  ng.addColorStop(0.6, CSS.coral)
  g.fillStyle = ng
  g.font = `900 210px ${SANS}`
  g.fillText(ar(v) + st.suf, w - 70, 280)
  g.fillStyle = CSS.ink
  g.font = `700 46px ${SERIF}`
  g.fillText(st.label, w - 70, 415)
}

/* ---------- بطاقات الحروف العربية (مدار) ---------- */
const LETTERS: Array<[string, string]> = [
  ['ب ت ث', 'حروف متشابهة في أول الكلمة'],
  ['ة ه', 'الوقف والنهاية'],
  ['بَ بُ بِ', 'حركات تغيّر المعنى'],
  ['ال', 'اللام الشمسية والقمرية'],
  ['د ذ', 'مخرج واحد، نقاط مختلفة'],
  ['س ش', 'الصفير والهمس'],
  ['ض ظ', 'تفخيم وترقيق'],
  ['غ ع', 'من الحلق'],
  ['ق ف', 'اللام الشمسية بعد القاف'],
  ['ن م', 'غنة وقلقلة'],
  ['ر ز', 'تكرار ومرن'],
  ['ج ح خ', 'ثلاثة أخوات'],
]

export function letterCardTexture(i: number, maxAniso: number): CanvasTex {
  const [glyph, label] = LETTERS[i]
  return canvasTex(
    512,
    320,
    (g, w, h) => {
      paperBase(g, w, h)
      g.direction = 'rtl'
      g.textAlign = 'center'
      g.fillStyle = CSS.ink
      g.font = `700 108px ${SERIF}`
      g.fillText(glyph, w / 2, 175)
      g.fillStyle = CSS.coral
      rr(g, w / 2 - 60, 208, 120, 8, 4)
      g.fill()
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 30px ${SANS}`
      g.fillText(label, w / 2, 264)
    },
    maxAniso,
  )
}

/* ---------- شاشات المعرض (٦ مجموعات) ---------- */
function screenCanvas(aspect: number): [number, number] {
  const w = 560
  return [w, Math.round(w / aspect)]
}

export function planScreen(variant: 0 | 1, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.685)
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      tape(g, w / 2, 26, 220, -0.04)
      cardHead(g, w, 'خطة فردية — عبدالله الحربي', 'الصف الثالث · أ', 116)
      // شريط الهدف
      rr(g, 44, 208, w - 88, 190, 26)
      g.fillStyle = 'rgba(44,111,168,.08)'
      g.fill()
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.fillStyle = CSS.sea
      g.font = `500 26px ${SANS}`
      g.fillText('الهدف', w - 74, 252)
      g.fillStyle = CSS.ink
      g.font = `500 31px ${SANS}`
      const goal = 'أن يقرأ نصًا قصيرًا مناسبًا لمستواه بمعدل ٤٥ كلمة صحيحة في الدقيقة، بدقة ٩٥٪، خلال ستة أسابيع.'
      wrapRtl(g, goal, w - 74, 300, w - 148, 46, 4)
      // شريط تقدم
      const pct = Math.round(((VALUES[VALUES.length - 1] - 22) / (45 - 22)) * 100)
      rr(g, 44, 428, w - 88, 56, 14)
      g.fillStyle = 'rgba(55,68,43,.08)'
      g.fill()
      rr(g, w - 44 - ((w - 88) * pct) / 100, 428, ((w - 88) * pct) / 100, 56, 14)
      g.fillStyle = CSS.coral
      g.fill()
      g.fillStyle = CSS.paper
      g.font = `700 28px ${SANS}`
      g.fillText(`${ar(pct)}٪ من الطريق`, w - 74, 466)
      if (variant === 0) {
        // الاستراتيجيات
        g.fillStyle = CSS.ink
        g.font = `700 34px ${SERIF}`
        g.fillText('الاستراتيجيات', w - 44, 560)
        ;['قراءة متكررة لنص مألوف', 'متابعة المؤشر بالإصبع', 'قراءة زوجية مع المعلم'].forEach((s, i) => {
          g.strokeStyle = CSS.olive
          g.lineWidth = 4
          g.beginPath()
          g.moveTo(w - 84, 608 + i * 62)
          g.arc(w - 74, 608 + i * 62, 10, 0, 7)
          g.stroke()
          g.fillStyle = CSS.olive
          g.beginPath()
          g.moveTo(w - 78, 606 + i * 62)
          g.lineTo(w - 72, 613 + i * 62)
          g.lineTo(w - 64, 601 + i * 62)
          g.stroke()
          g.fillStyle = CSS.ink
          g.font = `400 30px ${SANS}`
          g.fillText(s, w - 100, 618 + i * 62)
        })
        chip(g, 'اهتمامه: الصقور والخرائط', w - 44, 820, 'rgba(168,176,141,.25)', CSS.ink2)
      } else {
        // التسهيلات وملاحظة المعلم
        g.fillStyle = CSS.ink
        g.font = `700 34px ${SERIF}`
        g.fillText('التسهيلات', w - 44, 560)
        ;['نص بخط كبير', 'بدون مؤقت مرئي', 'وقت إضافي ٥٠٪'].forEach((s, i) =>
          chip(g, s, i % 2 === 0 ? w - 44 : w / 2 - 10, 600 + Math.floor(i / 2) * 78, 'rgba(44,111,168,.10)', CSS.sea),
        )
        // ملاحظة مثبتة
        rr(g, 44, 780, w - 88, 116, 24)
        g.fillStyle = 'rgba(245,242,232,1)'
        g.fill()
        tape(g, 110, 780, 120, -0.14, 'rgba(168,176,141,.9)')
        g.fillStyle = CSS.ink
        g.font = `400 27px ${SANS}`
        g.fillText('«قرأ اليوم عن الصقر بثقة. ننتقل غدًا إلى الفكرة الرئيسة، لا إلى نص أطول.»', w - 74, 838)
        g.fillStyle = 'rgba(104,112,92,1)'
        g.font = `400 22px ${SANS}`
        g.fillText('ملاحظة المعلم · الأربعاء', w - 74, 876)
      }
    },
    maxAniso,
  )
}

export function probeScreen(variant: 0 | 1, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.685)
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      tape(g, w / 2, 26, 220, 0.05, 'rgba(44,111,168,.55)')
      if (variant === 0) {
        cardHead(g, w, `مسبار الأسبوع ${ar(8)}`, '٦٠ ثانية · النملة الصغيرة', 116)
        // الرقم الكبير
        g.direction = 'rtl'
        g.textAlign = 'left'
        g.font = `900 170px ${SANS}`
        g.fillStyle = CSS.sea
        g.fillText(ar(36), 56, 380)
        g.textAlign = 'right'
        g.fillStyle = 'rgba(104,112,92,1)'
        g.font = `400 30px ${SANS}`
        g.fillText('كلمة صحيحة في الدقيقة', w - 56, 380)
        spark(g, VALUES, 45, 56, 440, w - 112, 300)
        // تذييل الإحصاءات
        ;[`الدقة ${ar(96)}٪`, `الأخطاء ${ar(2)}`, 'الفرق +٣'].forEach((s, i) => {
          g.font = i === 2 ? `700 28px ${SANS}` : `400 28px ${SANS}`
          g.fillStyle = i === 2 ? CSS.coral : CSS.ink
          g.textAlign = 'right'
          const x = w - 56 - i * ((w - 112) / 3)
          g.fillText(s, x, 840)
        })
      } else {
        cardHead(g, w, 'نص المسبار', 'يظهر كاملًا داخل الشاشة', 116)
        // نص القراءة
        rr(g, 44, 210, w - 88, 470, 28)
        g.fillStyle = 'rgba(245,242,232,.9)'
        g.fill()
        g.strokeStyle = 'rgba(168,176,141,.5)'
        g.lineWidth = 3
        rr(g, 44, 210, w - 88, 470, 28)
        g.stroke()
        g.direction = 'rtl'
        g.textAlign = 'right'
        g.fillStyle = CSS.ink
        g.font = `500 33px ${SERIF}`
        wrapRtl(
          g,
          'خرجتِ النَّملةُ الصَّغيرةُ من بيتِها في صباحٍ مُشْمِسٍ. رَأتْ حَبَّةَ قَمْحٍ كبيرةً على الأرضِ، فحاولتْ أنْ تَحْمِلَها وَحْدَها. لكنَّ الحَبَّةَ كانتْ ثقيلةً.',
          w - 80,
          286,
          w - 160,
          56,
          8,
        )
        // مؤقت دائري
        g.strokeStyle = 'rgba(168,176,141,.5)'
        g.lineWidth = 14
        g.beginPath()
        g.arc(w / 2, 770, 62, 0, 7)
        g.stroke()
        g.strokeStyle = CSS.coral
        g.lineWidth = 14
        g.lineCap = 'round'
        g.beginPath()
        g.arc(w / 2, 770, 62, -Math.PI / 2, Math.PI * 1.2)
        g.stroke()
        g.fillStyle = CSS.ink
        g.font = `700 40px ${SANS}`
        g.textAlign = 'center'
        g.fillText(ar(60), w / 2, 784)
      }
    },
    maxAniso,
  )
}

export function activityScreen(variant: 0 | 1, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.685)
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      tape(g, w / 2, 26, 220, -0.03)
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.fillStyle = 'rgba(169,83,62,.95)'
      g.font = `700 28px ${SANS}`
      g.fillText(`نشاط من خمس دقائق · م ${ar('5/1')}`, w - 56, 108)
      g.fillStyle = CSS.ink
      g.font = `700 46px ${SERIF}`
      g.fillText(variant === 0 ? 'أي كلمة تنتهي بتاء مربوطة؟' : 'أي كلمة تُقرأ بالضمة؟', w - 56, 196)
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 26px ${SANS}`
      g.fillText('اختر إجابة واحدة — التغذية الراجعة فورية.', w - 56, 250)
      const opts = variant === 0 ? ['حَدِيقَة', 'وَجْه', 'بِنْت'] : ['كَتَبَ', 'كُتِبَ', 'كَتِبْ']
      const correct = variant === 0 ? 0 : 1
      opts.forEach((opt, i) => {
        const y = 320 + i * 150
        const sel = i === correct
        rr(g, 56, y, w - 112, 110, 26)
        g.fillStyle = sel ? 'rgba(220,128,101,.16)' : 'rgba(55,68,43,.05)'
        g.fill()
        g.strokeStyle = sel ? CSS.coral : 'rgba(168,176,141,.7)'
        g.lineWidth = sel ? 5 : 3
        rr(g, 56, y, w - 112, 110, 26)
        g.stroke()
        g.fillStyle = sel ? CSS.coral2 : 'rgba(104,112,92,.9)'
        g.font = `500 26px ${SANS}`
        g.textAlign = 'right'
        g.fillText(['أ', 'ب', 'ج'][i], w - 100, y + 70)
        g.fillStyle = CSS.ink
        g.font = `700 44px ${SERIF}`
        g.textAlign = 'center'
        g.fillText(opt, w / 2, y + 72)
        if (sel) {
          // علامة صح مرجانية
          g.strokeStyle = CSS.coral
          g.lineWidth = 9
          g.lineCap = 'round'
          g.beginPath()
          g.moveTo(100, y + 55)
          g.lineTo(114, y + 72)
          g.lineTo(146, y + 34)
          g.stroke()
        }
      })
      g.fillStyle = 'rgba(79,107,60,1)'
      g.font = `400 25px ${SANS}`
      g.textAlign = 'right'
      g.fillText(
        variant === 0
          ? 'التاء المربوطة تُلفظ هاءً عند الوقف، لكنها تُكتب ة.'
          : 'الضمة ترفع صوت الحرف: كُتِبَ بضم الكاف والتاء.',
        w - 56,
        820,
      )
    },
    maxAniso,
  )
}

export function reportScreen(week: number, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.8)
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      tape(g, w / 2, 24, 190, -0.05)
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.fillStyle = CSS.ink
      g.font = `700 40px ${SERIF}`
      g.fillText(`تقرير الأسبوع ${ar(week)}`, w - 48, 92)
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 23px ${SANS}`
      g.fillText('الطلاقة القرائية — عبدالله الحربي', w - 48, 138)
      // خط فاصل
      g.strokeStyle = 'rgba(168,176,141,.6)'
      g.lineWidth = 3
      g.beginPath()
      g.moveTo(48, 170)
      g.lineTo(w - 48, 170)
      g.stroke()
      // مخطط مصغر حتى الأسبوع الحالي
      spark(g, VALUES, 45, 48, 220, w - 96, 210, week)
      // صفوف الإحصاءات
      const v = VALUES[week - 1]
      const a = ACCS[week - 1]
      const rows: Array<[string, string]> = [
        ['كلمات صحيحة في الدقيقة', `${ar(v)} كلمة`],
        ['الدقة', `${ar(a)}٪`],
        ['الخطوة التالية', week < 8 ? 'قراءة زوجية ثم مسبار جديد' : 'الوصول للهدف قريب — ثبّت الخطة'],
      ]
      rows.forEach(([k, val], i) => {
        const y = 486 + i * 64
        g.fillStyle = 'rgba(104,112,92,1)'
        g.font = `400 26px ${SANS}`
        g.fillText(k, w - 48, y)
        g.fillStyle = i === 2 ? CSS.coral2 : CSS.ink
        g.font = `700 26px ${SANS}`
        g.textAlign = 'left'
        g.fillText(val, 48, y)
        g.textAlign = 'right'
      })
      // ختم
      g.save()
      g.translate(120, 620)
      g.rotate(-0.18)
      g.strokeStyle = CSS.coral2
      g.lineWidth = 5
      g.beginPath()
      g.arc(0, 0, 66, 0, 7)
      g.stroke()
      g.fillStyle = CSS.coral2
      g.font = `700 30px ${SANS}`
      g.textAlign = 'center'
      g.fillText('مدارج', 0, -4)
      g.font = `400 19px ${SANS}`
      g.fillText('تقرير للأسرة', 0, 30)
      g.restore()
    },
    maxAniso,
  )
}

export function standardsScreen(i: number, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.5625)
  const c = CRITERIA[[0, 4, 12, 22, 28, 34, 40, 46, 50].filter((x) => x < CRITERIA.length)[i] ?? i]
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      tape(g, w / 2, 26, 190, 0.06)
      g.direction = 'rtl'
      g.textAlign = 'right'
      // رأس العدّة
      g.fillStyle = CSS.coral
      g.font = `900 44px ${SANS}`
      g.fillText(`م ${ar(c.code)}`, w - 48, 108)
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 26px ${SANS}`
      g.fillText(`قراءة · المرحلة الابتدائية`, w - 48, 156)
      // نص المعيار
      g.fillStyle = CSS.ink
      g.font = `500 34px ${SERIF}`
      wrapRtl(g, c.text, w - 48, 250, w - 96, 56, 5)
      // المحك
      chip(g, `المحك ${c.mastery}`, w - 48, 560, 'rgba(220,128,101,.14)', CSS.coral2, 26)
      // مكونات العدّة
      g.strokeStyle = 'rgba(168,176,141,.6)'
      g.lineWidth = 3
      g.beginPath()
      g.moveTo(48, 660)
      g.lineTo(w - 48, 660)
      g.stroke()
      ;['عرض بمراحل الدرس', 'أنشطة بتغذية راجعة', 'تقويم بالمحك نفسه'].forEach((s, k) => {
        const y = 726 + k * 78
        g.fillStyle = CSS.olive
        g.strokeStyle = CSS.olive
        g.lineWidth = 4
        g.beginPath()
        g.arc(w - 76, y - 10, 9, 0, 7)
        g.stroke()
        g.beginPath()
        g.moveTo(w - 80, y - 12)
        g.lineTo(w - 74, y - 6)
        g.lineTo(w - 66, y - 15)
        g.stroke()
        g.fillStyle = CSS.ink
        g.font = `400 29px ${SANS}`
        g.fillText(s, w - 100, y)
      })
      g.fillStyle = 'rgba(104,112,92,.9)'
      g.font = `400 22px ${SANS}`
      g.fillText('المصدر: الاختبارات التشخيصية — وزارة التعليم', w - 48, 952)
    },
    maxAniso,
  )
}

export function fileScreen(tab: number, maxAniso: number): CanvasTex {
  const [w, h] = screenCanvas(0.8)
  const tabs = ['نظرة عامة', 'الخطة', 'التقدم', 'التقرير']
  return canvasTex(
    w,
    h,
    (g) => {
      paperBase(g, w, h)
      // رأس الملف
      g.beginPath()
      g.arc(w - 118, 118, 52, 0, 7)
      g.fillStyle = 'rgba(44,111,168,.16)'
      g.fill()
      g.fillStyle = CSS.sea
      g.font = `700 52px ${SERIF}`
      g.textAlign = 'center'
      g.fillText('ع', w - 118, 136)
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.fillStyle = CSS.ink
      g.font = `700 38px ${SERIF}`
      g.fillText('عبدالله الحربي', w - 190, 106)
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 24px ${SANS}`
      g.fillText('الصف الثالث — أ', w - 190, 148)
      // تبويبات
      tabs.forEach((t, i) => {
        const x = w - 48 - (i + 1) * ((w - 96) / 4) + 6
        const active = i === tab
        rr(g, x, 200, (w - 96) / 4 - 12, 62, 14)
        g.fillStyle = active ? CSS.ink : 'rgba(55,68,43,.06)'
        g.fill()
        g.fillStyle = active ? CSS.paper : 'rgba(104,112,92,1)'
        g.font = `500 24px ${SANS}`
        g.textAlign = 'center'
        g.fillText(t, x + ((w - 96) / 4 - 12) / 2, 238)
      })
      g.textAlign = 'right'
      if (tab === 0) {
        // نظرة عامة
        const boxes: Array<[string, string]> = [
          ['ما يعرفه عنه المعلم', board.note],
          ['اهتمامه', board.interest],
          ['التسهيلات', board.supports.join(' · ')],
        ]
        boxes.forEach(([k, v], i) => {
          const y = 306 + i * 128
          rr(g, 48, y, w - 96, 106, 22)
          g.fillStyle = 'rgba(245,242,232,.9)'
          g.fill()
          g.fillStyle = CSS.coral2
          g.font = `500 23px ${SANS}`
          g.fillText(k, w - 76, y + 36)
          g.fillStyle = CSS.ink
          g.font = `400 25px ${SANS}`
          wrapRtl(g, v, w - 76, y + 74, w - 152, 38, 2)
        })
      } else if (tab === 1) {
        g.fillStyle = CSS.ink
        g.font = `500 28px ${SANS}`
        wrapRtl(g, board.goals[0].statement, w - 48, 346, w - 96, 46, 4)
        ;['قراءة متكررة لنص مألوف', 'متابعة المؤشر بالإصبع', 'قراءة زوجية مع المعلم'].forEach((s, i) =>
          chip(g, s, i % 2 === 0 ? w - 48 : w / 2 - 14, 500 + Math.floor(i / 2) * 80, 'rgba(94,112,71,.12)', CSS.olive2, 24),
        )
      } else if (tab === 2) {
        spark(g, VALUES, 45, 48, 300, w - 96, 260)
        ;[`آخر قياس ${ar(36)} كلمة`, `الدقة ${ar(96)}٪`, '٨ أسابيع'].forEach((s, i) => {
          g.fillStyle = i === 0 ? CSS.sea : CSS.ink
          g.font = i === 0 ? `700 27px ${SANS}` : `400 27px ${SANS}`
          const x = w - 48 - i * ((w - 96) / 3)
          g.fillText(s, x, 640)
        })
      } else {
        g.fillStyle = CSS.ink
        g.font = `700 34px ${SERIF}`
        g.fillText('تقرير تقدم فردي', w - 48, 350)
        ;['الهدف: ٤٥ كلمة/دقيقة', 'الآن: ٣٦ كلمة/دقيقة', 'التالية: قراءة زوجية', 'جاهز للطباعة والمشاركة'].forEach((s, i) => {
          g.fillStyle = i === 3 ? CSS.coral2 : CSS.ink
          g.font = i === 3 ? `500 26px ${SANS}` : `400 26px ${SANS}`
          g.fillText(s, w - 48, 410 + i * 62)
        })
      }
    },
    maxAniso,
  )
}

/* ---------- علامة مدارج (مشهد الختام) ---------- */
export function wordmarkTexture(maxAniso: number): CanvasTex {
  return canvasTex(
    1000,
    300,
    (g, w, h) => {
      g.clearRect(0, 0, w, h)
      g.direction = 'rtl'
      g.textAlign = 'center'
      g.fillStyle = CSS.ink
      g.font = `700 210px ${SERIF}`
      g.fillText('مدارج', w / 2 - 26, 212)
      // نقطة مرجانية — نقطة نهاية الجملة
      g.fillStyle = CSS.coral
      g.beginPath()
      g.arc(w / 2 + 218, 196, 26, 0, 7)
      g.fill()
      g.fillStyle = 'rgba(55,68,43,.55)'
      g.font = `500 34px ${SANS}`
      g.letterSpacing = '14px'
      g.fillText('الخطة تبدأ من الطفل', w / 2, 272)
      g.letterSpacing = '0px'
    },
    maxAniso,
  )
}

/* ---------- لف نص عربي داخل عرض محدد ---------- */
function wrapRtl(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  g.textAlign = 'right'
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y + lines * lh)
      lines++
      line = word
      if (lines >= maxLines - 1) {
        g.fillText(test, x, y + lines * lh)
        return
      }
    } else line = test
  }
  g.fillText(line, x, y + lines * lh)
}
