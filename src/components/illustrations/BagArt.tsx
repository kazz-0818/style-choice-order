import type { ReactNode } from 'react'
import { BAG_SHAPES, MODEL, getBodyDimensions } from '../../data/bagShapes'
import { DEFAULT_SIZE, type BagSize, type BagTemplateId } from '../../types/bag'
import { GOLD, NAVY } from './icons'

export type BagView = 'front' | 'back' | 'side' | 'top' | 'bottom'

export interface BagArtFills {
  body?: string
  handle?: string
  bottom?: string
  metal?: string
  accent?: string
}

interface BagArtProps {
  type: BagTemplateId
  view?: BagView
  size?: BagSize
  /** 持ち手の長さ倍率 */
  handleMult?: number
  fills?: BagArtFills
  studs?: boolean
  charm?: boolean
  /** 開口部の仕様（zipper / open / magnet / frame ...） */
  opening?: string
  /** 線の色（紺地の上では金色を指定） */
  lineColor?: string
  /** 紙の色（塗りの既定色） */
  paper?: string
  className?: string
}

const PAPER = '#fffdf8'
const LINE = 1.6

/** 立体的な持ち手アーチ（ピークが height になる3次ベジェ） */
function arc(xl: number, xr: number, y: number, height: number) {
  const c = height / 0.75
  return `M${xl} ${y}C${xl} ${y - c} ${xr} ${y - c} ${xr} ${y}`
}

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  return `M${x + rr} ${y}H${x + w - rr}Q${x + w} ${y} ${x + w} ${y + rr}V${y + h - rr}Q${x + w} ${y + h} ${x + w - rr} ${y + h}H${x + rr}Q${x} ${y + h} ${x} ${y + h - rr}V${y + rr}Q${x} ${y} ${x + rr} ${y}Z`
}

