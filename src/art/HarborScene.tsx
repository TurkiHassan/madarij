import React from 'react'
import { StripMass, type Stop } from './strip'

const PAPER = '#F5F2E8'

const FAR: Stop[] = [
  { until: 0.4, colors: ['#C6CEC3', '#BBC4B8', '#D2D8CD'] },
  { until: 1, colors: ['#B3BDB1', '#AAB5A9', '#C2CABE'] },
]

const LEFT: Stop[] = [
  { until: 0.09, colors: ['#F0EAD9', '#E7DFCC', '#DDD3BE'] },
  { until: 0.2, colors: ['#CDC8B5', '#BEBDA9', '#D8D2BD'] },
  { until: 0.28, colors: ['#959F90', '#848F82', '#A5AE9D'] },
  { until: 0.54, colors: ['#2F564D', '#2A4C45', '#386159', '#254740'] },
  { until: 0.74, colors: ['#21433E', '#264A44', '#1C3C38', '#2B5048'] },
  { until: 0.87, colors: ['#1F577F', '#266691', '#1A4A6E'] },
  { until: 1, colors: ['#1C5080', '#205D94', '#17446C'] },
]

const RIGHT: Stop[] = [
  { until: 0.08, colors: ['#F0EAD9', '#E6DECB', '#DCD2BD'] },
  { until: 0.19, colors: ['#C8C6B4', '#B7B9A7', '#D4CFBB'] },
  { until: 0.42, colors: ['#7F8A73', '#707D65', '#8D977E', '#68765E'] },
  { until: 0.66, colors: ['#4D5F45', '#42543C', '#57694D', '#3C4D37'] },
  { until: 0.83, colors: ['#2E4C3E', '#294338', '#355448'] },
  { until: 1, colors: ['#1E527A', '#235F89', '#194A70'] },
]

const FOOT: Stop[] = [
  { until: 0.5, colors: ['#284337', '#223C32', '#2F4B3E'] },
  { until: 1, colors: ['#1B3B33', '#17342D', '#21443A'] },
]

const SAND: Stop[] = [
  { until: 1, colors: ['#D8CDB6', '#D0C4AC', '#E1D7C1', '#C8BCA4'] },
]

const STONE: Stop[] = [
  { until: 1, colors: ['#B7A98F', '#A99B82', '#C2B59C'] },
]

const SEA: Stop[] = [
  { until: 0.18, colors: ['#5C8FB6', '#6B9CC0', '#4F82A9', '#79A6C6'] },
  { until: 0.5, colors: ['#2C71A8', '#2F78B2', '#256599', '#357FB8'] },
  { until: 0.78, colors: ['#1D5385', '#215C90', '#194A77', '#266397'] },
  { until: 1, colors: ['#17466F', '#1B4E7A', '#123C61', '#1F5684'] },
]

const CLOUD: Stop[] = [
  { until: 1, colors: ['#E9E1CE', '#EFE8D8', '#E2D9C4'] },
]

const CORAL: Stop[] = [
  { until: 1, colors: ['#DD8268', '#D3785F', '#E79279', '#C96F58'] },
]

const ISLAND: Stop[] = [
  { until: 0.5, colors: ['#AEBDB6', '#A2B2AB', '#BAC7C0'] },
  { until: 1, colors: ['#93A7A1', '#879C96', '#A0B2AC'] },
]

const LEFT_D =
  'M-40 672 L-40 398 L30 368 L95 320 L150 298 L195 248 L250 203 L276 146 L286 126 L298 146 L322 178 L358 208 L400 242 L442 188 L490 248 L528 300 L572 338 L622 390 L682 432 L732 492 L778 562 L802 648 Z'

const RIGHT_D =
  'M998 692 L1010 588 L1058 520 L1108 468 L1158 408 L1214 358 L1268 298 L1318 242 L1358 178 L1400 138 L1444 218 L1480 260 L1520 234 L1558 298 L1600 328 L1620 390 L1620 700 Z'

