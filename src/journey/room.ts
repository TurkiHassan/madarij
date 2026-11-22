/* ============================================================
   مدارج — مشهد الغرفة: مكتب معلمة في ليل هادئ
   (نقل بنية LOSHA: شخصية طينية، لابتوب شاشته بوابة،
   قمر وكواكب وغبار — بمساحة مدارج الليلية)
   ============================================================ */
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { CSS, C, HEX, MIX, SANS, SERIF, ar, clamp, smooth } from './palette'
import { canvasTex, glowSprite, moonTexture, rr, skyMaterial, starField, type CanvasTex } from './helpers'

const V3 = THREE.Vector3

export type RoomRefs = {
  room: THREE.Scene
  roomCam: THREE.PerspectiveCamera
  screenAnchor: THREE.Object3D
  screenMat: THREE.ShaderMaterial
  uiOverlay: THREE.Mesh
  screenLight: THREE.PointLight
  moon: THREE.Mesh
  moonGlow: THREE.Sprite
  ringPlanet: THREE.Group
  smallPlanet: THREE.Mesh
  roomStars: THREE.Group
  roomDust: THREE.Points
  update: (p: number) => void
}

/* واجهة اللابتوب: نافذة مدارج — لوحة الطلاب يمينًا، الخطة يسارًا،
   وسط النافذة شفاف: العالم الرقمي يظهر من خلاله */
function laptopUITexture(maxAniso: number): CanvasTex {
  return canvasTex(
    1248,
    780,
    (g, w, h) => {
      g.clearRect(0, 0, w, h)
      // شريط العنوان
      g.fillStyle = CSS.black
      g.fillRect(0, 0, w, 46)
      ;[CSS.coral, CSS.olive, CSS.sage].forEach((c, i) => {
        g.fillStyle = c
        g.beginPath()
        g.arc(w - 26 - i * 22, 23, 7, 0, 7)
        g.fill()
      })
      g.fillStyle = 'rgba(252,250,244,.85)'
      g.font = `700 20px ${SANS}`
      g.textAlign = 'center'
      g.fillText('مدارج — خطة الأسبوع', w / 2, 30)
      // لوحة الطلاب (يمين)
      g.fillStyle = CSS.deep
      g.fillRect(w - 230, 46, 230, h - 46)
      g.direction = 'rtl'
      g.textAlign = 'right'
      g.font = `700 17px ${SANS}`
      g.fillStyle = 'rgba(252,250,244,.85)'
      g.fillText('الطلاب', w - 24, 80)
      ;['عبدالله الحربي', 'نورة القحطاني', 'سارة العتيبي', 'ريان الشمري'].forEach((t, i) => {
        const y = 80 + (i + 1) * 44
        if (i === 0) {
          g.fillStyle = 'rgba(220,128,101,.22)'
          rr(g, w - 226, y - 4, 222, 40, 8)
          g.fill()
          g.fillStyle = '#F5F2E8'
        } else g.fillStyle = 'rgba(252,250,244,.5)'
        g.font = `400 16px ${SANS}`
        g.fillText(t, w - 24, y + 24)
      })
      // لوحة الخطة (يسار)
      g.fillStyle = CSS.deep
      g.fillRect(0, 46, 220, h - 46)
      g.direction = 'ltr'
      g.textAlign = 'left'
      const rows = ['الهدف', 'الاستراتيجيات', 'النشاط', 'المسبار', 'التقرير']
      rows.forEach((t, i) => {
        g.fillStyle = 'rgba(252,250,244,.45)'
        g.font = `400 15px ${SANS}`
        g.fillText(t, 22, 84 + i * 62)
        g.fillStyle = 'rgba(252,250,244,.1)'
        rr(g, 22, 96 + i * 62, 176, 6, 3)
        g.fill()
        g.fillStyle = i === 3 ? CSS.coral : CSS.sage
        rr(g, 22, 96 + i * 62, 40 + ((i * 53) % 130), 6, 3)
        g.fill()
      })
      // شريط زمني أسفل
      g.fillStyle = CSS.black
      g.fillRect(220, 600, w - 450, h - 600)
      for (let r = 0; r < 4; r++) {
        g.fillStyle = 'rgba(252,250,244,.06)'
        g.fillRect(240, 624 + r * 36, w - 490, 22)
        for (let k = 0; k < 4; k++) {
          const x = 270 + ((r * 97 + k * 173) % (w - 560))
          const y = 635 + r * 36
          g.fillStyle = CSS.coral
          g.save()
          g.translate(x, y)
          g.rotate(Math.PI / 4)
          g.fillRect(-6, -6, 12, 12)
          g.restore()
        }
      }
      g.fillStyle = '#F5F2E8'
      g.fillRect(560, 606, 2, h - 612)
      // إطار تحديد مرجاني حول لوحة الشفافة
      g.strokeStyle = CSS.coral
      g.lineWidth = 2
      g.setLineDash([10, 8])
      g.strokeRect(250, 76, w - 510, 494)
      g.setLineDash([])
      g.fillStyle = '#F5F2E8'
      for (const [x, y] of [
        [250, 76],
        [w - 260, 76],
        [250, 570],
        [w - 260, 570],
      ]) {
        g.fillRect(x - 7, y - 7, 14, 14)
      }
      // مؤشر
      g.save()
      g.translate(w * 0.58, h * 0.52)
      g.scale(1.3, 1.3)
      g.fillStyle = '#F5F2E8'
      g.strokeStyle = CSS.black
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
    },
    maxAniso,
  )
}

