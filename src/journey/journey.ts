/* ============================================================
   مدارج — الرحلة بعد المقدمة
   نفس بنية journey.js المرجعية: كل مشهد دالة نقية في تقدم
   التمرير G، والكاميرا تنتقل بينها بمسارات قوسية.
   المشاهد: البطل ← الفكرة ← الدورة ← الأرقام ← حروف العربية
   ← شاشات المنصة بست إخراجات ← الختام
   ============================================================ */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { CSS, C, HEX, MIX, clamp, eio, eout, lerp, smooth, ar } from './palette'
import { drawStatPanel, fileScreen, letterCardTexture, planScreen, probeScreen, reportScreen, activityScreen, standardsScreen, STATS, tileFaceTexture, wordmarkTexture } from './screens'
import type { CanvasTex } from './helpers'

const V3 = THREE.Vector3

/* الخط الزمني — نفس نسب المرجع */
export const TL: Record<string, [number, number]> = {
  intro: [0, 0.22],
  hero: [0.22, 0.275],
  about: [0.275, 0.335],
  cycle: [0.335, 0.425],
  stats: [0.425, 0.49],
  arabic: [0.49, 0.57],
  plan: [0.57, 0.625],
  probe: [0.625, 0.68],
  activity: [0.68, 0.735],
  report: [0.735, 0.8],
  standards: [0.8, 0.88],
  file: [0.88, 0.935],
  final: [0.935, 1],
}
const ORDER = ['hero', 'about', 'cycle', 'stats', 'arabic', 'plan', 'probe', 'activity', 'report', 'standards', 'file', 'final']

/* مسارات شاشات النموذج — الضغط على البطاقة في 3D يفتح الشاشة الحقيقية */
export const ROUTES: Record<string, string> = {
  plan: '/app/student/abdullah/plan',
  probe: '/app/student/abdullah/progress',
  activity: '/app/activities/abdullah',
  report: '/app/student/abdullah/report',
  standards: '/app/skills',
  file: '/app/student/abdullah',
}

const CYCLE_WORDS = ['الهدف', 'الخطة', 'النشاط', 'المسبار', 'التقرير']
const ARABIC_PAIRS = 12

export type Journey = ReturnType<typeof createJourney>

