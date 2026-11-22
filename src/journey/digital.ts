/* ============================================================
   مدارج — العالم الرقمي داخل شاشة اللابتوب
   عالم ورقي فاتح (نقيض ليل الغرفة): نفق إطارات، بطاقات واجهة
   طائرة، غبار حبري، جوال يعرض مسبارات عبدالله، وكوكب ختامي
   ============================================================ */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { CSS, C, HEX, MIX, SANS, SERIF, ar, lerp, smooth } from './palette'
import { canvasTex, glowSprite, moonTexture, rr, skyMaterial, starField, type CanvasTex } from './helpers'
import { STUDENTS } from '../data/seed'

const V3 = THREE.Vector3

export type DigiRefs = {
  digi: THREE.Scene
  digiCam: THREE.PerspectiveCamera
  sky: THREE.Mesh
  far: THREE.Points
  dust: THREE.Points
  frames: THREE.Mesh[]
  cards: THREE.Mesh[]
  phone: THREE.Group
  phoneTex: CanvasTex
  finalPlanet: THREE.Group
  digiMoon: THREE.Mesh
  update: (p: number, post: number) => void
}

/* بطاقات واجهة مدارج الطائرة (نفس أنواع LOSHA الاثني عشر، بهوية الورق) */
function uiCardTexture(kind: string, maxAniso: number): CanvasTex {
  return canvasTex(
    512,
    320,
    (g, w, h) => {
      g.clearRect(0, 0, w, h)
      // ورقة بيضاء بحافة زيتونية
      rr(g, 10, 10, w - 20, h - 20, 38)
      g.fillStyle = 'rgba(252,250,244,.94)'
      g.fill()
      g.lineWidth = 3
      g.strokeStyle = 'rgba(168,176,141,.95)'
      g.stroke()
      const lg = g.createLinearGradient(0, 10, 0, 120)
      lg.addColorStop(0, 'rgba(220,128,101,.14)')
      lg.addColorStop(1, 'rgba(220,128,101,0)')
      rr(g, 12, 12, w - 24, 140, 36)
      g.fillStyle = lg
      g.fill()
      const txt = (t: string, x: number, y: number, size: number, color: string, weight: number | string = 700, align: CanvasTextAlign = 'right') => {
        g.font = `${weight} ${size}px ${/[؀-ۿ]/.test(t) ? SANS : SANS}`
        g.fillStyle = color
        g.textAlign = align
        g.direction = /[؀-ۿ]/.test(t) ? 'rtl' : 'ltr'
        g.fillText(t, x, y)
      }
      const W = '#FCFAF4'
      const coral = CSS.coral
      const dim = 'rgba(104,112,92,.9)'
      const cursor = (x: number, y: number, s: number) => {
        g.save()
        g.translate(x, y)
        g.scale(s, s)
        g.fillStyle = W
        g.strokeStyle = CSS.ink
        g.lineWidth = 2
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(0, 30)
        g.lineTo(8, 23)
        g.lineTo(14, 35)
        g.lineTo(19, 33)
        g.lineTo(13, 21)
        g.lineTo(23, 21)
        g.closePath()
        g.fill()
        g.stroke()
        g.restore()
      }
      switch (kind) {
        case 'search': {
          rr(g, 50, 122, 412, 76, 38)
          g.fillStyle = 'rgba(55,68,43,.06)'
          g.fill()
          g.strokeStyle = coral
          g.lineWidth = 2.5
          g.stroke()
          g.strokeStyle = CSS.ink
          g.lineWidth = 4
          g.beginPath()
          g.arc(410, 156, 14, 0, 7)
          g.stroke()
          g.beginPath()
          g.moveTo(420, 166)
          g.lineTo(432, 178)
          g.stroke()
          txt('ابحث في مكتبة المعايير…', 380, 170, 30, dim, 400)
          g.fillStyle = coral
          g.fillRect(150, 140, 3, 34)
          break
        }
        case 'cursor': {
          for (let r = 0; r < 3; r++) {
            g.strokeStyle = `rgba(220,128,101,${0.8 - r * 0.25})`
            g.lineWidth = 3
            g.beginPath()
            g.arc(230, 150, 30 + r * 30, 0, 7)
            g.stroke()
          }
          g.fillStyle = coral
          g.beginPath()
          g.arc(230, 150, 14, 0, 7)
          g.fill()
          txt('ة / ه', 340, 165, 42, CSS.ink)
          cursor(236, 156, 2.3)
          break
        }
        case 'progress': {
          txt('جارٍ حفظ المسبار', 460, 110, 32, CSS.ink)
          txt(`${ar(72)}٪`, 52, 110, 32, CSS.coral2, 700, 'left')
          rr(g, 52, 160, 408, 24, 12)
          g.fillStyle = 'rgba(55,68,43,.1)'
          g.fill()
          rr(g, 52, 160, 294, 24, 12)
          g.fillStyle = coral
          g.fill()
          txt('probe_week8.csv', 52, 236, 22, dim, 400, 'left')
          break
        }
        case 'folder': {
          g.fillStyle = coral
          rr(g, 186, 82, 70, 30, 10)
          g.fill()
          rr(g, 186, 96, 140, 100, 14)
          g.fill()
          g.fillStyle = 'rgba(245,242,232,.6)'
          rr(g, 186, 118, 140, 78, 14)
          g.fill()
          txt('خطة سارة', 256, 250, 30, CSS.ink, 700, 'center')
          break
        }
        case 'notify': {
          g.fillStyle = coral
          g.beginPath()
          g.arc(410, 160, 42, 0, 7)
          g.fill()
          g.fillStyle = W
          rr(g, 396, 140, 28, 30, 12)
          g.fill()
          g.fillRect(390, 166, 40, 5)
          g.beginPath()
          g.arc(410, 178, 5, 0, 7)
          g.fill()
          g.fillStyle = CSS.ink
          g.beginPath()
          g.arc(440, 128, 9, 0, 7)
          g.fill()
          txt('هدف جديد في خطة نورة', 345, 152, 30, CSS.ink)
          txt('منذ دقيقة', 345, 194, 22, CSS.coral2, 400)
          break
        }
        case 'counter': {
          txt(`+${ar(44)}`, 256, 175, 104, CSS.ink, 900, 'center')
          txt('معيارًا من دليل الوزارة', 256, 236, 26, CSS.coral2, 500, 'center')
          break
        }
        case 'select': {
          g.strokeStyle = coral
          g.lineWidth = 3
          g.setLineDash([12, 9])
          g.strokeRect(120, 76, 272, 168)
          g.setLineDash([])
          g.fillStyle = W
          for (const [x, y] of [
            [120, 76],
            [392, 76],
            [120, 244],
            [392, 244],
          ])
            g.fillRect(x - 9, y - 9, 18, 18)
          txt('بَ بُ بِ', 256, 195, 84, CSS.ink, 700, 'center')
          cursor(372, 226, 1.6)
          break
        }
        case 'files': {
          ;[
            [150, coral],
            [200, 'rgba(168,176,141,.9)'],
            [250, CSS.ink2],
          ].forEach(([x, c], k) => {
            g.fillStyle = c as string
            rr(g, x as number, 70 + k * 8, 110, 150, 14)
            g.fill()
            g.fillStyle = 'rgba(55,68,43,.4)'
            for (let l = 0; l < 3; l++) {
              rr(g, (x as number) + 18, 120 + k * 8 + l * 24, 74 - l * 14, 8, 4)
              g.fill()
            }
          })
          txt('تقارير الأسرة', 256, 268, 26, dim, 400, 'center')
          break
        }
        case 'lines': {
          g.fillStyle = coral
          g.beginPath()
          g.arc(420, 104, 34, 0, 7)
          g.fill()
          ;[
            [360, 300],
            [360, 230],
            [460, 380],
            [460, 260],
          ].forEach(([x, ww], k) => {
            g.fillStyle = k % 2 ? 'rgba(55,68,43,.2)' : 'rgba(55,68,43,.6)'
            rr(g, x - ww, 86 + k * 28 + (k > 1 ? 60 : 0), ww, 14, 7)
            g.fill()
          })
          break
        }
        case 'toggle': {
          ;[
            ['إشعارات', true],
            ['مشاركة الأسرة', true],
            ['مؤقت مرئي', false],
          ].forEach(([t, on], k) => {
            const y = 82 + k * 72
            txt(t as string, 460, y + 14, 28, CSS.ink, 500)
            rr(g, 54, y - 12, 84, 42, 21)
            g.fillStyle = on ? coral : 'rgba(55,68,43,.12)'
            g.fill()
            g.fillStyle = W
            g.beginPath()
            g.arc(on ? 117 : 75, y + 9, 15, 0, 7)
            g.fill()
          })
          break
        }
      }
    },
    maxAniso,
  )
}