export function buildRoom(env: THREE.Texture, coarse: boolean, glowTex: THREE.Texture, dotTex: THREE.Texture, maxAniso: number): RoomRefs {
  const room = new THREE.Scene()
  const roomCam = new THREE.PerspectiveCamera(42, 1, 0.05, 400)
  room.environment = env
  room.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(220, 48, 24),
      skyMaterial(
        MIX(HEX.night, HEX.sage, 0.1),
        MIX(HEX.deep, HEX.night, 0.55),
        C(HEX.black),
        new V3(-0.35, 0.3, -1),
        C(HEX.sage),
        0.38,
      ),
    ),
  )
  room.fog = new THREE.Fog(C(HEX.deep), 14, 60)

  /* إضاءة الليل: قمر بارد + مصباح دافئ */
  room.add(new THREE.HemisphereLight(MIX(HEX.coral, HEX.white, 0.2), C(HEX.black), 0.34))
  const key = new THREE.DirectionalLight(MIX(HEX.white, HEX.coral, 0.12), 2.6)
  key.position.set(-3.5, 5.5, -4.5)
  key.castShadow = true
  key.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048)
  key.shadow.camera.left = -3
  key.shadow.camera.right = 3
  key.shadow.camera.top = 3
  key.shadow.camera.bottom = -3
  key.shadow.camera.near = 1
  key.shadow.camera.far = 16
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.02
  key.shadow.radius = 4
  room.add(key)
  const fill = new THREE.DirectionalLight(C(HEX.coral), 0.6)
  fill.position.set(4, 2.5, 5)
  room.add(fill)
  const rim = new THREE.DirectionalLight(MIX(HEX.coral, HEX.white, 0.4), 1.4)
  rim.position.set(3, 3, -5)
  room.add(rim)

  /* خامات مدارج */
  const mPlatform = new THREE.MeshStandardMaterial({ color: MIX(HEX.deep, HEX.night, 0.75), roughness: 0.42, metalness: 0.25 })
  const mDesk = new THREE.MeshStandardMaterial({ color: C(HEX.paper), roughness: 0.5, metalness: 0.05 })
  const mDark = new THREE.MeshStandardMaterial({ color: MIX(HEX.deep, HEX.night, 0.6), roughness: 0.4, metalness: 0.6 })
  const mLaptop = new THREE.MeshPhysicalMaterial({ color: MIX(HEX.ink2, HEX.night, 0.35), roughness: 0.32, metalness: 0.75, clearcoat: 0.4 })
  const mBody = new THREE.MeshStandardMaterial({ color: MIX(HEX.sage, HEX.olive, 0.45), roughness: 0.78 })
  const mSkin = new THREE.MeshStandardMaterial({ color: MIX(HEX.white, HEX.coral, 0.18), roughness: 0.7 })
  const mHair = new THREE.MeshStandardMaterial({ color: MIX(HEX.deep, HEX.night, 0.4), roughness: 0.65 })
  const mPants = new THREE.MeshStandardMaterial({ color: MIX(HEX.night, HEX.olive2, 0.2), roughness: 0.85 })
  const mShoe = new THREE.MeshStandardMaterial({ color: C(HEX.black), roughness: 0.5 })
  const mGlow = new THREE.MeshStandardMaterial({ color: C(HEX.white), emissive: MIX(HEX.white, HEX.coral, 0.25), emissiveIntensity: 2.2 })
  const mCoral = new THREE.MeshStandardMaterial({ color: C(HEX.coral), roughness: 0.45, metalness: 0.2 })

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = room, shadow = true) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.castShadow = shadow
    m.receiveShadow = true
    parent.add(m)
    return m
  }

  /* منصة دائرية بحافة مضيئة */
  add(new THREE.CylinderGeometry(3.2, 3.3, 0.5, 96), mPlatform, 0, -0.25, 0).castShadow = false
  add(new THREE.CylinderGeometry(3.6, 3.7, 0.12, 96), mDark, 0, -0.62, 0).castShadow = false
  const edge = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.012, 8, 160), new THREE.MeshBasicMaterial({ color: C(HEX.coral) }))
  edge.rotation.x = Math.PI / 2
  edge.position.y = 0.002
  room.add(edge)

  /* المكتب */
  add(new RoundedBoxGeometry(1.5, 0.05, 0.75, 4, 0.02), mDesk, 0, 0.75, 0)
  for (const [x, z] of [
    [-0.68, -0.3],
    [0.68, -0.3],
    [-0.68, 0.3],
    [0.68, 0.3],
  ])
    add(new THREE.CylinderGeometry(0.016, 0.016, 0.73, 12), mDark, x, 0.365, z)

  /* اللابتوب — شاشته بوابة إلى العالم الرقمي */
  const laptop = new THREE.Group()
  laptop.position.set(0, 0.775, -0.02)
  room.add(laptop)
  add(new RoundedBoxGeometry(0.34, 0.014, 0.235, 3, 0.006), mLaptop, 0, 0.007, 0, laptop)
  const keys = canvasTex(
    512,
    180,
    (g, w, h) => {
      g.fillStyle = CSS.deep
      g.fillRect(0, 0, w, h)
      const rows = [14, 14, 13, 12, 10]
      rows.forEach((n, r) => {
        const kw = (w - 20) / 14.2
        for (let i = 0; i < n; i++) {
          const x = 10 + i * kw + (14 - n) * kw * 0.5
          const y = 8 + r * 34
          g.fillStyle = 'rgba(94,112,71,.85)'
          rr(g, x, y, kw - 5, 28, 5)
          g.fill()
          g.fillStyle = 'rgba(220,128,101,.35)'
          rr(g, x + 4, y + 22, kw - 13, 2, 1)
          g.fill()
        }
      })
    },
    maxAniso,
  )
  const kb = new THREE.Mesh(
    new THREE.PlaneGeometry(0.29, 0.102),
    new THREE.MeshStandardMaterial({ map: keys, roughness: 0.7, emissive: C(HEX.coral), emissiveMap: keys, emissiveIntensity: 0.25 }),
  )
  kb.rotation.x = -Math.PI / 2
  kb.position.set(0, 0.0146, -0.035)
  laptop.add(kb)
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(0.11, 0.066),
    new THREE.MeshStandardMaterial({ color: MIX(HEX.olive, HEX.coral, 0.15), roughness: 0.35, metalness: 0.5 }),
  )
  pad.rotation.x = -Math.PI / 2
  pad.position.set(0, 0.0146, 0.068)
  laptop.add(pad)

  const hinge = new THREE.Group()
  hinge.position.set(0, 0.014, -0.1175)
  hinge.rotation.x = -0.27
  laptop.add(hinge)
  add(new RoundedBoxGeometry(0.34, 0.226, 0.008, 3, 0.004), mLaptop, 0, 0.113, -0.004, hinge)
  const bezel = new THREE.Mesh(new THREE.PlaneGeometry(0.332, 0.218), new THREE.MeshBasicMaterial({ color: C(HEX.black) }))
  bezel.position.set(0, 0.113, 0.0003)
  hinge.add(bezel)

  // الشاشة عيّنة مباشرة من العالم الرقمي (كاميرا افتراضية مطابقة)
  const screenMat = new THREE.ShaderMaterial({
    uniforms: { tPortal: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uGlare: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D tPortal; uniform vec2 uRes; uniform float uGlare; varying vec2 vUv;
      void main(){
        vec3 c = texture2D(tPortal, gl_FragCoord.xy / uRes).rgb;
        float glare = smoothstep(0.55, 1.25, vUv.x * 0.7 + vUv.y) * 0.05 * uGlare;
        gl_FragColor = vec4(c + glare, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.312, 0.195), screenMat)
  screen.position.set(0, 0.117, 0.0008)
  hinge.add(screen)
  const screenAnchor = new THREE.Object3D()
  screenAnchor.position.copy(screen.position)
  hinge.add(screenAnchor)

  const uiOverlay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.312, 0.195),
    new THREE.MeshBasicMaterial({ map: laptopUITexture(maxAniso), transparent: true, depthWrite: false }),
  )
  uiOverlay.position.set(0, 0.117, 0.0012)
  hinge.add(uiOverlay)

  const screenLight = new THREE.PointLight(MIX(HEX.white, HEX.coral, 0.45), 1.6, 2.4, 2)
  room.add(screenLight)

  /* الكرسي */
  add(new RoundedBoxGeometry(0.48, 0.06, 0.46, 3, 0.02), mDark, 0, 0.44, 0.76)
  const back = add(new RoundedBoxGeometry(0.46, 0.5, 0.05, 3, 0.02), mDark, 0, 0.78, 1.0)
  back.rotation.x = 0.12
  add(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 12), mDark, 0, 0.23, 0.76)
  add(new THREE.CylinderGeometry(0.26, 0.28, 0.035, 32), mDark, 0, 0.02, 0.76)

  /* المعلمة — شخصية طينية بلوح مدارج، تجلس وتكتب */
  const P = (x: number, y: number, z: number) => new V3(x, y, z)
  const limb = (a: THREE.Vector3, b: THREE.Vector3, r: number, mat: THREE.Material) => {
    const d = new V3().subVectors(b, a)
    const len = d.length()
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), mat)
    m.position.copy(a).add(b).multiplyScalar(0.5)
    m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize())
    m.castShadow = true
    m.receiveShadow = true
    room.add(m)
    return m
  }
  limb(P(-0.1, 0.5, 0.74), P(0.1, 0.5, 0.74), 0.1, mPants)
  limb(P(-0.1, 0.51, 0.72), P(-0.11, 0.53, 0.34), 0.068, mPants)
  limb(P(0.1, 0.51, 0.72), P(0.12, 0.53, 0.36), 0.068, mPants)
  limb(P(-0.11, 0.52, 0.33), P(-0.12, 0.08, 0.37), 0.052, mPants)
  limb(P(0.12, 0.52, 0.35), P(0.13, 0.08, 0.41), 0.052, mPants)
  add(new RoundedBoxGeometry(0.09, 0.06, 0.2, 2, 0.025), mShoe, -0.12, 0.03, 0.31)
  add(new RoundedBoxGeometry(0.09, 0.06, 0.2, 2, 0.025), mShoe, 0.13, 0.03, 0.35)
  const torso = limb(P(0, 0.56, 0.74), P(0, 0.9, 0.66), 0.14, mBody)
  torso.scale.x = 1.28
  limb(P(0, 0.98, 0.64), P(0, 1.06, 0.62), 0.042, mSkin)
  const head = add(new THREE.SphereGeometry(0.1, 32, 24), mSkin, 0, 1.15, 0.6)
  head.scale.set(0.92, 1.08, 1)
  const hair = add(new THREE.SphereGeometry(0.106, 32, 24), mHair, 0, 1.175, 0.625)
  hair.scale.set(0.96, 1.02, 1)
  // غرّة قصيرة مرجانية — لمسة هوية
  const fringe = add(new THREE.SphereGeometry(0.05, 16, 12), mCoral, 0.045, 1.22, 0.56)
  fringe.scale.set(1.1, 0.6, 1)
  fringe.castShadow = false
  limb(P(-0.19, 0.95, 0.66), P(-0.25, 0.83, 0.5), 0.045, mBody)
  limb(P(0.19, 0.95, 0.66), P(0.25, 0.83, 0.5), 0.045, mBody)
  limb(P(-0.25, 0.83, 0.5), P(-0.09, 0.826, 0.06), 0.036, mBody)
  limb(P(0.25, 0.83, 0.5), P(0.1, 0.826, 0.05), 0.036, mBody)
  add(new THREE.SphereGeometry(0.036, 16, 12), mSkin, -0.085, 0.818, 0.02).scale.set(1.1, 0.6, 1.4)
  add(new THREE.SphereGeometry(0.036, 16, 12), mSkin, 0.095, 0.818, 0.01).scale.set(1.1, 0.6, 1.4)

  /* أدوات المكتب: كوب مرجاني، أوراق الخطة، ملاحظة لاصقة، مصباح */
  const mug = add(new THREE.CylinderGeometry(0.036, 0.032, 0.09, 24), mCoral, 0.5, 0.82, 0.1)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 20), mCoral)
  handle.position.set(0.04, 0, 0)
  mug.add(handle)
  // أوراق الخطة (كريمي بدل اللوح البنفسجي المرجعي)
  const mSheet = new THREE.MeshStandardMaterial({ color: C(HEX.cream), roughness: 0.85 })
  add(new RoundedBoxGeometry(0.2, 0.025, 0.15, 2, 0.006), mSheet, -0.52, 0.788, 0.12).rotation.y = 0.2
  add(new RoundedBoxGeometry(0.19, 0.022, 0.14, 2, 0.006), mDark, -0.52, 0.81, 0.11).rotation.y = 0.1
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.26, 8), mDark, -0.6, 0.9, -0.22)
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.012, 24), mDark, -0.6, 0.781, -0.22)
  add(new THREE.SphereGeometry(0.065, 32, 16), mGlow, -0.6, 1.07, -0.22, room, false)
  const lampLight = new THREE.PointLight(MIX(HEX.white, HEX.coral, 0.3), 0.9, 2, 2)
  lampLight.position.set(-0.6, 1.07, -0.22)
  room.add(lampLight)
  const lampGlow = glowSprite(MIX(HEX.coral, HEX.white, 0.4), 0.55, 0.5, glowTex)
  lampGlow.position.set(-0.6, 1.07, -0.22)
  room.add(lampGlow)

  /* الفضاء: قمر ورقي، كوكب بحلقات زيتوني، غبار نجوم كريمي */
  const mt = moonTexture(maxAniso)
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(1.7, 64, 32),
    new THREE.MeshStandardMaterial({ map: mt, emissive: C(HEX.white), emissiveMap: mt, emissiveIntensity: 0.22, roughness: 1, fog: false }),
  )
  moon.position.set(-5.2, 4.2, -15)
  moon.rotation.y = 1.2
  room.add(moon)
  const moonGlow = glowSprite(C(HEX.coral), 13, 0.45, glowTex)
  moonGlow.material.fog = false
  room.add(moonGlow)

  const ringPlanet = new THREE.Group()
  ringPlanet.position.set(5.6, 3.1, -8.5)
  room.add(ringPlanet)
  const pl = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 48, 24),
    new THREE.MeshStandardMaterial({ color: MIX(HEX.olive, HEX.sage, 0.3), roughness: 0.75, emissive: C(HEX.night), emissiveIntensity: 0.4 }),
  )
  ringPlanet.add(pl)
  ;[
    [1.2, 1.42, 0.55],
    [1.48, 1.62, 0.32],
    [1.68, 1.86, 0.18],
  ].forEach(([a, b, o]) => {
    const r = new THREE.Mesh(
      new THREE.RingGeometry(a, b, 128),
      new THREE.MeshBasicMaterial({ color: MIX(HEX.cream, HEX.white, 0.25), transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false }),
    )
    r.rotation.x = -1.25
    ringPlanet.add(r)
  })
  ringPlanet.rotation.z = 0.32

  const smallPlanet = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 32, 16),
    new THREE.MeshStandardMaterial({ color: C(HEX.night), roughness: 0.6, emissive: C(HEX.coral), emissiveIntensity: 0.12 }),
  )
  smallPlanet.position.set(-5.8, 1.5, -3.5)
  room.add(smallPlanet)
  const tiny = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12), mDesk)
  tiny.position.set(2.6, 4.8, -9)
  room.add(tiny)

  const roomStars = new THREE.Group()
  const sf1 = starField(coarse ? 1400 : 2400, 90, 170, 0.75, { dotTex })
  sf1.material.fog = false
  const sf2 = starField(220, 90, 150, 1.8, { dotTex })
  sf2.material.fog = false
  roomStars.add(sf1, sf2)
  room.add(roomStars)
  const roomDust = starField(260, 0, 0, 0.035, { box: [-4, 4, 0.2, 4, -5, 4], opacity: 0.65, dotTex })
  room.add(roomDust)

  /* تحديث إطار بإطار — دالة نقية في p */
  const update = (p: number) => {
    moon.position.y = 4.2 + p * 2.2
    moon.rotation.y = 1.2 + p * 0.6
    moonGlow.position.copy(moon.position).add(new V3(0, 0, -0.6))
    ringPlanet.position.set(5.6 - p * 2, 3.1 + p * 1.2, -8.5)
    ringPlanet.rotation.y = p * 1.6
    smallPlanet.position.set(-5.8 + p * 1.5, 1.5 + p * 0.8, -3.5)
    roomStars.rotation.y = p * 0.35
    roomDust.rotation.y = p * 0.9
    roomDust.position.y = -p * 0.6
    const ui = 1 - smooth(0.18, 0.31, p)
    uiOverlay.material.transparent = true
    ;(uiOverlay.material as THREE.MeshBasicMaterial).opacity = ui
    uiOverlay.visible = ui > 0.003
    screenMat.uniforms.uGlare.value = 1 - smooth(0.24, 0.36, p)
    screenLight.position.copy(screenAnchor.localToWorld(new V3(0, 0, 0.25)))
    screenLight.intensity = 1.4 + smooth(0.1, 0.4, p) * 2.5
  }

  return { room, roomCam, screenAnchor, screenMat, uiOverlay, screenLight, moon, moonGlow, ringPlanet, smallPlanet, roomStars, roomDust, update }
}
