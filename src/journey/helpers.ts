/* ============================================================
   مدارج — أدوات المشهد ثلاثي الأبعاد
   (نقل مباشر لبنية LOSHA المرجعية: سماء shader، غبار نجمي،
   هالات، قمر procedural، بيئة انعكاس PMREM)
   ============================================================ */
import * as THREE from 'three'
import { C, HEX, MIX, clamp, lerp, makeRnd } from './palette'

const rnd = makeRnd(11)

export type CanvasTex = THREE.CanvasTexture & {
  userData: { canvas: HTMLCanvasElement; g: CanvasRenderingContext2D }
}

export function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, maxAniso: number): CanvasTex {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  draw(g, w, h)
  const t = new THREE.CanvasTexture(c) as CanvasTex
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = maxAniso
  t.userData = { canvas: c, g }
  return t
}

export function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
}

/* سماء متدرجة متوهجة — نفس شيدر LOSHA */
export function skyMaterial(
  top: THREE.Color,
  mid: THREE.Color,
  bottom: THREE.Color,
  glowDir: THREE.Vector3,
  glowColor: THREE.Color,
  glowStrength: number,
) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: top },
      mid: { value: mid },
      bottom: { value: bottom },
      glowDir: { value: glowDir.clone().normalize() },
      glowColor: { value: glowColor },
      glowStrength: { value: glowStrength },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform vec3 top, mid, bottom, glowColor, glowDir; uniform float glowStrength; varying vec3 vDir;
      void main(){
        vec3 d = normalize(vDir); float h = d.y;
        vec3 c = h > 0.0 ? mix(mid, top, smoothstep(0.0, 0.85, h)) : mix(mid, bottom, smoothstep(0.0, 0.5, -h));
        float g = pow(max(dot(d, glowDir), 0.0), 9.0);
        c += glowColor * g * glowStrength;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  })
}

/* هالة دائرية ناعمة (تُستخدم كمصابيح وكواكب متوهجة) */
export function glowTexture(maxAniso: number) {
  return canvasTex(
    256,
    256,
    (g) => {
      const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128)
      gr.addColorStop(0, 'rgba(255,255,255,1)')
      gr.addColorStop(0.25, 'rgba(255,255,255,.45)')
      gr.addColorStop(0.6, 'rgba(255,255,255,.08)')
      gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr
      g.fillRect(0, 0, 256, 256)
    },
    maxAniso,
  )
}

export function dotTexture(maxAniso: number) {
  return canvasTex(
    64,
    64,
    (g) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
      gr.addColorStop(0, 'rgba(255,255,255,1)')
      gr.addColorStop(0.35, 'rgba(255,255,255,.8)')
      gr.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = gr
      g.fillRect(0, 0, 64, 64)
    },
    maxAniso,
  )
}

export function glowSprite(color: THREE.Color, scale: number, opacity: number, glowTex: THREE.Texture) {
  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTex,
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  s.scale.setScalar(scale)
  return s
}

/* حقل غبار/نجوم — tone:'dark' نجوم فاتحة على سماء الليل،
   tone:'light' حبر زيتوني على عالم الورق الفاتح */
export function starField(
  count: number,
  rMin: number,
  rMax: number,
  size: number,
  opts: {
    box?: [number, number, number, number, number, number]
    opacity?: number
    tone?: 'dark' | 'light'
    dotTex: THREE.Texture
  },
) {
  const pos = new Float32Array(count * 3)
  const colr = new Float32Array(count * 3)
  const tone = opts.tone ?? 'dark'
  const a = tone === 'dark' ? C(HEX.white) : C(HEX.olive)
  const b = tone === 'dark' ? C(HEX.coral) : C(HEX.coral2)
  const mixChance = tone === 'dark' ? 0.35 : 0.22
  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number
    if (opts.box) {
      const [x0, x1, y0, y1, z0, z1] = opts.box
      x = lerp(x0, x1, rnd())
      y = lerp(y0, y1, rnd())
      z = lerp(z0, z1, rnd())
    } else {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const r = lerp(rMin, rMax, rnd())
      const s = Math.sqrt(1 - u * u)
      x = r * s * Math.cos(th)
      y = r * u
      z = r * s * Math.sin(th)
    }
    pos.set([x, y, z], i * 3)
    const c = a
      .clone()
      .lerp(b, rnd() < mixChance ? 0.7 : 0.05)
      .multiplyScalar(lerp(0.55, 1.25, rnd()))
    colr.set([c.r, c.g, c.b], i * 3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colr, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size,
      map: opts.dotTex,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      sizeAttenuation: true,
      opacity: opts.opacity ?? 1,
      blending: tone === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
    }),
  )
}

/* قمر ورقي كريمي بحبر زيتوني — نفس تقنية LOSHA بمساحة مدارج */
export function moonTexture(maxAniso: number) {
  return canvasTex(
    1024,
    512,
    (g, w, h) => {
      g.fillStyle = '#F1EEE1'
      g.fillRect(0, 0, w, h)
      for (let i = 0; i < 26; i++) {
        const x = rnd() * w
        const y = h * 0.2 + rnd() * h * 0.6
        const r = 30 + rnd() * 110
        const gr = g.createRadialGradient(x, y, 0, x, y, r)
        gr.addColorStop(0, 'rgba(94,112,71,.20)')
        gr.addColorStop(1, 'rgba(94,112,71,0)')
        g.fillStyle = gr
        g.beginPath()
        g.arc(x, y, r, 0, 7)
        g.fill()
      }
      for (let i = 0; i < 160; i++) {
        const x = rnd() * w
        const y = rnd() * h
        const r = 2 + Math.pow(rnd(), 3) * 26
        g.fillStyle = 'rgba(61,76,49,.15)'
        g.beginPath()
        g.arc(x, y, r, 0, 7)
        g.fill()
        g.strokeStyle = 'rgba(255,255,255,.4)'
        g.lineWidth = Math.max(1, r * 0.18)
        g.beginPath()
        g.arc(x - r * 0.12, y - r * 0.12, r, 2.4, 5.2)
        g.stroke()
      }
    },
    maxAniso,
  )
}

/* بيئة انعكاس واحدة للغرفة والعالم — دافئة بلمسات مرجانية */
export function makeEnvironment(renderer: THREE.WebGLRenderer) {
  const pm = new THREE.PMREMGenerator(renderer)
  const s = new THREE.Scene()
  s.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(10, 32, 16),
      skyMaterial(
        MIX(HEX.cream, HEX.coral, 0.25),
        C(HEX.cream2),
        C(HEX.olive2),
        new THREE.Vector3(-0.4, 0.5, -1),
        C(HEX.coral),
        0.7,
      ),
    ),
  )
  const a = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 3),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(2.0, 2.0, 2.0) }),
  )
  a.position.set(0, 7, 1)
  a.lookAt(0, 0, 0)
  s.add(a)
  const b = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 5),
    new THREE.MeshBasicMaterial({ color: C(HEX.coral).multiplyScalar(1.4) }),
  )
  b.position.set(-7, 1.5, -3)
  b.lookAt(0, 0, 0)
  s.add(b)
  const t = pm.fromScene(s, 0.035).texture
  pm.dispose()
  return t
}

export { clamp }
