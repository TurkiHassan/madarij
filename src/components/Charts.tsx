import React from 'react'
import { fmtDateShort } from '../lib/format'

const BLUE = '#1F4BFF'
const INK = '#171A1F'
const MUTED = '#5B665C'
const GRID = '#DCE3D9'
const PAPER = '#FFFFFF'
const AREA = '#EDF1F7'
const LIME = '#C9F227'

export type ChartPoint = { date: string; value: number }

export function LineChart({
  points,
  target,
  unit,
  height = 236,
  compact = false,
}: {
  points: ChartPoint[]
  target?: number
  unit?: string
  height?: number
  compact?: boolean
}) {
  const width = 640
  const padTop = 18
  const padBottom = 30
  const padLeft = compact ? 10 : 44
  const padRight = 14
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom

  if (!points.length) {
    return <div className="empty">لا توجد قياسات بعد.</div>
  }

  const values = points.map((p) => p.value)
  const maxVal = Math.max(...values, target ?? 0)
  const minVal = 0
  const yMax = Math.ceil((maxVal * 1.08) / 5) * 5

  const x = (i: number) => padLeft + (i / Math.max(1, points.length - 1)) * plotW
  const y = (v: number) => padTop + plotH - ((v - minVal) / (yMax - minVal)) * plotH

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const area = `${line} L ${x(points.length - 1)} ${padTop + plotH} L ${x(0)} ${padTop + plotH} Z`

  const ticks = [0, 0.5, 1].map((t) => Math.round((yMax - minVal) * t + minVal))

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`خط تقدم القياسات${unit ? ` بوحدة ${unit}` : ''}`}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y(t)}
              y2={y(t)}
              stroke={GRID}
              strokeWidth={1}
            />
            {!compact && (
              <text x={padLeft - 8} y={y(t) + 4} textAnchor="end" fontSize={13} fill={MUTED}>
                {t}
              </text>
            )}
          </g>
        ))}

        {target !== undefined && (
          <>
            <line
              x1={padLeft}
              x2={width - padRight}
              y1={y(target)}
              y2={y(target)}
              stroke={INK}
              strokeWidth={1.6}
              strokeDasharray="5 4"
            />
            {!compact && (
              <text
                x={width - padRight}
                y={y(target) - 6}
                textAnchor="end"
                fontSize={13}
                fill={INK}
              >
                الهدف {target}
              </text>
            )}
          </>
        )}

        <path d={area} fill={AREA} stroke="none" />
        <path d={line} fill="none" stroke={BLUE} strokeWidth={2.4} strokeLinejoin="round" />

        {points.map((p, i) => {
          const last = i === points.length - 1
          return (
            <g key={`${p.date}-${i}`}>
              <circle
                cx={x(i)}
                cy={y(p.value)}
                r={last ? 5 : 3.6}
                fill={last ? LIME : PAPER}
                stroke={BLUE}
                strokeWidth={2}
              />
              <title>{`${fmtDateShort(p.date)}: ${p.value}${unit ? ` ${unit}` : ''}`}</title>
            </g>
          )
        })}

        {points.map((p, i) => {
          const every = points.length > 6 ? 2 : 1
          const show = i === points.length - 1 || i % every === 0
          if (!show) return null
          return (
            <text
              key={`lab-${i}`}
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize={13}
              fill={MUTED}
            >
              {fmtDateShort(p.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

export function Sparkline({ values, width = 92, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <span className="delta flat">—</span>
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2
    const y = height - 3 - ((v - min) / span) * (height - 6)
    return [x, y] as const
  })
  const d = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.6} fill={BLUE} />
    </svg>
  )
}

export function Progress({ value }: { value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value)) * 100
  return (
    <div className="progress" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}
