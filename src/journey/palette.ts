/* ============================================================
   مدارج — لوحة هوية الرحلة ثلاثية الأبعاد
   الأدوار توازي لوحة LOSHA المرجعية:
   lav→coral (اللون البطل)، mid→olive، plum→night، deep/black→ليل حبري
   ============================================================ */
import * as THREE from 'three'

export const HEX = {
  coral: 0xdc8065,
  coral2: 0xa9533e,
  olive: 0x5e7047,
  olive2: 0x3d4c31,
  sage: 0xa8b08d,
  ink: 0x37442b,
  ink2: 0x46523a,
  night: 0x222b18,
  deep: 0x1a2113,
  black: 0x121810,
  white: 0xffffff,
  cream: 0xf5f2e8,
  cream2: 0xede8da,
  cream3: 0xe3dccb,
  paper: 0xfcfaf4,
  sea: 0x2c6fa8,
}

export const CSS = {
  coral: '#DC8065',
  coral2: '#A9533E',
  olive: '#5E7047',
  olive2: '#3D4C31',
  sage: '#A8B08D',
  ink: '#37442B',
  ink2: '#46523A',
  night: '#222B18',
  deep: '#1A2113',
  black: '#121810',
  cream: '#F5F2E8',
  cream2: '#EDE8DA',
  cream3: '#E3DCCB',
  paper: '#FCFAF4',
  sea: '#2C6FA8',
}

export const SERIF = '"Thmanyah Serif Display", "El Messiri", serif'
export const SANS = '"Thmanyah Sans", "El Messiri", system-ui, sans-serif'

export const C = (h: number) => new THREE.Color(h)
export const MIX = (a: number, b: number, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), t)

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const eout = (t: number) => 1 - Math.pow(1 - t, 3)

/** أرقام هندية — بلا خلط مع الأرقام الغربية في أي مشهد */
export const ar = (n: number | string) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])

/** مولّد عشوائي مزروع ببذرة ثابتة — المشهد قابل لإعادة الإنتاج */
export function makeRnd(seed = 11) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}