function Cypress({ x, y, h = 70, s = 1 }: { x: number; y: number; h?: number; s?: number }) {
  const w = h * 0.19
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M0 ${-h} C ${w * 0.72} ${-h * 0.72} ${w} ${-h * 0.36} ${w * 0.68} 0 L ${-w * 0.68} 0 C ${-w} ${-h * 0.36} ${-w * 0.72} ${-h * 0.72} 0 ${-h} Z`}
        fill="#1E3A2E"
      />
      <path
        d={`M0 ${-h} C ${w * 0.3} ${-h * 0.7} ${w * 0.34} ${-h * 0.4} ${w * 0.2} 0 L ${-w * 0.2} 0 C ${-w * 0.1} ${-h * 0.4} 0 ${-h * 0.7} 0 ${-h}`}
        fill="#2C4B3A"
      />
      <rect x={-w * 0.58} y={-h * 0.32} width={w * 1.16} height={1.6} fill="#14291F" opacity={0.5} />
      <rect x={-w * 0.5} y={-h * 0.58} width={w * 1.0} height={1.3} fill="#14291F" opacity={0.4} />
      <rect x={-w * 0.4} y={-h * 0.78} width={w * 0.8} height={1.1} fill="#14291F" opacity={0.3} />
    </g>
  )
}

function Pine({ x, y, h = 46, s = 1 }: { x: number; y: number; h?: number; s?: number }) {
  const w = h * 1.05
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-2.2} y={-h * 0.55} width={4.4} height={h * 0.55} fill="#4B3B2A" />
      <path
        d={`M ${-w * 0.5} ${-h * 0.5} C ${-w * 0.5} ${-h * 0.8} ${-w * 0.2} ${-h} 0 ${-h} C ${w * 0.22} ${-h} ${w * 0.5} ${-h * 0.78} ${w * 0.5} ${-h * 0.5} C ${w * 0.3} ${-h * 0.38} ${-w * 0.3} ${-h * 0.38} ${-w * 0.5} ${-h * 0.5} Z`}
        fill="#4C6347"
      />
      <path
        d={`M ${-w * 0.36} ${-h * 0.64} C ${-w * 0.2} ${-h * 0.78} ${w * 0.16} ${-h * 0.8} ${w * 0.34} ${-h * 0.66} C ${w * 0.1} ${-h * 0.58} ${-w * 0.12} ${-h * 0.58} ${-w * 0.36} ${-h * 0.64} Z`}
        fill="#5D7554"
      />
      <rect x={-w * 0.4} y={-h * 0.52} width={w * 0.8} height={1.8} fill="#2F4230" opacity={0.5} />
    </g>
  )
}

type HouseProps = { x: number; base: number; w: number; h: number; wall: string; roof?: string }

function House({ x, base, w, h, wall, roof = '#A75D45' }: HouseProps) {
  return (
    <g transform={`translate(${x} ${base})`}>
      <path d={`M -6 0 L ${w + 6} 0 L ${w - 2} -10 L 3 -10 Z`} fill={roof} />
      <rect x={0} y={-h} width={w} height={h} fill={wall} />
      <rect x={w * 0.74} y={-h} width={w * 0.26} height={h} fill="#3A2A1E" opacity={0.14} />
      <rect x={0} y={-h} width={w} height={3} fill="#FFFFFF" opacity={0.16} />
      {[0, 1].map((c) =>
        [0, 1].map((r) => (
          <g key={`${c}-${r}`}>
            <rect x={w * (0.17 + c * 0.4)} y={-h + 16 + r * 30} width={11} height={14} fill="#2B3B33" />
            <rect x={w * (0.17 + c * 0.4)} y={-h + 16 + r * 30} width={11} height={2} fill="#F3EAD8" opacity={0.4} />
          </g>
        )),
      )}
      <rect x={w * 0.43} y={-20} width={13} height={20} fill="#3B3021" />
      <rect x={-6} y={0} width={w + 12} height={4} fill="#7E6B52" opacity={0.55} />
    </g>
  )
}

function FishingBoat({ x, y, flip = false, s = 1 }: { x: number; y: number; flip?: boolean; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M -52 0 L 52 0 L 40 22 L -38 22 Z" fill="#F2EBDC" />
      <path d="M -52 0 L 52 0 L 50 5 L -50 5 Z" fill="#DCD2BE" />
      <path d="M -44 8 L 44 8 L 42 13 L -42 13 Z" fill="#E98367" />
      <path d="M -38 17 L 38 17 L 33 22 L -33 22 Z" fill="#2E4A44" />
      <rect x="4" y="-26" width="24" height="26" fill="#E98367" />
      <rect x="1" y="-30" width="30" height="5" fill="#33452C" />
      <rect x="10" y="-22" width="8" height="8" fill="#F5F1E5" />
      <path d="M 0 -30 L 0 -62 L 26 -34 Z" fill="#F6F0E2" />
      <path d="M 0 -30 L 0 -58 L -20 -36 Z" fill="#E7DECB" />
      <rect x="-1.2" y="-64" width="2.4" height="64" fill="#5A4A36" />
    </g>
  )
}

function SailBoat({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -58 0 L 58 0 L 44 20 L -44 20 Z" fill="#F4EDDE" />
      <path d="M -50 6 L 50 6 L 48 11 L -48 11 Z" fill="#2C6FA8" />
      <rect x="-2" y="-120" width="4" height="120" fill="#5A4A36" />
      <path d="M 4 -116 L 4 -18 L 58 -22 Z" fill="#F7F2E4" />
      <path d="M -4 -104 L -4 -20 L -52 -24 Z" fill="#EDE4D0" />
      <path d="M 4 -116 L 4 -80 L 30 -24 Z" fill="#E98367" opacity="0.9" />
      <path d="M -58 0 L 58 0 L 56 -4 L -56 -4 Z" fill="#40533A" />
      <circle cx="0" cy="-4" r="2.4" fill="#3A4C33" />
    </g>
  )
}

function RowBoat({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M -28 0 L 28 0 L 21 12 L -21 12 Z" fill="#E9DFC9" />
      <path d="M -26 3 L 26 3 L 24 6 L -24 6 Z" fill="#C96F52" />
      <rect x="-16" y="-3" width="32" height="3" fill="#8B7656" />
    </g>
  )
}

function Lighthouse({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="-58" width="17" height="58" fill="#F0E8D6" />
      <rect x="0" y="-58" width="5" height="58" fill="#DCD2BC" />
      <rect x="0" y="-18" width="17" height="5" fill="#C96F52" />
      <rect x="-3" y="-66" width="23" height="8" fill="#C96F52" />
      <rect x="3" y="-61" width="11" height="6" fill="#2C3B33" />
      <rect x="6" y="-73" width="5" height="8" fill="#C96F52" />
      <rect x="0" y="0" width="17" height="4" fill="#6E5C44" opacity={0.6} />
    </g>
  )
}

function Gull({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      d={`M ${x - 9 * s} ${y} q ${4.5 * s} ${-4 * s} ${9 * s} 0 q ${4.5 * s} ${-4 * s} ${9 * s} 0`}
      fill="none"
      stroke="#4B5740"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  )
}

const HOUSES: HouseProps[] = [
  { x: 1128, base: 650, w: 54, h: 64, wall: '#E7D3B4' },
  { x: 1178, base: 652, w: 62, h: 82, wall: '#DFA07E', roof: '#8F4F3A' },
  { x: 1236, base: 648, w: 54, h: 70, wall: '#EFE3CC' },
  { x: 1286, base: 650, w: 66, h: 88, wall: '#D9B98E', roof: '#96543D' },
  { x: 1348, base: 646, w: 50, h: 68, wall: '#E9C9A6' },
  { x: 1394, base: 650, w: 62, h: 94, wall: '#E6A183', roof: '#8C4A36' },
  { x: 1452, base: 646, w: 54, h: 72, wall: '#F0E5CF' },
  { x: 1502, base: 650, w: 62, h: 86, wall: '#D9BC93', roof: '#9A5740' },
  { x: 1558, base: 646, w: 50, h: 64, wall: '#E8CFB0' },
]

export function HarborScene({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`harbor ${className}`}
      viewBox="0 96 1600 724"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="ميناء إيطالي صغير على سفح جبال: بيوت ملونة على رصيف حجري، وقوارب في مياه زرقاء، وأشجار السرو على المصاطب."
    >
      <defs>
        <clipPath id="clip-left">
          <path d={LEFT_D} />
        </clipPath>
        <clipPath id="clip-right">
          <path d={RIGHT_D} />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="1600" height="820" fill={PAPER} />

      {/* clouds */}

      {/* distant coast */}
      <StripMass
        d="M-20 566 L-20 452 L90 428 L180 400 L250 366 L320 396 L400 358 L470 402 L560 384 L650 412 L740 372 L820 414 L910 392 L1000 354 L1090 396 L1180 344 L1260 384 L1350 338 L1440 376 L1520 344 L1620 384 L1620 566 Z"
        stops={FAR}
        seed={31}
        underlay="#A6B2A7"
        step={10}
        edge={4}
        segments={2}
        gap={6}
        opacity={0.9}
      />

      {/* water */}
      <StripMass d="M0 556 L1600 556 L1600 820 L0 820 Z" stops={SEA} seed={77} step={9} edge={3} segments={1} solid />
      <g opacity={0.55}>
        <rect x="360" y="620" width="150" height="4" fill="#8FB6CE" />
        <rect x="660" y="648" width="230" height="4" fill="#7FA9C4" />
        <rect x="520" y="690" width="120" height="3" fill="#8FB6CE" />
        <rect x="820" y="708" width="190" height="3" fill="#6E9BBA" />
        <rect x="1200" y="748" width="150" height="4" fill="#6E9BBA" />
        <rect x="640" y="790" width="260" height="5" fill="#5C8CAF" />
      </g>

      {/* distant island */}
      <StripMass
        d="M806 562 L820 540 L846 526 L872 518 L900 524 L920 536 L946 544 L960 562 Z"
        stops={ISLAND}
        seed={321}
        step={7}
        edge={3}
        segments={2}
        gap={4}
        opacity={0.95}
      />
      <g opacity={0.9}>
        <rect x="884" y="498" width="7" height="30" fill="#728982" />
        <rect x="877" y="490" width="21" height="9" fill="#6C837C" />
        <path d="M 874 490 L 901 490 L 887 478 Z" fill="#B8755E" />
        <Cypress x={840} y={542} h={34} s={0.85} />
        <Cypress x={856} y={548} h={24} s={0.75} />
        <Pine x={916} y={544} h={26} s={0.6} />
      </g>

      {/* left mountain */}
      <StripMass d={LEFT_D} stops={LEFT} seed={1234} step={9} edge={7} segments={3} gap={10} underlay="#203A32" />
      <g clipPath="url(#clip-left)">
        <StripMass
          d="M226 298 L356 282 L380 296 L360 308 L242 318 L220 308 Z"
          stops={CORAL}
          seed={2301} underlay="#A95945"
          step={5}
          edge={3}
          segments={2}
          gap={4}
          opacity={0.9}
        />
        <StripMass
          d="M142 370 L238 356 L256 366 L238 378 L150 384 L130 376 Z"
          stops={CORAL}
          seed={2302} underlay="#A95945"
          step={5}
          edge={3}
          segments={2}
          gap={4}
          opacity={0.85}
        />
      </g>

      {/* right mountain */}
      <StripMass d={RIGHT_D} stops={RIGHT} seed={889} step={9} edge={7} segments={3} gap={9} underlay="#2A3B2B" />
      <g clipPath="url(#clip-right)">
        <StripMass
          d="M1344 296 L1478 278 L1500 290 L1480 302 L1360 310 L1334 302 Z"
          stops={CORAL}
          seed={2401} underlay="#A95945"
          step={5}
          edge={3}
          segments={2}
          gap={4}
          opacity={0.85}
        />
      </g>

      {/* foothills */}
      <StripMass
        d="M-20 702 L-20 500 L70 470 L140 502 L210 480 L290 522 L370 542 L450 592 L520 642 L542 706 Z"
        stops={FOOT}
        seed={441}
        underlay="#1D352D"
        step={9}
        edge={5}
        segments={2}
        gap={8}
      />
      <StripMass
        d="M1036 706 L1056 614 L1118 566 L1188 544 L1258 566 L1330 534 L1402 562 L1472 548 L1560 584 L1620 604 L1620 706 Z"
        stops={FOOT}
        seed={552}
        underlay="#1D352D"
        step={9}
        edge={5}
        segments={2}
        gap={8}
      />

      {/* terraces on the left slope */}
      <StripMass
        d="M6 604 L212 580 L238 598 L26 624 Z"
        stops={SAND}
        seed={3311}
        underlay="#A5937A"
        step={6}
        edge={3}
        segments={2}
        gap={5}
      />
      <StripMass
        d="M30 640 L268 610 L296 632 L50 664 Z"
        stops={SAND}
        seed={3312}
        underlay="#A5937A"
        step={6}
        edge={3}
        segments={2}
        gap={5}
      />
      <g opacity={0.92}>
        <Cypress x={54} y={602} h={44} s={0.9} />
        <Cypress x={120} y={594} h={36} s={0.85} />
        <Cypress x={192} y={584} h={42} s={0.9} />
        <Cypress x={84} y={638} h={48} s={0.95} />
        <Cypress x={176} y={626} h={38} s={0.85} />
        <Cypress x={250} y={618} h={34} s={0.8} />
      </g>

      {/* town quay */}
      <StripMass
        d="M1068 702 L1068 656 L1120 646 L1200 642 L1300 648 L1400 632 L1500 638 L1600 624 L1600 702 Z"
        stops={SAND}
        seed={662}
        underlay="#B3A58B"
        step={7}
        edge={3}
        segments={2}
        gap={5}
      />
      <StripMass
        d="M1068 702 L1600 702 L1600 676 L1068 690 Z"
        stops={STONE}
        seed={663}
        step={6}
        edge={2}
        segments={1}
        gap={0}
      />
      {[1092, 1158, 1224, 1290, 1356, 1422, 1488, 1554].map((x) => (
        <path
          key={x}
          d={`M ${x} 702 L ${x} 686 A 11 11 0 0 1 ${x + 22} 686 L ${x + 22} 702 Z`}
          fill="#3E4A3C"
          opacity={0.9}
        />
      ))}

      {/* campanile behind the houses */}
      <g transform="translate(1318 648)">
        <rect x="0" y="-124" width="34" height="124" fill="#F1E7D2" />
        <rect x="26" y="-124" width="8" height="124" fill="#D8CCB5" />
        <rect x="0" y="-46" width="34" height="4" fill="#C96F52" />
        <rect x="7" y="-110" width="20" height="24" fill="#2B3B33" />
        <path d="M 7 -110 L 27 -110 L 27 -96 A 10 10 0 0 1 7 -96 Z" fill="#2B3B33" />
        <rect x="13" y="-102" width="8" height="9" fill="#E9D9BB" />
        <path d="M -6 -124 L 40 -124 L 17 -154 Z" fill="#C96F52" />
        <circle cx="17" cy="-131" r="2" fill="#F1E7D2" />
      </g>

      {HOUSES.map((h, i) => (
        <House key={i} {...h} />
      ))}

      {/* trees */}
      <Cypress x={1110} y={590} h={56} />
      <Cypress x={1140} y={600} h={44} />
      <Pine x={1204} y={606} h={52} s={0.9} />
      <Pine x={1540} y={612} h={48} s={0.85} />

      {/* breakwater */}
      <StripMass
        d="M930 704 L1082 686 L1086 700 L934 718 Z"
        stops={STONE}
        seed={772}
        step={6}
        edge={3}
        segments={1}
        gap={0}
      />
      <Lighthouse x={1052} y={690} />

      {/* reflections */}
      <g opacity={0.28}>
        <rect x="540" y="792" width="120" height="4" fill="#9CBBD1" />
        <rect x="690" y="810" width="180" height="4" fill="#9CBBD1" />
        <rect x="960" y="796" width="110" height="3" fill="#9CBBD1" />
        <rect x="1180" y="752" width="90" height="3" fill="#9CBBD1" />
      </g>

      {/* boats */}
      <g className="bob-a">
        <FishingBoat x={574} y={748} flip s={1.05} />
      </g>
      <g className="bob-b">
        <SailBoat x={772} y={772} s={1.12} />
      </g>
      <g className="bob-c">
        <FishingBoat x={992} y={788} s={1.02} />
      </g>
      <g className="bob-b">
        <RowBoat x={690} y={806} />
      </g>
      <g className="bob-c">
        <FishingBoat x={1198} y={748} s={0.85} />
      </g>

      {/* foreground promontory */}
      <StripMass
        d="M-20 820 L-20 700 L92 686 L198 702 L292 722 L366 750 L398 820 Z"
        stops={SAND}
        seed={993}
        underlay="#9E8C72"
        step={8}
        edge={4}
        segments={2}
        gap={7}
      />
      <StripMass
        d="M292 722 L366 750 L398 820 L318 820 Z"
        stops={STONE}
        seed={994}
        underlay="#7C6C55"
        step={7}
        edge={3}
        segments={1}
        gap={0}
      />
      <Cypress x={44} y={724} h={78} />
      <Cypress x={112} y={714} h={58} s={0.9} />
      <Cypress x={178} y={712} h={66} s={0.95} />
      <Pine x={262} y={724} h={54} s={0.95} />

      {/* gulls */}
      <Gull x={1040} y={210} s={1.2} />
      <Gull x={1094} y={186} s={0.9} />
      <Gull x={1150} y={232} s={0.7} />
    </svg>
  )
}
