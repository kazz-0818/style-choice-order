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
  /** フラップの形（square / round / curve / point）— ショルダーポーチ型 */
  flap?: string
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

/** 上すぼまりの台形（上辺の幅 = 底辺 × tx）。下の角は rb、上の角は rt で丸める */
function trapezoid(x0: number, y0: number, pw: number, ph: number, tx: number, rb: number, rt: number) {
  const ins = (pw * (1 - tx)) / 2
  const xl = x0 + ins
  const xr = x0 + pw - ins
  return (
    `M${xl + rt} ${y0}H${xr - rt}Q${xr} ${y0} ${xr} ${y0 + rt}` +
    `L${x0 + pw} ${y0 + ph - rb}Q${x0 + pw} ${y0 + ph} ${x0 + pw - rb} ${y0 + ph}` +
    `H${x0 + rb}Q${x0} ${y0 + ph} ${x0} ${y0 + ph - rb}` +
    `L${xl} ${y0 + rt}Q${xl} ${y0} ${xl + rt} ${y0}Z`
  )
}

/** ポーチのフラップ形状 */
function flapPath(kind: string, xl: number, xr: number, y0: number, yb: number) {
  const cx = (xl + xr) / 2
  if (kind === 'round') {
    const r = Math.min(9, (xr - xl) * 0.3)
    return `M${xl} ${y0}H${xr}V${yb - r}Q${xr} ${yb} ${xr - r} ${yb}H${xl + r}Q${xl} ${yb} ${xl} ${yb - r}Z`
  }
  if (kind === 'curve') return `M${xl} ${y0}H${xr}V${yb - 1}Q${cx} ${yb + 10} ${xl} ${yb - 1}Z`
  if (kind === 'point') return `M${xl} ${y0}H${xr}V${yb - 3}L${cx} ${yb + 7}L${xl} ${yb - 3}Z`
  return `M${xl} ${y0}H${xr}V${yb}H${xl}Z`
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
  flap = 'square',
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
  const archModel = MODEL.ARCH_H * shape.handle.base * (type === 'shoulder-pouch' ? 1 : handleMult)
  const isStrap = shape.handle.mode === 'single'
  const isTop = shape.handle.mode === 'top'
  const isCyl = shape.body === 'cylinder'
  const isPouch = type === 'shoulder-pouch'
  const isTopHandle = type === 'top-handle'
  const hasTabs = type === 'business' || type === 'top-handle'
  const tx = shape.taper.x
  const tzz = shape.taper.z

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
  const isFlapOpening = opening === 'flap' || opening === 'frame-flap'
  const strapProps = { stroke: handleColor, strokeWidth: isStrap ? 1.8 : isTop ? 2 : 2.8 }

  let content: ReactNode

  if (view === 'front' || view === 'back') {
    const k = Math.min(62 / dim.w, 48 / dim.h)
    const pw = dim.w * k
    const ph = dim.h * k
    const hh = Math.max(7, Math.min(isStrap ? 24 : 27, archModel * k))
    const y0 = (100 - (ph + hh)) / 2 + hh + 2
    const x0 = 50 - pw / 2
    const cx = 50
    const ins = (pw * (1 - tx)) / 2
    /** 高さ f（0=上端, 1=底）での左右端 */
    const edgeL = (f: number) => x0 + ins * (1 - f)
    const edgeR = (f: number) => x0 + pw - ins * (1 - f)
    const topW = pw * tx
    const spread = topW * shape.handle.spread
    const hl = cx - spread / 2
    const hr = cx + spread / 2
    const front = view === 'front'

    let bodyPath: string
    if (isCyl) bodyPath = roundedRect(x0, y0, pw, ph, ph * 0.46)
    else if (type === 'shoulder') bodyPath = roundedRect(x0, y0, pw, ph, Math.min(9, ph * 0.24))
    else if (type === 'boston') bodyPath = trapezoid(x0, y0, pw, ph, tx, ph * 0.16, 2)
    else if (type === 'tote') bodyPath = trapezoid(x0, y0, pw, ph, tx, 1.5, 1.5)
    else if (isTopHandle) bodyPath = trapezoid(x0, y0, pw, ph, tx, ph * 0.08, ph * 0.04)
    else if (isPouch) bodyPath = trapezoid(x0, y0, pw, ph, tx, 3, 2.5)
    else bodyPath = trapezoid(x0, y0, pw, ph, tx, 2.5, 1.5)

    const beltC = ph * 0.175

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
        {/* ポーチ：チェーンストラップ（大きなアーチ） */}
        {isPouch && (
          <path
            d={arc(edgeL(0) + 2, edgeR(0) - 2, y0, Math.min(28, hh * 2.4))}
            stroke={metalColor}
            strokeWidth={2.2}
            strokeDasharray="1.8 1.2"
          />
        )}
        {/* 手前の持ち手 / ストラップ */}
        <path d={arc(hl, hr, y0, hh)} {...strapProps} />
        <path d={bodyPath} fill={bodyFill} />
        {isCyl && (
          <>
            <path d={`M${x0 + ph * 0.34} ${y0 + ph * 0.12}H${x0 + pw - ph * 0.34}`} strokeDasharray="2 2" strokeWidth={1} />
            <path d={`M${x0 + pw * 0.09} ${y0 + ph * 0.12}Q${x0 + pw * 0.04} ${y0 + ph * 0.5} ${x0 + pw * 0.09} ${y0 + ph * 0.88}`} strokeWidth={1} />
            <path d={`M${x0 + pw * 0.91} ${y0 + ph * 0.12}Q${x0 + pw * 0.96} ${y0 + ph * 0.5} ${x0 + pw * 0.91} ${y0 + ph * 0.88}`} strokeWidth={1} />
            {front && <circle cx={cx} cy={y0 + ph * 0.34} r={2.4} stroke={metalColor} fill={paper} />}
          </>
        )}
        {/* トップハンドル：ターンロック（ベルトなし） */}
        {isTopHandle && (
          <>
            {front && <rect x={cx - 3.4} y={y0 + beltC - 2.6} width={6.8} height={5.2} rx={1.4} stroke={metalColor} fill={paper} strokeWidth={1.4} />}
            {isZip && <path d={`M${edgeL(0.06) + 3} ${y0 + 3}H${edgeR(0.06) - 3}`} stroke={metalColor} strokeWidth={1.1} strokeDasharray="1 1.2" />}
          </>
        )}
        {type === 'business' && (
          <>
            <path d={`M${edgeL(0.05) + 3} ${y0 + 4}H${edgeR(0.05) - 3}`} strokeDasharray="2 2" strokeWidth={1} />
            {front && (
              <>
                <path d={roundedRect(x0 + pw * 0.08, y0 + ph * 0.38, pw * 0.4, ph * 0.56, 1.5)} fill={accentFill} strokeWidth={1.1} />
                <path d={roundedRect(x0 + pw * 0.52, y0 + ph * 0.38, pw * 0.4, ph * 0.56, 1.5)} fill={accentFill} strokeWidth={1.1} />
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
        {type === 'tote' && front && isZip && (
          <path d={`M${edgeL(0.05) + 3} ${y0 + 4}H${edgeR(0.05) - 3}`} strokeDasharray="2 2" strokeWidth={1} />
        )}
        {/* トート：持ち手の付け根を四角く縫い留める */}
        {type === 'tote' &&
          [hl, hr].map((hx0) => (
            <g key={hx0} strokeWidth={0.9} strokeDasharray="1.4 1.2">
              <rect x={hx0 - 3.4} y={y0 + 1.2} width={6.8} height={ph * 0.2} />
              <path d={`M${hx0 - 3.4} ${y0 + 1.2}L${hx0 + 3.4} ${y0 + 1.2 + ph * 0.2}M${hx0 + 3.4} ${y0 + 1.2}L${hx0 - 3.4} ${y0 + 1.2 + ph * 0.2}`} />
            </g>
          ))}
        {type === 'tote' && !front && (
          <path d={`M${x0 + 5} ${y0 + ph * 0.45}h${pw - 10}v${ph * 0.38}h-${pw - 10}z`} strokeWidth={1.1} />
        )}
        {/* 持ち手を留める涙型タブ（付け根から本体の約半分の長さ） */}
        {hasTabs && front && (
          <>
            {[hl, hr].map((tx0) => {
              const L = ph * (type === 'business' ? 0.47 : 0.43)
              return (
                <path
                  key={tx0}
                  d={`M${tx0 - 2.4} ${y0 + 0.5}H${tx0 + 2.4}L${tx0 + 2.2} ${y0 + L * 0.72}Q${tx0 + 1.6} ${y0 + L * 0.95} ${tx0} ${y0 + L}Q${tx0 - 1.6} ${y0 + L * 0.95} ${tx0 - 2.2} ${y0 + L * 0.72}Z`}
                  fill={handleColor}
                  strokeWidth={0.9}
                />
              )
            })}
          </>
        )}
        {/* ポーチ：フラップ（形は選択に追従） */}
        {isPouch && (
          <>
            <path
              d={flapPath(flap, edgeL(0.02), edgeR(0.02), y0, y0 + ph * 0.44)}
              fill={accentFill === paper ? bodyFill : accentFill}
            />
            {front && (
              <circle
                cx={cx}
                cy={y0 + ph * (flap === 'point' ? 0.5 : flap === 'curve' ? 0.49 : 0.42)}
                r={2.2}
                stroke={metalColor}
                fill={paper}
              />
            )}
          </>
        )}
        {type === 'shoulder' && (
          <>
            <path d={`M${x0 + 6} ${y0 + ph * 0.2}H${x0 + pw - 6}`} strokeDasharray="2 2" strokeWidth={1} />
            <circle cx={x0 + 6} cy={y0 + ph * 0.2} r={1.6} stroke={metalColor} />
          </>
        )}
        {front && isFlapOpening && !isPouch && (
          <path d={flapPath('square', edgeL(0.02), edgeR(0.02), y0, y0 + ph * 0.42)} fill={bodyFill} />
        )}
        {front && isZip && !isTopHandle && type !== 'business' && type !== 'tote' && type !== 'shoulder' && (
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
            <path d={`M${edgeR(0.05)} ${y0 + 3}v12`} stroke={metalColor} />
            <circle cx={edgeR(0.05)} cy={y0 + 18} r={3} stroke={metalColor} fill={accentFill} />
          </>
        )}
        {studs && (type === 'business' || type === 'boston' || type === 'tote' || isTopHandle) && (
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
    const topD = pw * tzz
    content = (
      <g {...common}>
        <path d={arc(50 - topD * 0.28, 50 + topD * 0.28, y0, hh)} {...strapProps} />
        <path
          d={
            isCyl
              ? roundedRect(x0, y0, pw, ph, Math.min(pw, ph) / 2)
              : trapezoid(x0, y0, pw, ph, tzz, type === 'boston' ? 2 : 2.5, 2.5)
          }
          fill={bodyFill}
        />
        <path d={`M${50} ${y0 + 3}V${y0 + ph - 3}`} strokeDasharray="1.5 3" strokeWidth={0.9} />
        {(hasTabs || type === 'shoulder') && (
          <circle cx={50 + topD / 2 - 1} cy={y0 + 4} r={1.8} stroke={metalColor} />
        )}
      </g>
    )
  } else if (view === 'top') {
    const k = Math.min(70 / dim.w, 44 / dim.d)
    const pw = dim.w * k
    const ph = dim.d * k
    const x0 = 50 - pw / 2
    const y0 = 50 - ph / 2
    const spread = pw * tx * shape.handle.spread
    content = (
      <g {...common}>
        <path
          d={roundedRect(x0, y0, pw, ph, isCyl ? ph * 0.3 : 3)}
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
        ) : isPouch ? (
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
        ) : isTop ? (
          <path d={`M${50 - spread / 2} ${50}H${50 + spread / 2}`} stroke={handleColor} strokeWidth={2.4} />
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
    const hasStuds = studs && (type === 'business' || type === 'boston' || type === 'tote' || isTopHandle)
    content = (
      <g {...common}>
        <path
          d={roundedRect(x0, y0, pw, ph, isCyl ? ph * 0.3 : 3)}
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