/* شاشة الجوال: ملف عبدالله يتقدم أسبوعًا بعد أسبوع مع التمرير */
const PROBES = STUDENTS[0].probes

export function buildDigital(env: THREE.Texture, coarse: boolean, glowTex: THREE.Texture, dotTex: THREE.Texture, maxAniso: number): DigiRefs {
  const digi = new THREE.Scene()
  const digiCam = new THREE.PerspectiveCamera(42, 1, 0.05, 700)
  digi.environment = env
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(400, 48, 24),
    skyMaterial(
      MIX(HEX.cream, HEX.white, 0.35),
      C(HEX.cream),
      MIX(HEX.cream3, HEX.sage, 0.3),
      new V3(0, 0.1, -1),
      C(HEX.coral),
      0.14,
    ),
  )
  let digiSky: THREE.Mesh
  digi.add((digiSky = sky))
  digi.fog = new THREE.FogExp2(C(HEX.cream2), 0.012)

  digi.add(new THREE.HemisphereLight(MIX(HEX.cream, HEX.white, 0.35), C(HEX.olive2), 0.8))
  const key = new THREE.DirectionalLight(C(HEX.white), 2.4)
  key.position.set(4, 6, 3)
  digi.add(key)
  const rim = new THREE.DirectionalLight(C(HEX.coral), 2.0)
  rim.position.set(-5, 2, -40)
  digi.add(rim)
  const front = new THREE.PointLight(MIX(HEX.coral, HEX.white, 0.5), 26, 30, 2)
  front.position.set(0, 2, -27)
  digi.add(front)

  /* نفق إطارات الشاشة — صدى شكل اللابتوب في العمق، بحبر زيتوني */
  const frameShape = (w: number, h: number, r: number, t: number) => {
    const rect = (sh: THREE.Shape | THREE.Path, W: number, H: number, R: number) => {
      sh.moveTo(-W / 2 + R, -H / 2)
      sh.lineTo(W / 2 - R, -H / 2)
      sh.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R)
      sh.lineTo(W / 2, H / 2 - R)
      sh.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2)
      sh.lineTo(-W / 2 + R, H / 2)
      sh.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R)
      sh.lineTo(-W / 2, -H / 2 + R)
      sh.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2)
    }
    const outer = new THREE.Shape()
    rect(outer, w, h, r)
    const hole = new THREE.Path()
    rect(hole, w - t * 2, h - t * 2, Math.max(0.001, r - t))
    outer.holes.push(hole)
    return new THREE.ShapeGeometry(outer, 12)
  }
  const frames: THREE.Mesh[] = []
  for (let i = 1; i <= 14; i++) {
    const s = 1.25 + i * 0.32
    const z = -2.2 * i - 1
    const m = new THREE.Mesh(
      frameShape(3.12 * s, 1.95 * s, 0.18 * s, 0.014 * s + 0.008),
      new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? MIX(HEX.coral, HEX.ink, 0.35) : C(HEX.ink2),
        transparent: true,
        opacity: 0.5 - i * 0.02,
        depthWrite: false,
        fog: false,
      }),
    )
    m.position.z = z
    m.userData.sign = i % 2 ? 1 : -1
    digi.add(m)
    frames.push(m)
  }
  const grid = new THREE.GridHelper(1000, 500, C(HEX.olive), C(HEX.sage))
  grid.position.set(30, -4.2, -230)
  const gm = grid.material as THREE.Material
  gm.transparent = true
  ;(gm as THREE.MeshBasicMaterial).opacity = 0.22
  gm.depthWrite = false
  digi.add(grid)

  const dust = starField(coarse ? 900 : 1600, 0, 0, 0.09, { box: [-16, 16, -7, 9, -95, -1.5], tone: 'light', opacity: 0.5, dotTex })
  digi.add(dust)
  const far = starField(1600, 150, 300, 2.4, { tone: 'light', opacity: 0.4, dotTex })
  far.material.fog = false
  digi.add(far)
  const worksDust = starField(coarse ? 700 : 1300, 0, 0, 0.1, { box: [20, 110, -8, 26, -480, -100], tone: 'light', opacity: 0.45, dotTex })
  digi.add(worksDust)

  /* بطاقات الواجهة الطائرة */
  const kinds = ['search', 'cursor', 'progress', 'folder', 'notify', 'counter', 'select', 'files', 'lines', 'toggle', 'search', 'notify']
  const cards: THREE.Mesh[] = []
  kinds.forEach((kind, i) => {
    const tex = uiCardTexture(kind, maxAniso)
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.0),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false }),
    )
    const side = i % 2 ? 1 : -1
    const z = -3.5 - i * 2.05
    mesh.userData = { x: side * (2.5 + (i * 37 % 16) / 10), y: ((i * 53 % 7) - 3) / 2, z, ry: -side * 0.45, i }
    mesh.position.set(mesh.userData.x, mesh.userData.y, z)
    digi.add(mesh)
    cards.push(mesh)
  })

  /* الجوال */
  const phone = new THREE.Group()
  phone.position.set(0, 0, -34)
  digi.add(phone)
  const W = 1.06
  const H = 2.18
  const R = 0.17
  const D = 0.07
  const shape = new THREE.Shape()
  shape.moveTo(-W / 2 + R, -H / 2)
  shape.lineTo(W / 2 - R, -H / 2)
  shape.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + R)
  shape.lineTo(W / 2, H / 2 - R)
  shape.quadraticCurveTo(W / 2, H / 2, W / 2 - R, H / 2)
  shape.lineTo(-W / 2 + R, H / 2)
  shape.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - R)
  shape.lineTo(-W / 2, -H / 2 + R)
  shape.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + R, -H / 2)
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022, bevelSegments: 5, curveSegments: 16 })
  bodyGeo.translate(0, 0, -D / 2)
  const body = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: MIX(HEX.ink2, HEX.night, 0.3), metalness: 0.9, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 }))
  phone.add(body)
  const glass = new THREE.Mesh(new THREE.ShapeGeometry(shape, 16), new THREE.MeshPhysicalMaterial({ color: C(HEX.black), roughness: 0.08, metalness: 0.2, clearcoat: 1 }))
  glass.position.z = D / 2 + 0.026
  phone.add(glass)
  const phoneTex = canvasTex(600, 1290, () => {}, maxAniso)
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.985, 2.12), new THREE.MeshBasicMaterial({ map: phoneTex, transparent: true }))
  scr.position.z = D / 2 + 0.028
  phone.add(scr)
  const bump = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.04, 3, 0.08), body.material)
  bump.position.set(0.24, 0.78, -D / 2 - 0.035)
  phone.add(bump)
  for (const [x, y] of [
    [0.15, 0.86],
    [0.33, 0.86],
    [0.15, 0.68],
  ]) {
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.03, 24), new THREE.MeshPhysicalMaterial({ color: C(HEX.black), roughness: 0.05, clearcoat: 1 }))
    lens.rotation.x = Math.PI / 2
    lens.position.set(x, y, -D / 2 - 0.06)
    phone.add(lens)
  }
  const phoneGlow = glowSprite(C(HEX.coral), 6.5, 0.22, glowTex)
  phoneGlow.position.z = -0.6
  phone.add(phoneGlow)

  /* الكوكب الختامي المرجاني + قمر ورقي بعيد */
  const finalPlanet = new THREE.Group()
  finalPlanet.position.set(0, 7.5, -96)
  digi.add(finalPlanet)
  const fp = new THREE.Mesh(
    new THREE.SphereGeometry(11, 64, 32),
    new THREE.MeshStandardMaterial({ color: C(HEX.coral), roughness: 0.85, emissive: C(HEX.night), emissiveIntensity: 0.5, fog: false }),
  )
  finalPlanet.add(fp)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(14, 19.5, 160),
    new THREE.MeshBasicMaterial({ color: MIX(HEX.cream, HEX.white, 0.3), transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, fog: false }),
  )
  ring.rotation.x = -1.32
  ring.rotation.y = 0.18
  finalPlanet.add(ring)
  const fg = glowSprite(C(HEX.coral), 60, 0.2, glowTex)
  fg.material.fog = false
  finalPlanet.add(fg)
  const dl = new THREE.DirectionalLight(MIX(HEX.white, HEX.coral, 0.2), 1.8)
  dl.position.set(30, 30, -60)
  dl.target = fp
  digi.add(dl)

  const digiMoon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 48, 24),
    new THREE.MeshStandardMaterial({ map: null, emissive: C(HEX.white), emissiveMap: null, emissiveIntensity: 0.05, roughness: 1, fog: false }),
  )
  const mt = moonTexture(maxAniso)
  digiMoon.material.map = mt
  digiMoon.material.emissiveMap = mt
  digiMoon.material.needsUpdate = true
  digiMoon.position.set(-24, 18, -110)
  digi.add(digiMoon)

  /* ---------- رسم شاشة الجوال: مسبارات عبدالله أسبوعًا بأسبوع ---------- */
  let lastPhoneScroll = -1
  function drawPhone(s: number) {
    if (Math.abs(s - lastPhoneScroll) < 0.0008) return
    lastPhoneScroll = s
    const { canvas: c, g } = phoneTex.userData
    const w = c.width
    const h = c.height
    g.clearRect(0, 0, w, h)
    g.save()
    rr(g, 0, 0, w, h, 72)
    g.clip()
    const bg = g.createLinearGradient(0, 0, w * 0.4, h)
    bg.addColorStop(0, CSS.cream)
    bg.addColorStop(0.55, CSS.cream2)
    bg.addColorStop(1, CSS.cream3)
    g.fillStyle = bg
    g.fillRect(0, 0, w, h)
    const glow = g.createRadialGradient(w * 0.2, 0, 0, w * 0.2, 0, 520)
    glow.addColorStop(0, 'rgba(220,128,101,.35)')
    glow.addColorStop(1, 'rgba(220,128,101,0)')
    g.fillStyle = glow
    g.fillRect(0, 0, w, h)

    const top = 260
    const cardH = 470
    const gap = 30
    const total = PROBES.length * (cardH + gap) - gap
    const visible = h - top - 60
    const off = Math.max(0, total - visible) * s
    g.save()
    g.beginPath()
    g.rect(0, top - 10, w, h - top - 30)
    g.clip()
    PROBES.forEach((pr, i) => {
      const y = top + i * (cardH + gap) - off
      if (y > h || y + cardH < 0) return
      const x = 36
      const cw = w - 72
      rr(g, x, y, cw, cardH, 34)
      g.fillStyle = 'rgba(252,250,244,.96)'
      g.fill()
      g.strokeStyle = 'rgba(168,176,141,.8)'
      g.lineWidth = 2
      g.stroke()
      // رأس البطاقة
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.fillStyle = CSS.coral2
      g.font = `700 26px ${SANS}`
      g.fillText(`مسبار الأسبوع ${ar(i + 1)}`, x + cw - 26, y + 56)
      g.fillStyle = 'rgba(104,112,92,.9)'
      g.font = `400 22px ${SANS}`
      g.fillText('الطلاقة القرائية', x + 26, y + 56)
      // الرقم
      g.font = `900 96px ${SANS}`
      g.fillStyle = CSS.ink
      g.fillText(ar(pr.value), x + cw - 30, y + 180)
      g.font = `400 24px ${SANS}`
      g.fillStyle = 'rgba(104,112,92,1)'
      g.fillText('كلمة صحيحة في الدقيقة', x + cw - 132, y + 180)
      // مصغر بياني حتى الأسبوع الحالي
      const vals = PROBES.slice(0, i + 1).map((p) => p.value)
      const maxV = 48
      const px = (k: number) => x + 30 + (k * (cw - 60)) / Math.max(1, vals.length - 1)
      const py = (v: number) => y + 300 - (v / maxV) * 130
      g.strokeStyle = CSS.sea
      g.lineWidth = 5
      g.lineJoin = 'round'
      g.lineCap = 'round'
      g.beginPath()
      vals.forEach((v, k) => (k ? g.lineTo(px(k), py(v)) : g.moveTo(px(k), py(v))))
      g.stroke()
      vals.forEach((v, k) => {
        g.beginPath()
        g.arc(px(k), py(v), k === vals.length - 1 ? 10 : 6, 0, 7)
        g.fillStyle = k === vals.length - 1 ? CSS.coral : CSS.paper
        g.fill()
        g.strokeStyle = CSS.sea
        g.lineWidth = 3.5
        g.stroke()
      })
      // شريط الهدف أسفل البطاقة
      const pct = Math.min(1, pr.value / 45)
      rr(g, x + 26, y + 340, cw - 52, 30, 15)
      g.fillStyle = 'rgba(55,68,43,.07)'
      g.fill()
      rr(g, x + cw - 26 - (cw - 52) * pct, y + 340, (cw - 52) * pct, 30, 15)
      g.fillStyle = CSS.coral
      g.fill()
      // تذييل
      g.fillStyle = CSS.sea
      g.font = `500 23px ${SANS}`
      g.textAlign = 'right'
      g.fillText(`الدقة ${ar(pr.accuracy)}٪`, x + cw - 26, y + 428)
      g.fillStyle = 'rgba(104,112,92,1)'
      g.font = `400 21px ${SANS}`
      g.fillText('الهدف ٤٥ كلمة', x + 26, y + 428)
    })
    g.restore()

    // رأس الملف فوق التغذية
    const hg = g.createLinearGradient(0, 0, 0, 300)
    hg.addColorStop(0, 'rgba(245,242,232,1)')
    hg.addColorStop(0.75, 'rgba(245,242,232,.92)')
    hg.addColorStop(1, 'rgba(245,242,232,0)')
    g.fillStyle = hg
    g.fillRect(0, 0, w, 300)
    g.fillStyle = CSS.black
    rr(g, w / 2 - 80, 22, 160, 44, 22)
    g.fill()
    g.fillStyle = '#FCFAF4'
    g.font = `700 24px ${SANS}`
    g.direction = 'ltr'
    g.textAlign = 'left'
    g.fillText('9:41', 48, 54)
    g.textAlign = 'right'
    g.fillRect(w - 86, 38, 38, 18)
    g.fillStyle = 'rgba(252,250,244,.5)'
    g.fillRect(w - 46, 42, 4, 10)
    // علامة مدارج
    g.direction = 'rtl'
    g.textAlign = 'center'
    g.fillStyle = CSS.ink
    g.font = `700 64px ${SERIF}`
    g.fillText('مدارج', w / 2, 140)
    g.fillStyle = CSS.coral
    g.beginPath()
    g.arc(w / 2 + 120, 126, 7, 0, 7)
    g.fill()
    g.fillStyle = 'rgba(104,112,92,1)'
    g.font = `400 26px ${SANS}`
    g.fillText('ملف عبدالله الحربي — الطلاقة القرائية', w / 2, 200)

    // شريط تمرير مرجاني + شريط القائمة
    const trackH = visible - 40
    const thumb = Math.max(60, (trackH * visible) / total)
    g.fillStyle = 'rgba(55,68,43,.12)'
    rr(g, w - 14, top, 4, trackH, 2)
    g.fill()
    g.fillStyle = CSS.coral
    rr(g, w - 14, top + (trackH - thumb) * s, 4, thumb, 2)
    g.fill()
    g.fillStyle = 'rgba(55,68,43,.55)'
    rr(g, w / 2 - 90, h - 30, 180, 8, 4)
    g.fill()
    g.restore()
    phoneTex.needsUpdate = true
  }
  drawPhone(0)

  /* تحديث إطار بإطار — دالة نقية في p وpost */
  const update = (p: number, post: number) => {
    frames.forEach((f, i) => {
      f.rotation.z = f.userData.sign * smooth(0.36, 0.7, p) * (0.18 + i * 0.02)
    })
    cards.forEach((c) => {
      const d = c.userData
      c.rotation.y = d.ry + Math.sin(p * 9 + d.i) * 0.18
      c.rotation.x = Math.sin(p * 7 + d.i * 2) * 0.08
      c.position.y = d.y + Math.sin(p * 8 + d.i * 1.3) * 0.3
    })
    dust.rotation.z = p * 0.5
    const appear = smooth(0.5, 0.78, p)
    const leave = smooth(0.84, 0.97, p)
    phone.position.set(lerp(1.4, 0, appear) + leave * 0.6, lerp(-1.4, 0, appear) - leave * 3.8, -34)
    phone.rotation.set(lerp(0.45, 0, appear) + leave * 0.55, lerp(-1.25, 0, appear) + leave * 0.7, lerp(0.3, 0, appear) - leave * 0.2)
    phone.scale.setScalar(lerp(0.32, 1, appear))
    phone.visible = p > 0.3 && p < 0.995
    drawPhone(smooth(0.68, 0.86, p))
    finalPlanet.rotation.y = p * 0.4 + post * 1.4
    const rise = smooth(0.8, 0.98, p)
    finalPlanet.position.y = lerp(-26, 7.5, rise)
    finalPlanet.visible = p > 0.7
  }

  return { digi, digiCam, sky: digiSky, far, dust, frames, cards, phone, phoneTex, finalPlanet, digiMoon, update }
}
