/// <reference types="vite/client" />
/* ============================================================
   مدارج — محرك الرحلة (نقل main.js المرجعي)
   مسار تمرير واحد مثبّت، خط زمني GSAP واحد ممسوح بالتمرير،
   شاشة اللابتوب بوابة (كاميرا افتراضية داخل عالم الورق)،
   براللاكس المؤشر، والتقاط النقر على الشاشات الطافية.
   ============================================================ */
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CSS, C, HEX, MIX, clamp, lerp, smooth, ar } from './palette'
import { canvasTex, dotTexture, glowTexture, makeEnvironment, type CanvasTex } from './helpers'
import { buildRoom, type RoomRefs } from './room'
import { buildDigital, type DigiRefs } from './digital'
import { createJourney, TL, type Journey } from './journey'
import { go } from '../router'

const V3 = THREE.Vector3
const PCROSS = 0.4 // لحظة عبور الكاميرا عبر شاشة اللابتوب
const K = 10 // العالم الرقمي أكبر بعشرة أضعاف من مساحة الشاشة

const $ = (id: string) => document.getElementById(id)!

/* مراحل السكة الجانبية */
const STAGES: Array<{ name: string; g: number }> = [
  { name: 'البداية', g: 0 },
  { name: 'الشاشة', g: TL.intro[1] * 0.3 },
  { name: 'الجوال', g: TL.intro[1] * 0.76 },
  { name: 'الفكرة', g: TL.hero[0] + 0.012 },
  { name: 'الدورة', g: TL.cycle[0] + 0.04 },
  { name: 'حروف العربية', g: TL.arabic[0] + 0.03 },
  { name: 'شاشات المنصة', g: TL.plan[0] + 0.03 },
  { name: 'النموذج', g: 1 },
]

export type EngineHandle = { destroy: () => void }

/** مقبض إلغاء: يضبطه React عند التفكيك المبكر فلا تُبنى نسخة محرك ميتة */
export type EngineCtl = { cancelled: boolean }

