import React from 'react'

export type Stop = { until: number; colors: string[] }
export type Row = { y: number; l: number; r: number }

let canvas: HTMLCanvasElement | null = null

/** Deterministic PRNG so the coastline is identical on every load. */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Scan a silhouette path and return one horizontal span per band. */
export function sampleRows(d: string, W: number, H: number, step: number): Row[] {
  if (typeof document === 'undefined') return []
  if (!canvas) canvas = document.createElement('canvas')
  const scale = 0.5
  const cw = Math.ceil(W * scale)
  const ch = Math.ceil(H * scale)
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.clearRect(0, 0, cw, ch)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.fillStyle = '#000'
  ctx.fill(new Path2D(d))
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  const data = ctx.getImageData(0, 0, cw, ch).data
  const rows: Row[] = []
  for (let y = 0; y < H; y += step) {
    const cy = Math.min(ch - 1, Math.floor((y + step * 0.5) * scale))
    let l = -1
    let r = -1
    for (let x = 0; x < cw; x++) {
      if (data[(cy * cw + x) * 4 + 3] > 120) {
        l = x
        break
      }
    }
    if (l < 0) continue
    for (let x = cw - 1; x >= 0; x--) {
      if (data[(cy * cw + x) * 4 + 3] > 120) {
        r = x
        break
      }
    }
    rows.push({ y, l: l / scale, r: (r + 1) / scale })
  }
  return rows
}

function pick(stops: Stop[], t: number, rng: () => number): string {
  let colors = stops[stops.length - 1].colors
  for (const s of stops) {
    if (t <= s.until) {
      colors = s.colors
      break
    }
  }
  return colors[Math.floor(rng() * colors.length)]
}

type MassProps = {
  d: string
  stops: Stop[]
  seed: number
  step?: number
  edge?: number
  segments?: number
  gap?: number
  opacity?: number
  className?: string
  W?: number
  H?: number
  /** When true rows are continuous (no torn gaps), used for water. */
  solid?: boolean
  /** Dark seam colour shown inside the torn gaps. */
  underlay?: string
}

/** A landmass built from stacked, torn paper-like horizontal bands. */
export function StripMass({
  d,
  stops,
  seed,
  step = 10,
  edge = 5,
  segments = 2,
  gap = 7,
  opacity = 1,
  className,
  W = 1600,
  H = 820,
  solid = false,
  underlay,
}: MassProps) {
  const rows = React.useMemo(() => sampleRows(d, W, H, step), [d, W, H, step])
  const bars = React.useMemo(() => {
    if (!rows.length) return []
    const rng = mulberry32(seed)
    const top = rows[0].y
    const bottom = rows[rows.length - 1].y || top + 1
    const out: React.ReactNode[] = []
    rows.forEach((row, ri) => {
      const t = (row.y - top) / (bottom - top)
      const baseColor = pick(stops, t, rng)
      const width = row.r - row.l
      if (width <= 3) return
      const jitterL = (rng() * 2 - 1) * edge
      const jitterR = (rng() * 2 - 1) * edge
      let x0 = row.l + jitterL
      let x1 = row.r + jitterR
      if (rng() < 0.07) x0 -= 8 + rng() * 16
      if (rng() < 0.07) x1 += 8 + rng() * 18
      if (underlay) {
        out.push(
          <rect
            key={`${ri}-u`}
            x={x0 - 2}
            y={row.y}
            width={Math.max(1, x1 - x0 + 4)}
            height={step + 0.2}
            fill={underlay}
          />,
        )
      }
      const cuts = solid ? 1 : 1 + Math.floor(rng() * segments)
      if (cuts === 1) {
        out.push(
          <rect
            key={`${ri}-0`}
            x={x0}
            y={row.y}
            width={Math.max(1, x1 - x0)}
            height={step + 0.2}
            fill={baseColor}
          />,
        )
        if (rng() < 0.22) {
          out.push(
            <rect
              key={`${ri}-s`}
              x={x0}
              y={row.y + step - 2.4}
              width={Math.max(1, x1 - x0)}
              height={1.6}
              fill="#12231F"
              opacity={0.1}
            />,
          )
        }
      } else {
        const parts: [number, number][] = []
        let cursor = x0
        const inner = x1 - x0
        for (let c = 0; c < cuts - 1; c++) {
          const at = cursor + inner * (0.28 + rng() * 0.44) * (1 - c * 0.3)
          const gapW = 2 + rng() * gap
          parts.push([cursor, Math.min(at, x1)])
          cursor = Math.min(at + gapW, x1)
          if (cursor >= x1) break
        }
        parts.push([cursor, x1])
        parts.forEach(([a, b], pi) => {
          if (b - a < 2) return
          const color = rng() < 0.55 ? pick(stops, t, rng) : baseColor
          out.push(
            <rect
              key={`${ri}-${pi}`}
              x={a}
              y={row.y}
              width={b - a}
              height={step + 0.2}
              fill={color}
            />,
          )
        })
      }
    })
    return out
  }, [rows, stops, seed, step, edge, segments, gap, solid])

  return (
    <g opacity={opacity} shapeRendering="crispEdges" className={className}>
      {bars}
    </g>
  )
}