export function BagArt({
  type,
  view = 'front',
  size = DEFAULT_SIZE,
  handleMult = 1,
  fills,
  studs = true,
  charm = false,
  opening,
  lineColor = NAVY,
  paper = PAPER,
  className,
}: BagArtProps) {
  const shape = BAG_SHAPES[type]
  const dim = getBodyDimensions(type, size)
  const bodyFill = fills?.body ?? paper
  const handleColor = fills?.handle ?? lineColor
  const metalColor = fills?.metal ?? GOLD
  const accentFill = fills?.accent ?? paper
  const dual = shape.handle.mode === 'dual'
  const archModel = MODEL.ARCH_H * shape.handle.base * handleMult
  const isStrap = shape.handle.mode === 'single'

  const common = {
    fill: 'none',
    stroke: lineColor,
    strokeWidth: LINE,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const isZip = ['zipper', 'zip-single', 'zip-double', 'frame-zip'].includes(opening ?? '')
  const isOpen = opening === 'open' || opening === 'frame'
  const isFrame = (opening ?? '').startsWith('frame')
  const isMagnet = opening === 'magnet'

  let content: ReactNode

  if (view === 'front' || view === 'back') {
    const k = Math.min(62 / dim.w, 48 / dim.h)
    const pw = dim.w * k
    const ph = dim.h * k
    const hh = Math.max(7, Math.min(isStrap ? 24 : 20, archModel * k))
    const y0 = (100 - (ph + hh)) / 2 + hh + 2
    const x0 = 50 - pw / 2
    const cx = 50
    const spread = pw * shape.handle.spread
    const hl = cx - spread / 2
    const hr = cx + spread / 2
    const front = view === 'front'

    let bodyPath: string
    switch (type) {
      case 'boston':
        bodyPath = `M${x0 + pw * 0.12} ${y0}H${x0 + pw * 0.88}L${x0 + pw} ${y0 + ph * 0.86}Q${x0 + pw} ${y0 + ph} ${x0 + pw * 0.9} ${y0 + ph}H${x0 + pw * 0.1}Q${x0} ${y0 + ph} ${x0} ${y0 + ph * 0.86}Z`
        break
      case 'tote':
        bodyPath = `M${x0 + pw * 0.05} ${y0}H${x0 + pw * 0.95}L${x0 + pw} ${y0 + ph}H${x0}Z`
        break
      case 'mini-boston':
        bodyPath = roundedRect(x0, y0, pw, ph, ph * 0.42)
        break
      case 'shoulder':
        bodyPath = roundedRect(x0, y0, pw, ph, Math.min(9, ph * 0.22))
        break
      default:
        bodyPath = roundedRect(x0, y0, pw, ph, 2.5)
    }

    content = (
      <g {...common}>
        {/* 奥側の持ち手 */}
        {dual && (
          <path
            d={arc(hl + 3, hr + 3, y0 - 2, hh)}
            stroke={handleColor}
            strokeOpacity={0.5}
            strokeWidth={2.4}
          />
        )}
        {/* 手前の持ち手 / ストラップ */}
        <path
          d={arc(hl, hr, y0, hh)}
          stroke={handleColor}
          strokeWidth={isStrap ? 1.8 : 2.8}
        />
        <path d={bodyPath} fill={bodyFill} />
        {type === 'business' && (
          <>
            <path d={`M${x0 + 3} ${y0 + 4}H${x0 + pw - 3}`} strokeDasharray="2 2" strokeWidth={1} />
            {front && (
              <>
                <path d={`M${x0 + pw * 0.2} ${y0 + ph * 0.3}V${y0 + ph}`} strokeWidth={1.1} />
                <path d={`M${x0 + pw * 0.8} ${y0 + ph * 0.3}V${y0 + ph}`} strokeWidth={1.1} />
                <rect x={cx - 3} y={y0 + ph * 0.16} width={6} height={4} rx={1} stroke={metalColor} />
              </>
            )}
          </>
        )}
        {type === 'boston' && (
          <>
            <path d={roundedRect(x0 + pw * 0.14, y0 - 3.4, pw * 0.72, 5.6, 2.6)} fill={bodyFill} />
            {front && <circle cx={cx} cy={y0 + ph * 0.16} r={2.6} stroke={metalColor} fill={paper} />}
          </>
        )}
        {type === 'tote' && front && (
          <path d={`M${x0 + pw * 0.06} ${y0 + 4}H${x0 + pw * 0.94}`} strokeDasharray="2 2" strokeWidth={1} />
        )}
        {type === 'tote' && !front && (
          <path d={`M${x0 + 4} ${y0 + ph * 0.5}h${pw - 8}v${ph * 0.38}h-${pw - 8}z`} strokeWidth={1.1} />
        )}
        {type === 'shoulder-pouch' && (
          <>
            <path
              d={`M${x0} ${y0}H${x0 + pw}V${y0 + ph * 0.42}L${cx} ${y0 + ph * 0.58}L${x0} ${y0 + ph * 0.42}Z`}
              fill={accentFill === paper ? bodyFill : accentFill}
            />
            {front && <circle cx={cx} cy={y0 + ph * 0.5} r={2.2} stroke={metalColor} fill={paper} />}
          </>
        )}
        {type === 'mini-boston' && (
          <>
            <path
              d={`M${x0 + ph * 0.32} ${y0 + ph * 0.2}H${x0 + pw - ph * 0.32}`}
              strokeDasharray="2 2"
              strokeWidth={1}
            />
            <circle cx={x0 + pw - ph * 0.3} cy={y0 + ph * 0.2} r={1.6} stroke={metalColor} />
          </>
        )}
        {type === 'shoulder' && (
          <>
            <path d={`M${x0 + 6} ${y0 + ph * 0.2}H${x0 + pw - 6}`} strokeDasharray="2 2" strokeWidth={1} />
            <circle cx={x0 + 6} cy={y0 + ph * 0.2} r={1.6} stroke={metalColor} />
          </>
        )}
        {front && isZip && (
          <>
            <path d={`M${x0 + pw * 0.16} ${y0 + 6.5}H${x0 + pw * 0.84}`} stroke={metalColor} strokeWidth={1.3} strokeDasharray="1 1.2" />
            <path d={`M${x0 + pw * 0.7} ${y0 + 6.5}v3`} stroke={metalColor} />
            <circle cx={x0 + pw * 0.7} cy={y0 + 11.6} r={2} stroke={metalColor} />
          </>
        )}
        {front && isMagnet && (
          <>
            <path d={roundedRect(cx - 5, y0 + 2, 10, 11, 1.5)} fill={bodyFill} />
            <circle cx={cx} cy={y0 + 10} r={1.8} stroke={metalColor} fill={metalColor} />
          </>
        )}
        {front && isFrame && (
          <path d={`M${x0 + pw * 0.1} ${y0 + 2.6}H${x0 + pw * 0.9}`} stroke={metalColor} strokeWidth={2.4} />
        )}
        {charm && front && (
          <>
            <path d={`M${x0 + pw} ${y0 + 3}v12`} stroke={metalColor} />
            <circle cx={x0 + pw} cy={y0 + 18} r={3} stroke={metalColor} fill={accentFill} />
          </>
        )}
        {studs && (type === 'business' || type === 'boston' || type === 'tote') && (
          <>
            <circle cx={x0 + pw * 0.14} cy={y0 + ph - 2} r={1.1} stroke={metalColor} />
            <circle cx={x0 + pw * 0.86} cy={y0 + ph - 2} r={1.1} stroke={metalColor} />
          </>
        )}
      </g>
    )
  } else if (view === 'side') {
    const k = Math.min(56 / dim.d, 48 / dim.h)
    const pw = dim.d * k
    const ph = dim.h * k
    const hh = Math.max(7, Math.min(20, archModel * k))
    const y0 = (100 - (ph + hh)) / 2 + hh + 2
    const x0 = 50 - pw / 2
    const wide = type === 'boston'
    content = (
      <g {...common}>
        <path
          d={arc(50 - pw * 0.28, 50 + pw * 0.28, y0, hh)}
          stroke={handleColor}
          strokeWidth={isStrap ? 1.8 : 2.8}
        />
        <path
          d={
            wide
              ? `M${x0 + pw * 0.22} ${y0}H${x0 + pw * 0.78}L${x0 + pw} ${y0 + ph}H${x0}Z`
              : roundedRect(x0, y0, pw, ph, type === 'mini-boston' ? ph * 0.4 : 2.5)
          }
          fill={bodyFill}
        />
        <path d={`M${50} ${y0 + 3}V${y0 + ph - 3}`} strokeDasharray="1.5 3" strokeWidth={0.9} />
        {(type === 'tote' || type === 'shoulder') && (
          <circle cx={x0 + pw} cy={y0 + 3} r={1.6} stroke={metalColor} />
        )}
      </g>
    )
  } else if (view === 'top') {
    const k = Math.min(70 / dim.w, 44 / dim.d)
    const pw = dim.w * k
    const ph = dim.d * k
    const x0 = 50 - pw / 2
    const y0 = 50 - ph / 2
    const spread = pw * shape.handle.spread
    content = (
      <g {...common}>
        <path
          d={roundedRect(x0, y0, pw, ph, type === 'mini-boston' ? ph * 0.45 : 3)}
          fill={bodyFill}
        />
        {isOpen && (
          <path
            d={roundedRect(x0 + pw * 0.1, y0 + ph * 0.18, pw * 0.8, ph * 0.64, ph * 0.2)}
            fill="#2b2622"
            fillOpacity={0.85}
            strokeWidth={1}
          />
        )}
        {isFrame && (
          <path
            d={roundedRect(x0 + pw * 0.08, y0 + ph * 0.12, pw * 0.84, ph * 0.76, ph * 0.22)}
            stroke={metalColor}
            strokeWidth={2.2}
          />
        )}
        {isZip && (
          <>
            <path d={`M${x0 + pw * 0.1} ${50}H${x0 + pw * 0.9}`} stroke="#333" strokeWidth={3.4} strokeOpacity={0.7} />
            <path d={`M${x0 + pw * 0.1} ${50}H${x0 + pw * 0.9}`} stroke={metalColor} strokeWidth={1.6} strokeDasharray="1 1.1" />
            <circle cx={x0 + pw * 0.7} cy={50} r={2.4} stroke={metalColor} fill={paper} />
          </>
        )}
        {isMagnet && <circle cx={50} cy={50} r={2.6} stroke={metalColor} fill={metalColor} />}
        {type === 'boston' ? (
          <path
            d={roundedRect(x0 + pw * 0.14, y0 + ph * 0.22, pw * 0.72, ph * 0.56, ph * 0.24)}
            strokeWidth={1.1}
          />
        ) : type === 'shoulder-pouch' ? (
          <path d={`M${x0} ${y0 + ph * 0.5}H${x0 + pw}`} strokeWidth={1.1} />
        ) : (
          <path
            d={`M${x0 + 5} ${50}H${x0 + pw - 5}`}
            strokeDasharray="2 2"
            strokeWidth={1.1}
          />
        )}
        {dual ? (
          <>
            <path d={`M${50 - spread / 2} ${y0 + ph * 0.24}H${50 + spread / 2}`} stroke={handleColor} strokeWidth={2.8} />
            <path d={`M${50 - spread / 2} ${y0 + ph * 0.76}H${50 + spread / 2}`} stroke={handleColor} strokeWidth={2.8} />
          </>
        ) : (
          <path d={`M${x0 + 3} ${50}H${x0 + pw - 3}`} stroke={handleColor} strokeWidth={1.8} strokeOpacity={0.7} />
        )}
      </g>
    )
  } else {
    const k = Math.min(70 / dim.w, 44 / dim.d)
    const pw = dim.w * k
    const ph = dim.d * k
    const x0 = 50 - pw / 2
    const y0 = 50 - ph / 2
    const hasStuds = studs && (type === 'business' || type === 'boston' || type === 'tote')
    content = (
      <g {...common}>
        <path
          d={roundedRect(x0, y0, pw, ph, type === 'mini-boston' ? ph * 0.45 : 3)}
          fill={fills?.bottom ?? bodyFill}
        />
        {hasStuds &&
          [
            [x0 + pw * 0.14, y0 + ph * 0.24],
            [x0 + pw * 0.86, y0 + ph * 0.24],
            [x0 + pw * 0.14, y0 + ph * 0.76],
            [x0 + pw * 0.86, y0 + ph * 0.76],
          ].map(([sx, sy]) => (
            <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r={2} stroke={metalColor} fill={paper} />
          ))}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={`${type} ${view}`}
    >
      {content}
    </svg>
  )
}