export async function initJourney(ctl: EngineCtl): Promise<EngineHandle> {
  const host = $('jr-gl-host')
  const root = document.querySelector('.jr')!
  const coarse = matchMedia('(pointer:coarse)').matches
  let disposed = false

  /* ---------- الخطوط قبل أي رسم ---------- */
  const timeout = new Promise<void>((r) => setTimeout(r, 3500))
  await Promise.race([
    Promise.all([
      document.fonts.load('700 40px "Thmanyah Serif Display"'),
      document.fonts.load('400 30px "Thmanyah Sans"'),
      document.fonts.load('500 30px "Thmanyah Sans"'),
      document.fonts.load('900 60px "Thmanyah Sans"'),
    ]),
    timeout,
  ])
  // تحققان: التفكيك أثناء انتظار الخطوط، أو مغادرة الصفحة قبل اكتمال التهيئة
  if (ctl.cancelled || !document.body.contains(host)) return { destroy: () => {} }

  /* ---------- المولّد — canvas يملكه المحرك فيُنشأ جديدًا لكل تهيئة ---------- */
  host.textContent = ''
  const canvas = document.createElement('canvas')
  canvas.id = 'jr-gl'
  canvas.setAttribute(
    'aria-label',
    'رحلة بصرية ثلاثية الأبعاد يتحكم بها التمرير: من مكتب المعلمة إلى عالم مدارج الورقي',
  )
  host.appendChild(canvas)
  let renderer: THREE.WebGLRenderer
  try {
    // في التطوير فقط: يسمح بقراءة بكسلات الكانفس للفحص البصري الآلي
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: import.meta.env.DEV })
  } catch {
    document.documentElement.classList.add('no-gl')
    $('jr-loader').classList.add('done')
    return { destroy: () => {} }
  }
  const stageEl = $('jr-stage')
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 1.75))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.98
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const maxAniso = renderer.capabilities.getMaxAnisotropy()

  /* ---------- أدوات مرتبطة بالمولّد ---------- */
  const tex = (w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void): CanvasTex => canvasTex(w, h, draw, maxAniso)
  const glowTex = glowTexture(maxAniso)
  const dotTex = dotTexture(maxAniso)
  const glowSprite = (color: THREE.Color, scale: number, opacity: number) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }))
    s.scale.setScalar(scale)
    return s
  }
  let dirty = true
  const markDirty = () => {
    dirty = true
  }

  /* ---------- المشاهد ---------- */
  const env = makeEnvironment(renderer)
  const R: RoomRefs = buildRoom(env, coarse, glowTex, dotTex, maxAniso)
  const D: DigiRefs = buildDigital(env, coarse, glowTex, dotTex, maxAniso)
  const journey: Journey = createJourney({ digi: D.digi, maxAniso, canvasTex: tex, glowSprite, markDirty })

  /* ---------- سكة المراحل والعداد ---------- */
  const rail = document.querySelector('.jr .rail')!
  const railFill = $('railFill')
  const sceneNo = $('sceneNo')
  const scrollMax = () => Math.max(1, $('jr-track').offsetHeight - innerHeight)
  const railBtns = STAGES.map((st) => {
    const b = document.createElement('button')
    b.setAttribute('aria-label', st.name)
    b.style.top = st.g * 100 + '%'
    b.addEventListener('click', () => scrollTo({ top: st.g * scrollMax(), behavior: 'smooth' }))
    rail.appendChild(b)
    return b
  })
  $('sceneTotal').textContent = ar('08')

  /* ---------- مسارات الكاميرا ---------- */
  type Path = { ps: number[]; pos: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 }
  let roomPath: Path, digiPath: Path
  function curvePair(ps: number[], pos: THREE.Vector3[], tgt: THREE.Vector3[]): Path {
    return { ps, pos: new THREE.CatmullRomCurve3(pos, false, 'centripetal'), tgt: new THREE.CatmullRomCurve3(tgt, false, 'centripetal') }
  }
  function samplePath(path: Path, p: number, outPos: THREE.Vector3, outTgt: THREE.Vector3) {
    const ps = path.ps
    let i = 0
    while (i < ps.length - 2 && p > ps[i + 1]) i++
    const u = clamp((p - ps[i]) / (ps[i + 1] - ps[i]))
    const t = (i + u) / (ps.length - 1)
    path.pos.getPoint(t, outPos)
    path.tgt.getPoint(t, outTgt)
  }
  function buildPaths(aspect: number) {
    R.room.updateMatrixWorld(true)
    const A = (d: number, x = 0, y = 0) => R.screenAnchor.localToWorld(new V3(x, y, d))
    const portrait = aspect < 1
    roomPath = curvePair(
      [0, 0.12, 0.23, 0.32, PCROSS],
      [
        portrait ? new V3(4.2, 2.5, 5.8) : new V3(3.4, 2.1, 4.6),
        new V3(2.0, 1.55, 2.75),
        new V3(0.75, 1.24, 1.35),
        A(0.42),
        A(0.012),
      ],
      [new V3(-0.1, 0.62, 0.05), new V3(0, 0.8, 0), A(-0.08, 0, 0.01), A(-0.25), A(-0.45)],
    )
    const pd = portrait ? 2.85 : 3.6
    digiPath = curvePair(
      [PCROSS, 0.5, 0.6, 0.71, 0.8, 0.9, 1.0],
      [
        new V3(0, 0, 0.12),
        new V3(0.25, 0.08, -6),
        new V3(-0.7, 0.4, -15),
        new V3(0.25, 0.15, -24.5),
        new V3(0, 0, -34 + pd),
        new V3(0, 0.8, -34 + pd + 1.2),
        new V3(0, 1.4, -34 + pd + 2.8),
      ],
      [
        new V3(0, 0, -12),
        new V3(0, 0, -22),
        new V3(0, 0, -34),
        new V3(0, 0, -34.2),
        new V3(0, 0, -34.4),
        new V3(0, 3.5, -62),
        new V3(0, 6.5, -96),
      ],
    )
  }

  /* ---------- البراللاكس والحالة ---------- */
  const state = { G: 0, px: 0, py: 0, tpx: 0, tpy: 0 }
  const introEnd = { pos: new V3(), tgt: new V3() }
  let baseFov = 42
  let post = 0

  /* ---------- الإطار: كل شيء دالة نقية في G ---------- */
  const portalRT = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 })
  const _pos = new V3()
  const _tgt = new V3()
  const _q = new THREE.Quaternion()
  const _m = new THREE.Matrix4()
  const _right = new V3()
  const _up = new V3()

  function applyParallax(cam: THREE.PerspectiveCamera, pos: THREE.Vector3, tgt: THREE.Vector3, scale: number, strength: number) {
    cam.position.copy(pos)
    cam.lookAt(tgt)
    if (strength <= 0) return
    _right.setFromMatrixColumn(cam.matrix, 0)
    _up.setFromMatrixColumn(cam.matrix, 1)
    cam.position.addScaledVector(_right, state.px * 0.05 * scale * strength).addScaledVector(_up, -state.py * 0.035 * scale * strength)
    cam.lookAt(tgt)
  }

  function render() {
    const G = state.G
    const IE = TL.intro[1]
    const p = clamp(G / IE)
    post = clamp((G - IE) / (1 - IE))
    R.update(p)
    D.update(p, post)
    const par = coarse ? 0 : smooth(0.03, 0.1, Math.abs(p - PCROSS)) * (G > IE ? 0.6 : 1)
    if (p < PCROSS) {
      samplePath(roomPath, p, _pos, _tgt)
      applyParallax(R.roomCam, _pos, _tgt, 1, par)
      R.roomCam.near = p > 0.26 ? 0.004 : 0.05
      R.roomCam.fov = baseFov
      R.roomCam.updateProjectionMatrix()
      R.roomCam.updateMatrixWorld()
      // الكاميرا الافتراضية: كاميرا الغرفة معبّرة إلى فضاء الشاشة ثم مكبّرة إلى العالم
      R.screenAnchor.updateWorldMatrix(true, false)
      _m.copy(R.screenAnchor.matrixWorld).invert()
      D.digiCam.position.copy(R.roomCam.position).applyMatrix4(_m).multiplyScalar(K)
      R.screenAnchor.getWorldQuaternion(_q)
      _q.invert().multiply(R.roomCam.quaternion)
      D.digiCam.quaternion.copy(_q)
      D.digiCam.fov = baseFov
      D.digiCam.near = 0.05
      D.digiCam.updateProjectionMatrix()
      D.digiCam.updateMatrixWorld()
      journey.update(G, D.digiCam)
      D.sky.position.copy(D.digiCam.position)
      D.far.position.copy(D.digiCam.position)
      renderer.setRenderTarget(portalRT)
      renderer.render(D.digi, D.digiCam)
      renderer.setRenderTarget(null)
      renderer.render(R.room, R.roomCam)
    } else {
      if (G <= IE) samplePath(digiPath, p, _pos, _tgt)
      else journey.camera(G, introEnd, _pos, _tgt)
      applyParallax(D.digiCam, _pos, _tgt, 6, par)
      D.digiCam.fov = baseFov
      D.digiCam.near = 0.05
      D.digiCam.far = 900
      D.digiCam.updateProjectionMatrix()
      D.digiCam.updateMatrixWorld()
      journey.update(G, D.digiCam)
      D.sky.position.copy(D.digiCam.position)
      D.far.position.copy(D.digiCam.position)
      renderer.setRenderTarget(null)
      renderer.render(D.digi, D.digiCam)
    }
  }

  /* ---------- مزامنة الواجهة: السكة، العداد، طور الليل ---------- */
  let lastNight: boolean | null = null
  function updateUI() {
    const G = state.G
    railFill.style.transform = `scaleY(${G.toFixed(4)})`
    let n = 0
    STAGES.forEach((st, i) => {
      if (G >= st.g - 0.006) n = i
    })
    railBtns.forEach((b, i) => b.classList.toggle('on', i === n))
    sceneNo.textContent = ar(String(n + 1).padStart(2, '0'))
    const night = G < TL.intro[1] * PCROSS + 0.004
    if (night !== lastNight) {
      lastNight = night
      root.classList.toggle('night', night)
    }
  }

  /* ---------- المقاس ---------- */
  let lastW = 0
  let lastH = 0
  function resize(force: boolean) {
    const w = stageEl.clientWidth || innerWidth
    const h = stageEl.clientHeight || innerHeight
    if (!force && w === lastW && Math.abs(h - lastH) < 120 && coarse) return // اهتزاز شريط الجوال
    lastW = w
    lastH = h
    renderer.setSize(w, h, false)
    const aspect = w / h
    baseFov = aspect >= 1.25 ? 42 : Math.min(72, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(42) / 2) * 1.25 / aspect)))
    R.roomCam.aspect = D.digiCam.aspect = aspect
    const db = renderer.getDrawingBufferSize(new THREE.Vector2())
    portalRT.setSize(db.x, db.y)
    R.screenMat.uniforms.uRes.value.copy(db)
    R.screenMat.uniforms.tPortal.value = portalRT.texture
    buildPaths(aspect)
    samplePath(digiPath, 1, introEnd.pos, introEnd.tgt)
    journey.setPortrait(aspect < 0.9, aspect < 1.45)
    dirty = true
  }
  const onResize = () => resize(false)
  addEventListener('resize', onResize)

  /* ---------- النقر على شاشة طافية يفتح الشاشة الحقيقية ---------- */
  const raycaster = new THREE.Raycaster()
  const _ndc = new THREE.Vector2()
  function pickAt(e: PointerEvent) {
    if (state.G < TL.plan[0] || state.G > TL.file[1] + 0.01) return null
    const r = canvas.getBoundingClientRect()
    _ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(_ndc, D.digiCam)
    return journey.pick(raycaster)
  }
  const onPointerMove = (e: PointerEvent) => {
    state.tpx = (e.clientX / innerWidth) * 2 - 1
    state.tpy = (e.clientY / innerHeight) * 2 - 1
    if (coarse) return
    const hit = pickAt(e)
    canvas.style.cursor = hit ? 'pointer' : ''
  }
  if (!coarse) addEventListener('pointermove', onPointerMove, { passive: true })
  let downAt: { x: number; y: number; s: number } | null = null
  const onPointerDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY, s: scrollY }
  }
  const onPointerUp = (e: PointerEvent) => {
    if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8 || Math.abs(scrollY - downAt.s) > 8) return
    const hit = pickAt(e)
    if (hit && hit.userData.route) go(hit.userData.route)
  }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)

  /* ---------- حلقة الرسم: لا رسم إلا عند تغيّر ----------
     تُدار عبر gsap.ticker (لا rAF مباشر) لأن GSAP ينتقل تلقائيًا
     إلى setTimeout حين تُخنق rAF في النوافذ الخلفية، فلا يتجمد
     المشهد بعكس التمرير */
  let last = -1
  let rG = -1
  let rX = 9
  let rY = 9
  const tickFn = (timeSec: number) => {
    if (disposed) return
    const now = timeSec * 1000
    const rawDt = last < 0 ? 0.016 : (now - last) / 1000
    const dt = Math.min(0.05, rawDt)
    last = now
    const kp = 1 - Math.exp(-dt * 3)
    state.px += (state.tpx - state.px) * kp
    state.py += (state.tpy - state.py) * kp
    // متابعة ممسودة للهدف: التمرير هو المصدر، والحركة السينمائية تلينها
    const target = clamp(scrollY / scrollMax())
    if (Math.abs(target - state.G) > 1e-7) {
      state.G += (target - state.G) * (1 - Math.exp(-Math.min(0.4, rawDt) * 2.6))
      masterTl?.progress(state.G)
    }
    if (dirty || Math.abs(state.G - rG) > 1e-7 || Math.abs(state.px - rX) > 2e-4 || Math.abs(state.py - rY) > 2e-4) {
      render()
      updateUI()
      rG = state.G
      rX = state.px
      rY = state.py
      dirty = false
    }
  }

  /* ---------- خط GSAP الزمني: مسرح مثبت أقوده بنفسي ----------
     لا scrub داخلي (قابل للانحاش مع سباقات استرجاع التمرير)؛ بل هدف
     مباشر من التمرير + متابعة ممسودة في الحلقة = مصدر حقيقة واحد */
  let scrollTriggers: ScrollTrigger[] = []
  let masterTl: gsap.core.Timeline | null = null
  function buildTimeline() {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.config({ ignoreMobileResize: true })
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.pause(0)
    const st = ScrollTrigger.create({
      trigger: '#jr-track',
      start: 'top top',
      end: 'bottom bottom',
      pin: '#jr-stage',
      pinSpacing: false,
      invalidateOnRefresh: true,
    })
    scrollTriggers = [st]
    masterTl = tl
    // لكل طبقة دخول وخروج خاصان — المواضع بوحدات التقدم الكلي
    const inn = (sel: string, from: gsap.TweenVars, at: number, dur = 0.02, ease = 'power2.out') =>
      tl.fromTo(sel, { autoAlpha: 0, ...from }, { autoAlpha: 1, x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, scale: 1, filter: 'blur(0px)', duration: dur, ease }, at)
    const out = (sel: string, to: gsap.TweenVars, at: number, dur = 0.016, ease = 'power2.in') =>
      tl.to(sel, { autoAlpha: 0, ...to, duration: dur, ease }, at)

    tl.to('#hint', { autoAlpha: 0, duration: 0.012 }, 0.004)
    // الأقسام تظهر أولًا (الأبناء المكوَّنة تُكشف بعدها) — إصلاح رؤية البطل والختام
    inn('#ovHero', {}, TL.hero[0] + 0.002, 0.012)
    inn('#ovFinal', {}, TL.final[0] + 0.028, 0.012)

    // البطل — الكلمات تخرج من توهج الكوكب
    inn('#ovHero h1', { z: -500, scale: 0.8, filter: 'blur(14px)' }, TL.hero[0] + 0.004, 0.02)
    inn('#ovHero p', { y: 40, filter: 'blur(10px)' }, TL.hero[0] + 0.014, 0.018)
    out('#ovHero', { z: 380, filter: 'blur(10px)' }, TL.hero[1] - 0.014, 0.016)
    // الفكرة — البطاقة تتأرجح من الجانب
    inn('#ovAbout', { x: 160, z: -260, rotationY: -38, filter: 'blur(10px)' }, TL.about[0] + 0.014, 0.022)
    out('#ovAbout', { x: -120, z: -200, rotationY: 30 }, TL.about[1] - 0.012, 0.012)
    // الدورة — العنوان يهبط من الأعلى
    inn('#ovCycle', { y: -60, rotationX: 50 }, TL.cycle[0] + 0.022, 0.016)
    out('#ovCycle', { y: -50, rotationX: -40 }, TL.cycle[1] - 0.014, 0.012)
    // حروف العربية — العنوان يصعد
    inn('#ovArabic', { y: 50, scale: 0.9, filter: 'blur(8px)' }, TL.arabic[0] + 0.02, 0.016)
    out('#ovArabic', { y: -40, scale: 1.08, filter: 'blur(8px)' }, TL.arabic[1] - 0.014, 0.012)
    // عناوين الشاشات — كل مجموعة من اتجاه مختلف
    const dirs: Record<string, gsap.TweenVars> = {
      plan: { z: -400 },
      probe: { rotationY: 70 },
      activity: { y: 70 },
      report: { rotationX: -70 },
      standards: { x: -140 },
      file: { scale: 1.4, filter: 'blur(10px)' },
    }
    Object.entries(dirs).forEach(([k, from]) => {
      inn(`#ovG-${k}`, from, TL[k][0] + 0.014, 0.012)
      out(`#ovG-${k}`, { ...from, autoAlpha: 0 }, TL[k][1] - 0.012, 0.01)
    })
    // الختام — فتح النموذج
    inn('#ovFinal h2', { y: 50, filter: 'blur(12px)' }, TL.final[0] + 0.034, 0.016)
    inn('#jr-cta', { y: 30, scale: 0.9 }, TL.final[0] + 0.044, 0.014)
    inn('#jr-cta2', { y: 24, scale: 0.9 }, TL.final[0] + 0.052, 0.012)
    inn('#ovFinal small', { y: 20 }, TL.final[0] + 0.058, 0.012)
    tl.set('#ovFinal', { pointerEvents: 'auto' }, TL.final[0] + 0.045)
    st.refresh()
    // بدء صحيح من موضع التمرير الفعلي (شفاء ذاتي لأي استرجاع من المتصفح)
    state.G = clamp(scrollY / scrollMax())
    masterTl?.progress(state.G)
  }

  /* ---------- الإقلاع ---------- */
  resize(true)
  buildTimeline()
  renderer.compile(R.room, R.roomCam)
  renderer.compile(D.digi, D.digiCam)
  render()
  updateUI()
  $('jr-loader').classList.add('done')
  gsap.ticker.add(tickFn)
  // مراقب تجويع rAF: بعض البيئات لا تشغّل rAF رغم ظهور الصفحة —
  // ندفع الحلقة عبر setTimeout حتى يعود المؤقت الأصلي
  let lastTickerTime = gsap.ticker.time
  const watchdog = setInterval(() => {
    if (disposed) return
    if (gsap.ticker.time === lastTickerTime) tickFn(performance.now() / 1000)
    else lastTickerTime = gsap.ticker.time
  }, 240)

  // مقبض فحص بصري: ضع G ثم استدعِ render
  const debugHandle = { state, render, updateUI, TL, scrollMax, setG: (g: number) => scrollTo({ top: g * scrollMax(), behavior: 'instant' as ScrollBehavior }) }
  ;(window as unknown as Record<string, unknown>).__madarij = debugHandle

  /* ---------- التفكيك (تنظيف StrictMode والتنقل) ---------- */
  return {
    destroy() {
      disposed = true
      gsap.ticker.remove(tickFn)
      clearInterval(watchdog)
      removeEventListener('resize', onResize)
      if (!coarse) removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      // حصر القتل في مراجع هذا المحرك فقط — لا killTweensOf('*')
      masterTl?.kill()
      scrollTriggers.forEach((st) => st.kill())
      railBtns.forEach((b) => b.remove())
      canvas.remove()
      portalRT.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
      if ((window as unknown as Record<string, unknown>).__madarij === debugHandle)
        delete (window as unknown as Record<string, unknown>).__madarij
    },
  }
}