export function createJourney(ctx: {
  digi: THREE.Scene
  maxAniso: number
  canvasTex: <T extends HTMLCanvasElement>(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) => CanvasTex
  glowSprite: (color: THREE.Color, scale: number, opacity: number) => THREE.Sprite
  markDirty: () => void
}) {
  const { digi, maxAniso, glowSprite, markDirty } = ctx
  const pickables: THREE.Mesh[] = []
  type Scene = {
    name: string
    a: number
    b: number
    group: THREE.Group
    anchor: THREE.Vector3
    flight: number
    arc: number
    cam?: (t: number, P: THREE.Vector3, T: THREE.Vector3) => void
    update?: (t: number, cam: THREE.PerspectiveCamera) => void
    relayout?: () => void
  }
  const scenes: Record<string, Scene> = {}
  let portrait = false
  let narrow = false

  const basic = (opts: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false, fog: false, ...opts })

  function roundedPlane(w: number, h: number, r: number) {
    const s = new THREE.Shape()
    const x = -w / 2
    const y = -h / 2
    s.moveTo(x + r, y)
    s.lineTo(x + w - r, y)
    s.quadraticCurveTo(x + w, y, x + w, y + r)
    s.lineTo(x + w, y + h - r)
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    s.lineTo(x + r, y + h)
    s.quadraticCurveTo(x, y + h, x, y + h - r)
    s.lineTo(x, y + r)
    s.quadraticCurveTo(x, y, x + r, y)
    const g = new THREE.ShapeGeometry(s, 10)
    const p = g.attributes.position as THREE.BufferAttribute
    const uv = g.attributes.uv as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x) / w, (p.getY(i) - y) / h)
    return g
  }

  /* بطاقة شاشة ورقية — بديل «الصورة المؤطرة» في المرجع:
     إطار حبري حول ورقة بيضاء، والنقر يفتح الشاشة الحقيقية */
  function paperCard(tex: CanvasTex, h: number, route: string) {
    const w = h * (tex.userData.canvas.width / tex.userData.canvas.height)
    const g = new THREE.Group()
    const fm = basic({ color: C(HEX.ink2), side: THREE.DoubleSide })
    const frame = new THREE.Mesh(roundedPlane(w + 0.14, h + 0.14, Math.min(w, h) * 0.07), fm)
    frame.position.z = -0.012
    const im = basic({ map: tex })
    const img = new THREE.Mesh(roundedPlane(w, h, Math.min(w, h) * 0.06), im)
    img.userData.route = route
    img.userData.kind = 'screen'
    const glow = glowSprite(C(HEX.coral), Math.max(w, h) * 1.9, 0.13)
    glow.position.z = -0.3
    glow.material.fog = false
    g.add(glow, frame, img)
    g.userData = { mats: [fm, im, glow.material], base: [1, 1, 0.13], img, w, h }
    pickables.push(img)
    return g
  }
  function fade(obj: THREE.Object3D & { userData: { mats: THREE.Material[]; base: number[] } }, o: number) {
    obj.userData.mats.forEach((m, i) => {
      ;(m as THREE.MeshBasicMaterial).opacity = o * (obj.userData.base ? obj.userData.base[i] : 1)
    })
    obj.visible = o > 0.004
  }
  function addScene(name: string, anchor: THREE.Vector3): Scene {
    const group = new THREE.Group()
    group.position.copy(anchor)
    digi.add(group)
    const sc: Scene = { name, a: TL[name][0], b: TL[name][1], group, anchor: anchor.clone(), flight: 0.3, arc: 3 }
    scenes[name] = sc
    return sc
  }
  const PLANET = new V3(0, 7.5, -96)

  /* ------------------------------------------------ البطل — نص فوق الكوكب المرجاني الصاعد */
  {
    const s = addScene('hero', PLANET.clone())
    s.flight = 0.0
    s.cam = (t, P, T) => {
      P.set(Math.sin(t * 0.6) * 2, 1.4 + t * 2.2, -27.6 - t * 5)
      T.set(0, 6.5 + t * 1.5, -96)
    }
    s.update = () => {}
  }

  /* ------------------------------------------------ الفكرة — علامة مدارج تطفو من العمق */
  {
    const s = addScene('about', new V3(0, 9.5, -62))
    const lock = new THREE.Group()
    s.group.add(lock)
    const lm = basic({ map: wordmarkTexture(maxAniso), depthWrite: false })
    const lw = 8.8
    const lh = lw * 300 / 1000
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), lm)
    lock.add(plane)
    const glow = glowSprite(C(HEX.coral), 16, 0.2)
    glow.material.fog = false
    glow.position.z = -1
    lock.add(glow)
    lock.userData = { mats: [lm, glow.material], base: [1, 0.2] }
    s.cam = (t, P, T) => {
      const a = lerp(0.32, -0.22, t)
      const R = lerp(17, 14.5, t) * (portrait ? 1.3 : narrow ? 1.12 : 1)
      P.set(s.anchor.x + Math.sin(a) * R, s.anchor.y + 0.8 - t * 0.6, s.anchor.z + Math.cos(a) * R)
      T.set(s.anchor.x + (narrow ? 0 : -1.6), s.anchor.y + (narrow ? 1.9 : 0), s.anchor.z)
    }
    s.update = (t) => {
      const e = eout(smooth(0, 0.42, t))
      const x = smooth(0.82, 1, t)
      lock.position.set((narrow ? 0 : -4.2) + (1 - e) * -3, (narrow ? 4.2 : 0) + x * 6, lerp(-34, 0, e))
      lock.rotation.set(0, (1 - e) * 1.3 + Math.sin(t * 3) * 0.08, 0)
      lock.scale.setScalar(lerp(0.4, 1, e) * (1 - x * 0.4) * (portrait ? 0.78 : narrow ? 0.85 : 1))
      fade(lock as never, e * (1 - x))
    }
  }

  /* ------------------------------------------------ دورة الأسبوع — خمس بلاطات تتجمع من سحابة */
  {
    const s = addScene('cycle', new V3(-30, 6, -80))
    const mid = 0.55
    s.group.rotation.y = mid
    const body = new THREE.MeshPhysicalMaterial({ color: C(HEX.paper), metalness: 0.15, roughness: 0.35, clearcoat: 0.8, transparent: true })
    const bodyGeo = new RoundedBoxGeometry(1.72, 1.72, 0.34, 4, 0.3)
    const faceGeo = roundedPlane(1.6, 1.6, 0.34)
    let seed = 7
    const r = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646 - 0.5
    }
    const tiles = CYCLE_WORDS.map((_, i) => {
      const g = new THREE.Group()
      const b = new THREE.Mesh(bodyGeo, body.clone())
      const fm = basic({ map: tileFaceTexture(i, maxAniso) })
      const f = new THREE.Mesh(faceGeo, fm)
      f.position.z = 0.172
      g.add(b, f)
      g.userData = { mats: [b.material as THREE.Material, fm as THREE.Material], base: [1, 1], from: new V3(r() * 22, r() * 14, -8 - (r() + 0.5) * 18), rot: new V3(r() * 5, r() * 5, r() * 3), out: new V3(r() * 2, r() * 2, 1).normalize(), to: new V3(), word: CYCLE_WORDS[i] }
      s.group.add(g)
      return g
    })
    const glow = glowSprite(C(HEX.coral), 22, 0.14)
    glow.material.fog = false
    glow.position.z = -3
    s.group.add(glow)
    const layout = () => {
      const rows = portrait ? [2, 3] : [3, 2]
      const sp = 2.25
      let k = 0
      rows.forEach((n, ri) => {
        for (let c = 0; c < n; c++, k++) {
          tiles[k].userData.to = new V3(((n - 1) / 2 - c) * sp, ((rows.length - 1) / 2 - ri) * sp - 0.6, 0)
        }
      })
    }
    s.relayout = layout
    s.cam = (t, P, T) => {
      const a = mid + lerp(0.42, -0.28, t)
      const R = lerp(17, 12.5, eout(t)) * (portrait ? 1.12 : 1)
      P.set(s.anchor.x + Math.sin(a) * R, s.anchor.y + lerp(2.6, 0.2, t), s.anchor.z + Math.cos(a) * R)
      T.set(s.anchor.x, s.anchor.y - 0.4, s.anchor.z)
    }
    s.update = (t) => {
      const x = smooth(0.84, 1, t)
      tiles.forEach((g, i) => {
        const d = g.userData
        const u = eout(smooth(0.04 + i * 0.03, 0.42 + i * 0.03, t))
        g.position.lerpVectors(d.from, d.to, u).addScaledVector(d.out, x * 14)
        g.rotation.set(d.rot.x * (1 - u) + Math.sin(t * 7 + i) * 0.06 * u, d.rot.y * (1 - u) + Math.sin(t * 5 + i * 2) * 0.12 * u + x * d.rot.y * 0.4, d.rot.z * (1 - u))
        g.scale.setScalar(lerp(0.5, 1, u) * (1 - x * 0.5))
        fade(g as never, smooth(0, 0.15, u + 0.001) * (1 - x))
      })
      ;(glow.material as THREE.SpriteMaterial).opacity = 0.14 * smooth(0.1, 0.4, t) * (1 - x)
    }
  }

  /* ------------------------------------------------ الأرقام — لوحات ورقية تعدّ تصاعديًا */
  {
    const s = addScene('stats', new V3(28, 5, -78))
    const mid = -0.55
    s.group.rotation.y = mid
    const bodyGeo = new RoundedBoxGeometry(4.2, 2.8, 0.16, 3, 0.07)
    const faceGeo = roundedPlane(4.08, 2.68, 0.3)
    const panels = STATS.map((st, i) => {
      const t = ctx.canvasTex(820, 540, () => {})
      const g = new THREE.Group()
      const b = new THREE.Mesh(bodyGeo, new THREE.MeshPhysicalMaterial({ color: MIX(HEX.cream, HEX.cream2, 0.5), metalness: 0.2, roughness: 0.25, clearcoat: 1, transparent: true }))
      const fm = basic({ map: t })
      const f = new THREE.Mesh(faceGeo, fm)
      f.position.z = 0.082
      g.add(b, f)
      g.userData = { mats: [b.material as THREE.Material, fm as THREE.Material], base: [1, 1], st, t, last: -1 }
      drawStatPanel(t.userData.g, 0, st)
      t.needsUpdate = true
      s.group.add(g)
      return g
    })
    const layout = () => {
      panels.forEach((g, i) => {
        g.userData.to = narrow
          ? new V3((i % 2 ? -1 : 1) * 2.3, i < 2 ? 1.6 : -1.6, 0)
          : new V3((1.5 - i) * 4.55, 0, -Math.abs(1.5 - i) * 1.1)
        g.userData.ry = narrow ? 0 : (1.5 - i) * 0.12
      })
    }
    s.relayout = layout
    s.cam = (t, P, T) => {
      const a = mid + lerp(-0.25, 0.18, t)
      const R = lerp(22, narrow ? 13.5 : 16, eout(t)) * (portrait ? 1.25 : 1)
      P.set(s.anchor.x + Math.sin(a) * R, s.anchor.y + lerp(-0.5, 1.3, t), s.anchor.z + Math.cos(a) * R)
      T.set(s.anchor.x, s.anchor.y, s.anchor.z)
    }
    s.update = (t) => {
      const x = smooth(0.85, 1, t)
      panels.forEach((g, i) => {
        const d = g.userData
        const u = eout(smooth(0.03 + i * 0.07, 0.4 + i * 0.07, t))
        g.position.set(d.to.x, d.to.y - (1 - u) * 12 + x * 9, d.to.z - (1 - u) * 4)
        g.rotation.set(-(1 - u) * 1.35 + x * 0.9, d.ry, (1 - u) * (i % 2 ? 0.3 : -0.3))
        fade(g as never, smooth(0, 0.25, u + 0.001) * (1 - x))
        const v = Math.round(d.st.to * eout(smooth(0.12 + i * 0.07, 0.62 + i * 0.07, t)))
        if (v !== d.last) {
          d.last = v
          drawStatPanel(d.t.userData.g, v, d.st)
          d.t.needsUpdate = true
          markDirty()
        }
      })
    }
  }

  /* ------------------------------------------------ حروف العربية تدور حول الكوكب */
  {
    const s = addScene('arabic', PLANET.clone())
    s.arc = 6
    const logos: THREE.Mesh[] = []
    for (let i = 0; i < ARABIC_PAIRS; i++) {
      const m = basic({ map: letterCardTexture(i, maxAniso), depthWrite: false })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.75), m)
      mesh.userData = { mats: [m as THREE.Material], base: [1], phase: (i / ARABIC_PAIRS) * Math.PI * 2 }
      s.group.add(mesh)
      logos.push(mesh)
    }
    const _c = new V3()
    const _d = new V3()
    s.cam = (t, P, T) => {
      const b = lerp(0.42, -0.42, t)
      const R = lerp(54, 42, eout(t)) * (portrait ? 1.15 : 1)
      P.set(Math.sin(b) * R, PLANET.y + lerp(19, 12, t), PLANET.z + Math.cos(b) * R)
      T.set(0, PLANET.y + (portrait ? 2 : 0.5), PLANET.z)
    }
    s.update = (t, cam) => {
      const e = eout(smooth(0, 0.35, t))
      const x = smooth(0.84, 1, t)
      const R = lerp(70, portrait ? 15 : 21.5, e) + x * 40
      const spin = t * Math.PI * 1.25
      _c.copy(cam.position).sub(PLANET).setY(0).normalize()
      logos.forEach((m) => {
        const th = m.userData.phase + spin
        m.position.set(Math.cos(th) * R, Math.sin(th * 1) * R * 0.18 + 2.2, Math.sin(th) * R)
        m.quaternion.copy(cam.quaternion)
        _d.copy(m.position).setY(0).normalize()
        const front = (_d.dot(_c) + 1) / 2
        m.scale.setScalar(portrait ? 0.82 : 1)
        fade(m as never, e * (1 - x) * lerp(0.28, 1, front))
      })
    }
  }

  /* ------------------------------------------------ شاشات المنصة — ست إخراجات مختلفة */
  const WX = 64
  const W = (k: number) => new V3(WX, 6, -140 - k * 46)

  // ١ · الخطة — ممر يطير بين بطاقتين
  {
    const s = addScene('plan', W(0))
    s.arc = 8
    s.flight = 0.34
    const items = ([0, 1] as const).map((v) => {
      const p = paperCard(planScreen(v, maxAniso), 5.4, ROUTES.plan)
      s.group.add(p)
      return p
    })
    const base = [new V3(-2.5, 0, 0), new V3(2.6, 0.5, -8)]
    const ry = [0.3, -0.3]
    s.cam = (t, P, T) => {
      const k = smooth(0.18, 0.78, t)
      P.set(s.anchor.x + lerp(0.6, -0.4, t), s.anchor.y + 0.6, s.anchor.z + lerp(19, 3.2, eio(t)) * (portrait ? 1.15 : 1))
      T.copy(s.anchor).add(new V3().lerpVectors(base[0], base[1], k))
    }
    s.update = (t) => {
      const x = smooth(0.86, 1, t)
      items.forEach((p, i) => {
        const u = eout(smooth(0.02 + i * 0.12, 0.3 + i * 0.12, t))
        p.position
          .copy(base[i])
          .multiply(portrait ? new V3(0.55, 1, 1) : new V3(1, 1, 1))
          .add(new V3((i ? 1 : -1) * x * 6, 0, -(1 - u) * 14))
        p.rotation.set(0, ry[i] * u + (1 - u) * (i ? -1 : 1) * 0.9, (1 - u) * 0.2)
        fade(p as never, u * (1 - x))
      })
    }
  }

  // ٢ · المسبار — بطاقتا قياس تُرفعان وتُنشران كمروحة
  {
    const s = addScene('probe', W(1))
    s.arc = 5
    const items = ([0, 1] as const).map((v) => {
      const p = paperCard(probeScreen(v, maxAniso), 5.2, ROUTES.probe)
      const pivot = new THREE.Group()
      p.position.y = 3.2
      pivot.add(p)
      pivot.userData = p.userData
      s.group.add(pivot)
      return pivot
    })
    s.cam = (t, P, T) => {
      const a = lerp(0.38, -0.32, t)
      const R = 13.5 * (portrait ? 1.3 : 1)
      P.set(s.anchor.x + Math.sin(a) * R, s.anchor.y + lerp(3.5, 1.2, t), s.anchor.z + Math.cos(a) * R)
      T.set(s.anchor.x, s.anchor.y + 0.4, s.anchor.z)
    }
    s.update = (t) => {
      const lift = eout(smooth(0.02, 0.36, t))
      const fan = eio(smooth(0.3, 0.62, t))
      const x = smooth(0.86, 1, t)
      items.forEach((pv, i) => {
        const sg = i ? -1 : 1
        pv.position.set(sg * fan * 1.6, -3.4 + (1 - lift) * -3, -i * 0.25)
        pv.rotation.set(-(1 - lift) * 1.35, sg * x * 1.6, sg * fan * 0.26)
        fade(pv as never, lift * (1 - x))
      })
    }
  }

  // ٣ · النشاط — لوحان يصعدان من الشبكة والكاميرا ترتفع
  {
    const s = addScene('activity', new V3(WX, -4.2, -140 - 2 * 46))
    s.arc = 6
    const items = ([0, 1] as const).map((v) => {
      const g = new THREE.Group()
      const p = paperCard(activityScreen(v, maxAniso), 7, ROUTES.activity)
      p.position.y = 3.2 + 3.5
      g.add(p)
      g.userData = { mats: [...p.userData.mats], base: [...(p.userData.base as number[])] }
      s.group.add(g)
      return g
    })
    const base = [new V3(-3.4, 0, 0), new V3(3.6, 0, -4)]
    s.cam = (t, P, T) => {
      P.set(s.anchor.x + lerp(-7, 5, t), s.anchor.y + lerp(5.4, 8, eio(t)), s.anchor.z + lerp(19, 17, t) * (portrait ? 1.35 : 1))
      T.set(s.anchor.x, s.anchor.y + 6.7, s.anchor.z - 2)
    }
    s.update = (t) => {
      const x = smooth(0.86, 1, t)
      items.forEach((g, i) => {
        const u = eout(smooth(0.04 + i * 0.14, 0.42 + i * 0.14, t))
        g.position.copy(base[i]).add(new V3(0, -(1 - u) * 12 - x * 12, 0))
        g.rotation.y = (i ? -0.22 : 0.22) + (1 - u) * 0.5
        fade(g as never, smooth(0, 0.3, u + 0.001) * (1 - x))
      })
    }
  }

  // ٤ · التقرير — دوّار يلف مع التمرير
  {
    const s = addScene('report', W(3))
    s.arc = 5
    const ring = new THREE.Group()
    s.group.add(ring)
    const items = [1, 2, 3, 4, 5, 6].map((wk) => {
      const p = paperCard(reportScreen(wk, maxAniso), 3.9, ROUTES.report)
      ring.add(p)
      return p
    })
    s.cam = (t, P, T) => {
      P.set(s.anchor.x + Math.sin(t * 0.5 - 0.25) * 2, s.anchor.y + lerp(3.4, 1.6, t), s.anchor.z + 13.5 * (portrait ? 1.08 : 1))
      T.set(s.anchor.x, s.anchor.y - 0.2, s.anchor.z)
    }
    s.update = (t) => {
      const e = eout(smooth(0, 0.3, t))
      const x = smooth(0.86, 1, t)
      const R = lerp(0.6, portrait ? 3.7 : 5.4, e) + x * 6
      ring.rotation.set(x * 0.6, -t * Math.PI * 1.7 + 0.3, 0)
      items.forEach((p, i) => {
        const a = (i / items.length) * Math.PI * 2
        p.position.set(Math.sin(a) * R, (1 - e) * (i % 2 ? 4 : -4), Math.cos(a) * R)
        p.rotation.set(0, a, 0)
        p.scale.setScalar(portrait ? 0.82 : 1)
        fade(p as never, e * (1 - x))
      })
    }
  }

  // ٥ · المعايير — تدفّق: كل عدّة تنزلق إلى المركز وتتقدم
  {
    const s = addScene('standards', W(4))
    s.arc = 6
    const items = Array.from({ length: 9 }, (_, i) => {
      const p = paperCard(standardsScreen(i, maxAniso), 5.6, ROUTES.standards)
      s.group.add(p)
      return p
    })
    s.cam = (t, P, T) => {
      P.set(s.anchor.x + Math.sin(t * 6) * 0.35, s.anchor.y + 0.6, s.anchor.z + 12.5 * (portrait ? 0.95 : 1))
      T.set(s.anchor.x, s.anchor.y, s.anchor.z)
    }
    s.update = (t) => {
      const e = eout(smooth(0, 0.18, t))
      const x = smooth(0.9, 1, t)
      const f = eio(smooth(0.1, 0.9, t)) * (items.length - 1)
      const sp = portrait ? 2.1 : 2.6
      items.forEach((p, i) => {
        const d = i - f
        const ad = Math.abs(d)
        const sd = Math.sign(d) * Math.min(1, ad)
        p.position.set(-d * sp - sd * (portrait ? 0.4 : 1.1), (1 - e) * 9 * (i % 2 ? 1 : -1), -Math.min(ad, 3) * 1.8 - x * 12)
        p.rotation.set(0, sd * 0.85, 0)
        p.scale.setScalar((portrait ? 0.95 : 1) * lerp(1.06, 0.82, Math.min(1, ad)))
        fade(p as never, e * (1 - x) * clamp(1.6 - ad * 0.32))
      })
    }
  }

  // ٦ · ملف الطالب — رزمة في العمق؛ كل تبويب يطير نحو الكاميرا
  {
    const s = addScene('file', W(5))
    s.arc = 5
    const items = [0, 1, 2, 3].map((tab) => {
      const p = paperCard(fileScreen(tab, maxAniso), 5.4, ROUTES.file)
      s.group.add(p)
      return p
    })
    s.cam = (t, P, T) => {
      const a = lerp(-0.18, 0.18, t)
      P.set(s.anchor.x + Math.sin(a) * 12, s.anchor.y + 0.8, s.anchor.z + Math.cos(a) * 12 * (portrait ? 1.15 : 1))
      T.set(s.anchor.x, s.anchor.y, s.anchor.z)
    }
    s.update = (t) => {
      const e = eout(smooth(0, 0.16, t))
      const x = smooth(0.92, 1, t)
      const flips = items.map((_, i) => (i < items.length - 1 ? eio(smooth(0.18 + i * 0.22, 0.36 + i * 0.22, t)) : 0))
      items.forEach((p, i) => {
        let before = 0
        for (let j = 0; j < i; j++) before += flips[j]
        const depth = (i - before) * 1.4
        const fl = flips[i]
        p.position.set((i % 2 ? 0.35 : -0.35) * (1 - fl) * Math.min(1, i - before), fl * 7, -depth + fl * 9 - (1 - e) * 10)
        p.rotation.set(-fl * 1.2, (i % 2 ? -0.06 : 0.06) * (i - before), fl * (i % 2 ? 0.4 : -0.4))
        p.scale.setScalar(portrait ? 0.85 : 1)
        p.renderOrder = items.length - i
        fade(p as never, e * (1 - fl) * (1 - x) * clamp(1.3 - (i - before) * 0.3))
      })
    }
  }

  /* ------------------------------------------------ الختام — العلامة وسط غبار الورق */
  {
    const s = addScene('final', new V3(WX, 9, -440))
    s.arc = 10
    s.flight = 0.4
    const wm = basic({ map: wordmarkTexture(maxAniso), depthWrite: false })
    const lw = 9.6
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(lw, lw * 300 / 1000), wm)
    logo.userData = { mats: [wm as THREE.Material], base: [1] }
    s.group.add(logo)
    const glow = glowSprite(C(HEX.coral), 30, 0.22)
    glow.material.fog = false
    glow.position.z = -4
    s.group.add(glow)
    const dustGeo = new THREE.BufferGeometry()
    const N = 500
    const pos = new Float32Array(N * 3)
    let seed = 23
    for (let i = 0; i < N; i++) {
      seed = (seed * 16807) % 2147483647
      const rr1 = (seed - 1) / 2147483646
      seed = (seed * 48271) % 2147483647
      const rr2 = (seed - 1) / 2147483646
      seed = (seed * 92821) % 2147483647
      const rr3 = (seed - 1) / 2147483646
      const r = 6 + rr1 * 26
      const a = rr2 * Math.PI * 2
      pos.set([Math.cos(a) * r, (rr3 - 0.5) * 22, Math.sin(a) * r - 6], i * 3)
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ size: 0.09, color: MIX(HEX.olive, HEX.coral, 0.4), transparent: true, opacity: 0.5, depthWrite: false, fog: false }),
    )
    s.group.add(dust)
    s.cam = (t, P, T) => {
      P.set(s.anchor.x, s.anchor.y + lerp(4, 0.4, eio(t)), s.anchor.z + lerp(34, 16.5, eio(smooth(0, 0.85, t))) * (portrait ? 1.45 : 1))
      T.set(s.anchor.x, s.anchor.y + lerp(0, 0.2, t), s.anchor.z)
    }
    s.update = (t) => {
      const e = eout(smooth(0.05, 0.6, t))
      logo.position.set(0, portrait ? 2.6 : 2.1, 1)
      logo.scale.setScalar(lerp(0.6, 1, e) * (portrait ? 0.62 : 1))
      fade(logo as never, smooth(0.25, 0.6, t))
      ;(glow.material as THREE.SpriteMaterial).opacity = 0.22 * e
      dust.rotation.y = t * 0.8
      ;(dust.material as THREE.PointsMaterial).opacity = 0.5 * e
    }
  }

  /* ------------------------------------------------ الواجهة العامة */
  const list = ORDER.map((n) => scenes[n])
  const _P0 = new V3()
  const _T0 = new V3()
  function setPortrait(v: boolean, n: boolean) {
    portrait = v
    narrow = v || n
    list.forEach((s) => s.relayout && s.relayout())
  }
  setPortrait(false, false)

  function camera(G: number, introEnd: { pos: THREE.Vector3; tgt: THREE.Vector3 }, outP: THREE.Vector3, outT: THREE.Vector3) {
    let i = list.findIndex((s) => G < s.b)
    if (i < 0) i = list.length - 1
    const s = list[i]
    const t = clamp((G - s.a) / (s.b - s.a))
    s.cam!(t, outP, outT)
    if (t < s.flight) {
      if (i === 0) {
        _P0.copy(introEnd.pos)
        _T0.copy(introEnd.tgt)
      } else list[i - 1].cam!(1, _P0, _T0)
      const k = eio(t / s.flight)
      outP.lerpVectors(_P0, outP, k)
      outT.lerpVectors(_T0, outT, k)
      outP.y += Math.sin(k * Math.PI) * s.arc
    }
  }
  function update(G: number, cam: THREE.PerspectiveCamera) {
    list.forEach((s) => {
      const vis = G > s.a - 0.012 && G < s.b + 0.03
      s.group.visible = vis
      if (vis) s.update!(clamp((G - s.a) / (s.b - s.a)), cam)
    })
  }
  function pick(raycaster: THREE.Raycaster) {
    const hits = raycaster.intersectObjects(
      pickables.filter((m) => m.visible && m.parent!.visible && (m.material as THREE.MeshBasicMaterial).opacity > 0.5 && isShown(m)),
      false,
    )
    return hits.length ? hits[0].object : null
  }
  function isShown(o: THREE.Object3D | null): boolean {
    while (o) {
      if (!o.visible) return false
      o = o.parent
    }
    return true
  }
  return { camera, update, setPortrait, pick, TL }
}
