import type { ReactNode } from 'react'
import { GOLD, NAVY } from './icons'

/** 64x64 の選択肢イラスト。キーは `${SpecKey}:${optionId}` */

const g = { stroke: GOLD } as const

/** 基本のバッグ正面（本体＋持ち手） */
function Body({
  handle = 12,
  y = 26,
  h = 30,
  children,
}: {
  handle?: number
  y?: number
  h?: number
  children?: ReactNode
}) {
  return (
    <>
      {handle > 0 && <path d={`M22 ${y}C22 ${y - handle * 1.33} 42 ${y - handle * 1.33} 42 ${y}`} />}
      <rect x="12" y={y} width="40" height={h} rx="3.5" fill="#fffdf8" />
      {children}
    </>
  )
}

const CHAIN = (x: number, y1: number, y2: number) => {
  const links: ReactNode[] = []
  for (let y = y1; y < y2; y += 5) {
    links.push(<ellipse key={y} cx={x} cy={y + 2} rx="1.6" ry="2.4" {...g} />)
  }
  return links
}

const ART: Record<string, ReactNode> = {
  // ── 開口部 ─────────────────────────────
  'opening:zipper': (
    <Body>
      <path d="M14 32h36" strokeDasharray="1.6 1.6" />
      <circle cx="46" cy="32" r="2.6" {...g} />
    </Body>
  ),
  'opening:flap': (
    <Body>
      <path d="M12 26h40v10L32 45 12 36z" fill="#fffdf8" />
      <circle cx="32" cy="41" r="1.6" {...g} />
    </Body>
  ),
  'opening:open': (
    <>
      <path d="M12 26l4 30h32l4-30" fill="#fffdf8" />
      <ellipse cx="32" cy="26" rx="20" ry="5" fill="#fffdf8" />
      <path d="M22 26C22 12 42 12 42 26" />
    </>
  ),
  'opening:magnet': (
    <Body>
      <path d="M12 34h40" strokeDasharray="0.1 3" strokeWidth="2.4" />
      <circle cx="32" cy="34" r="2.2" {...g} />
    </Body>
  ),
  'opening:frame-flap': (
    <>
      <path d="M17 22h30" strokeWidth="4" {...g} />
      <Body handle={0} y={24} h={32}>
        <path d="M12 24h40v12L32 44 12 36z" fill="#fffdf8" />
      </Body>
      <path d="M20 22C20 8 44 8 44 22" />
    </>
  ),
  'opening:frame': (
    <>
      <path d="M14 26C14 8 50 8 50 26" {...g} strokeWidth="2.4" />
      <rect x="12" y="26" width="40" height="30" rx="3.5" fill="#fffdf8" />
      <path d="M12 32h40" />
      <circle cx="32" cy="32" r="2.2" {...g} />
    </>
  ),
  'opening:frame-zip': (
    <>
      <path d="M14 26C14 8 50 8 50 26" {...g} strokeWidth="2.4" />
      <rect x="12" y="26" width="40" height="30" rx="3.5" fill="#fffdf8" />
      <path d="M14 33h36" strokeDasharray="1.6 1.6" />
      <circle cx="46" cy="33" r="2.4" {...g} />
    </>
  ),
  'opening:zip-single': (
    <>
      <path d="M22 30C22 18 42 18 42 30" />
      <rect x="8" y="30" width="48" height="24" rx="12" fill="#fffdf8" />
      <path d="M20 38h24" strokeDasharray="1.6 1.6" />
      <circle cx="46" cy="38" r="2.4" {...g} />
    </>
  ),
  'opening:zip-double': (
    <>
      <path d="M22 30C22 18 42 18 42 30" />
      <rect x="8" y="30" width="48" height="24" rx="12" fill="#fffdf8" />
      <path d="M20 38h24" strokeDasharray="1.6 1.6" />
      <circle cx="21" cy="38" r="2.2" {...g} />
      <circle cx="43" cy="38" r="2.2" {...g} />
    </>
  ),

  // ── ファスナー引き手 ───────────────────
  'puller:ring': (
    <>
      <path d="M8 30h48" strokeDasharray="1.6 1.6" />
      <rect x="30" y="26" width="8" height="8" rx="2" fill="#fffdf8" {...g} />
      <circle cx="34" cy="43" r="7" {...g} />
    </>
  ),
  'puller:tab': (
    <>
      <path d="M8 24h48" strokeDasharray="1.6 1.6" />
      <rect x="27" y="20" width="10" height="9" rx="2" fill="#fffdf8" {...g} />
      <rect x="28" y="29" width="8" height="24" rx="3.5" fill="#f2e6cf" />
    </>
  ),
  'puller:tassel': (
    <>
      <path d="M8 22h48" strokeDasharray="1.6 1.6" />
      <rect x="29" y="18" width="7" height="8" rx="2" fill="#fffdf8" {...g} />
      <path d="M32 26v10" {...g} />
      <path d="M26 38h12l2 16M26 38l-2 16M29 38l-1 16M32 38v16M35 38l1 16" {...g} />
    </>
  ),
  'puller:bar': (
    <>
      <path d="M8 26h48" strokeDasharray="1.6 1.6" />
      <rect x="29" y="22" width="8" height="8" rx="2" fill="#fffdf8" {...g} />
      <rect x="27" y="32" width="12" height="22" rx="2" fill="#fffdf8" {...g} />
    </>
  ),

  // ── 持ち手の長さ ───────────────────────
  'handle:short': <Body handle={9} y={38} h={20} />,
  'handle:standard': <Body handle={16} y={38} h={20} />,
  'handle:long': (
    <>
      <path d="M22 40C22 -2 42 -2 42 40" />
      <rect x="12" y="40" width="40" height="18" rx="3.5" fill="#fffdf8" />
    </>
  ),
  'handle:shoulder': (
    <>
      <path d="M18 44C6 30 10 2 32 2s26 28 14 42" />
      <rect x="14" y="44" width="36" height="16" rx="3.5" fill="#fffdf8" />
    </>
  ),

  // ── 外ポケット／内仕様 ──────────────────
  'pocket:none': <Body />,
  'pocket:front': (
    <Body>
      <path d="M18 38h28v13a3 3 0 01-3 3H21a3 3 0 01-3-3z" fill="#f2e6cf" />
    </Body>
  ),
  'pocket:back': (
    <Body>
      <path d="M18 38h28v13a3 3 0 01-3 3H21a3 3 0 01-3-3z" strokeDasharray="3 2.4" />
      <path d="M47 24l4-4M47 24l-4-2" {...g} />
    </Body>
  ),
  'pocket:both': (
    <Body>
      <path d="M18 38h28v13a3 3 0 01-3 3H21a3 3 0 01-3-3z" fill="#f2e6cf" />
      <path d="M22 32h20" strokeDasharray="3 2.4" />
    </Body>
  ),
  'inner:none': <Body handle={0} y={14} h={40} />,
  'inner:divider': (
    <Body handle={0} y={14} h={40}>
      <path d="M32 14v40" />
    </Body>
  ),
  'inner:zip': (
    <Body handle={0} y={14} h={40}>
      <path d="M18 30h28" strokeDasharray="1.6 1.6" />
      <circle cx="44" cy="30" r="2.2" {...g} />
    </Body>
  ),
  'inner:both': (
    <Body handle={0} y={14} h={40}>
      <path d="M32 14v40" />
      <path d="M36 32h12" strokeDasharray="1.6 1.6" />
    </Body>
  ),

  // ── 金具 ──────────────────────────────
  'lock:none': <Body />,
  'lock:turn': (
    <Body>
      <rect x="26" y="30" width="12" height="9" rx="2" fill="#fffdf8" {...g} />
      <circle cx="32" cy="34.5" r="1.8" {...g} />
    </Body>
  ),
  'lock:padlock': (
    <Body>
      <rect x="25" y="36" width="14" height="12" rx="2.5" fill="#fffdf8" {...g} />
      <path d="M28 36v-3a4 4 0 018 0v3" {...g} />
    </Body>
  ),
  'lock:belt': (
    <Body>
      <path d="M12 36h40v6H12z" fill="#f2e6cf" />
      <rect x="28" y="33" width="8" height="12" rx="1.5" fill="#fffdf8" {...g} />
      <path d="M32 39h.01" {...g} strokeWidth="2.4" />
    </Body>
  ),
  'lock:twist': (
    <Body>
      <circle cx="32" cy="34" r="6" fill="#fffdf8" {...g} />
      <path d="M32 29v10M27 34h10" {...g} />
    </Body>
  ),
  'lock:dring': (
    <Body>
      <path d="M26 30h9a6 6 0 010 12h-9z" {...g} strokeWidth="2.2" />
    </Body>
  ),
  'lock:snaphook': (
    <Body>
      <path d="M32 27v4" {...g} />
      <path d="M26 46V37a6 6 0 0112 0v9a3 3 0 01-6 0" {...g} strokeWidth="2" />
    </Body>
  ),
  'lock:dring-snap': (
    <Body>
      <path d="M20 30h6a4.5 4.5 0 010 9h-6z" {...g} strokeWidth="2" />
      <path d="M42 29v3" {...g} />
      <path d="M38 46V38a4 4 0 018 0v8a2.5 2.5 0 01-5 0" {...g} strokeWidth="2" />
    </Body>
  ),

  // ── 底鋲 ──────────────────────────────
  'studs:none': <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />,
  'studs:four': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />
      {[
        [16, 26],
        [48, 26],
        [16, 38],
        [48, 38],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fffdf8" {...g} />
      ))}
    </>
  ),
  'studColor:gold': <StudSwatch fill="#c9a24a" />,
  'studColor:silver': <StudSwatch fill="#c8ccd2" />,
  'studColor:black': <StudSwatch fill="#2a2f3a" />,

  // ── フラップ ──────────────────────────
  'flap:square': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <circle cx="32" cy="34" r="1.8" {...g} />
    </Body>
  ),
  'flap:round': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v14a8 8 0 01-8 8H20a8 8 0 01-8-8z" fill="#f2e6cf" />
      <circle cx="32" cy="35" r="1.8" {...g} />
    </Body>
  ),
  'flap:curve': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v18Q32 44 12 32z" fill="#f2e6cf" />
      <circle cx="32" cy="35" r="1.8" {...g} />
    </Body>
  ),
  'flap:point': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v18L32 42 12 32z" fill="#f2e6cf" />
      <circle cx="32" cy="38" r="1.8" {...g} />
    </Body>
  ),
  'piping:none': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
    </Body>
  ),
  'piping:piping': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <path d="M15 17h34v14H15z" {...g} strokeWidth="1.3" />
      <path d="M12 34h40" {...g} strokeWidth="3" />
    </Body>
  ),
  'piping:edge': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <path d="M12 34h40" strokeWidth="4.4" />
    </Body>
  ),

  // ── 留め具 ────────────────────────────
  'clasp:none': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <circle cx="32" cy="34" r="2.4" strokeDasharray="1.4 1.6" />
    </Body>
  ),
  'clasp:turn': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <rect x="26" y="29" width="12" height="9" rx="2" fill="#fffdf8" {...g} />
      <circle cx="32" cy="33.5" r="1.8" {...g} />
    </Body>
  ),
  'clasp:snap': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <circle cx="32" cy="34" r="4" fill="#fffdf8" {...g} />
    </Body>
  ),
  'clasp:bar': (
    <Body handle={0} y={14} h={42}>
      <path d="M12 14h40v20H12z" fill="#f2e6cf" />
      <rect x="22" y="31" width="20" height="6" rx="1.5" fill="#fffdf8" {...g} />
    </Body>
  ),

  // ── チャーム・チェーン ───────────────────
  'charm:none': <Body />,
  'charm:charm': (
    <>
      <Body />
      <path d="M52 34v6" {...g} />
      <circle cx="52" cy="46" r="4" fill="#f2e6cf" {...g} />
    </>
  ),
  'charm:chain': (
    <>
      <Body />
      <g>{CHAIN(52, 30, 56)}</g>
    </>
  ),
  'charm:both': (
    <>
      <Body />
      <g>{CHAIN(52, 30, 46)}</g>
      <circle cx="52" cy="53" r="4" fill="#f2e6cf" {...g} />
    </>
  ),
  'charmDesign:ball': <circle cx="32" cy="32" r="12" fill="#f2e6cf" {...g} />,
  'charmDesign:star': (
    <path d="M32 10l5.6 11.6 12.8 1.8-9.3 8.9 2.2 12.7L32 38.8l-11.3 6.2 2.2-12.7-9.3-8.9 12.8-1.8z" fill="#f2e6cf" {...g} />
  ),
  'charmDesign:heart': (
    <path d="M32 52C18 42 12 34 12 26a10 10 0 0120-2 10 10 0 0120 2c0 8-6 16-20 26z" fill="#f2e6cf" {...g} />
  ),
  'charmDesign:tassel': (
    <>
      <path d="M32 6v10" {...g} />
      <rect x="27" y="16" width="10" height="8" rx="2" fill="#f2e6cf" {...g} />
      <path d="M26 26h12l3 30M26 26l-3 30M29 26l-1.5 30M32 26v30M35 26l1.5 30" {...g} />
    </>
  ),
  'chainLength:short': (
    <>
      <g>{CHAIN(32, 8, 24)}</g>
      <circle cx="32" cy="34" r="5" fill="#f2e6cf" {...g} />
    </>
  ),
  'chainLength:medium': (
    <>
      <g>{CHAIN(32, 6, 34)}</g>
      <circle cx="32" cy="45" r="5" fill="#f2e6cf" {...g} />
    </>
  ),
  'chainLength:long': (
    <>
      <g>{CHAIN(32, 3, 48)}</g>
      <circle cx="32" cy="58" r="5" fill="#f2e6cf" {...g} />
    </>
  ),

  // ── ストラップ ────────────────────────
  'strapWidth:narrow': (
    <>
      <path d="M14 56V30a18 18 0 0136 0v26" strokeWidth="2" />
      <text x="32" y="60" textAnchor="middle" fontSize="6" fill={NAVY} stroke="none">細</text>
    </>
  ),
  'strapWidth:standard': (
    <>
      <path d="M12 56V30a20 20 0 0140 0v26" strokeWidth="4.4" />
    </>
  ),
  'strapWidth:wide': (
    <>
      <path d="M11 56V30a21 21 0 0142 0v26" strokeWidth="8" stroke="#f2e6cf" />
      <path d="M7 56V30a25 25 0 0150 0v26M15 56V30a17 17 0 0134 0v26" />
    </>
  ),
  'strapHook:snaphook': (
    <>
      <path d="M32 6v12" strokeWidth="4" />
      <path d="M22 54V32a10 10 0 0120 0v22a5 5 0 01-10 0" {...g} strokeWidth="2.6" />
      <path d="M22 26h6" {...g} />
    </>
  ),
  'strapHook:dring': (
    <>
      <path d="M32 6v14" strokeWidth="4" />
      <path d="M18 26h16a14 14 0 010 28H18z" {...g} strokeWidth="3" />
    </>
  ),
  'strapHook:screw': (
    <>
      <path d="M32 6v22" strokeWidth="4" />
      <circle cx="32" cy="38" r="12" fill="#fffdf8" {...g} />
      <path d="M26 38h12M32 32v12" {...g} />
    </>
  ),
  'strapAdjust:fixed': <path d="M6 32h52" strokeWidth="6" stroke="#f2e6cf" />,
  'strapAdjust:slider': (
    <>
      <path d="M6 32h52" strokeWidth="6" stroke="#f2e6cf" />
      <rect x="22" y="22" width="20" height="20" rx="3" fill="#fffdf8" {...g} />
      <path d="M22 28h20M22 36h20" {...g} />
    </>
  ),
  'strapAdjust:buckle': (
    <>
      <path d="M6 32h52" strokeWidth="6" stroke="#f2e6cf" />
      <rect x="26" y="22" width="14" height="20" rx="3" fill="none" {...g} />
      <path d="M45 32h.01M50 32h.01M55 32h.01" strokeWidth="2.6" />
    </>
  ),

  // ── 底面仕様 ──────────────────────────
  'bottomPanel:standard': <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />,
  'bottomPanel:board': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />
      <rect x="14" y="24" width="36" height="16" rx="2" strokeDasharray="3 2.4" {...g} />
    </>
  ),
  'bottomPanel:leather': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="4" fill="#f2e6cf" />
      <path d="M14 26l8-6M14 34l16-14M14 42l24-22M24 44l24-22M36 44l14-12" strokeWidth="1" />
    </>
  ),
  'reinforce:none': <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />,
  'reinforce:corner': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />
      <path d="M8 28v-6a4 4 0 014-4h6M56 28v-6a4 4 0 00-4-4h-6M8 36v6a4 4 0 004 4h6M56 36v6a4 4 0 01-4 4h-6" {...g} strokeWidth="3.2" />
    </>
  ),
  'reinforce:tape': (
    <>
      <rect x="8" y="18" width="48" height="28" rx="4" fill="#fffdf8" />
      <rect x="11.5" y="21.5" width="41" height="21" rx="2.5" {...g} strokeWidth="3" />
    </>
  ),

  // ── ロゴ・プレート・タグ ────────────────
  'logo:none': <Body />,
  'logo:engrave': (
    <Body>
      <text x="32" y="45" textAnchor="middle" fontSize="12" fill={GOLD} stroke="none" fontFamily="serif">
        DO
      </text>
      <path d="M22 48h20" {...g} strokeWidth="1" />
    </Body>
  ),
  'logo:plate': (
    <Body>
      <rect x="22" y="36" width="20" height="11" rx="1.6" fill="#fffdf8" {...g} />
      <path d="M26 40h12M28 44h8" {...g} strokeWidth="1" />
    </Body>
  ),
  'logo:tag': (
    <Body>
      <path d="M40 26v10" {...g} />
      <path d="M32 36h14l4 5-4 5H32z" fill="#f2e6cf" {...g} />
      <circle cx="35.5" cy="41" r="1.2" {...g} />
    </Body>
  ),
}

function StudSwatch({ fill }: { fill: string }) {
  return (
    <>
      <circle cx="32" cy="32" r="14" fill={fill} />
      <circle cx="32" cy="32" r="14" fill="none" {...g} />
      <path d="M25 27a9 9 0 0110-4" stroke="#fff" strokeOpacity="0.75" strokeWidth="2" />
    </>
  )
}

interface OptionArtProps {
  specKey: string
  optionId: string
  className?: string
}

export function hasOptionArt(specKey: string, optionId: string): boolean {
  return `${specKey}:${optionId}` in ART
}

export function OptionArt({ specKey, optionId, className }: OptionArtProps) {
  const art = ART[`${specKey}:${optionId}`]
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke={NAVY}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {art ?? <Body />}
    </svg>
  )
}
