import type { ReactNode } from 'react'

export const NAVY = '#1a2d4b'
export const GOLD = '#c5a059'

export type IconName =
  | 'zipper'
  | 'silhouette'
  | 'gusset'
  | 'handle'
  | 'padlock'
  | 'pocket'
  | 'studs'
  | 'belt'
  | 'flap'
  | 'clasp'
  | 'charm'
  | 'strap'
  | 'bottom'
  | 'hide'
  | 'synthetic'
  | 'fabric'
  | 'fiber'
  | 'sewing'
  | 'briefcase'
  | 'hearing'
  | 'swatches'
  | 'calculator'
  | 'box'
  | 'engraving'
  | 'plate'
  | 'tag'
  | 'support'
  | 'phone'
  | 'mail'
  | 'ruler'
  | 'palette'
  | 'check'
  | 'bag'

/** 48x48 の線画アイコン（stroke は currentColor） */
const PATHS: Record<IconName, ReactNode> = {
  zipper: (
    <>
      <path d="M24 5v30" />
      <path d="M18 10h12M18 16h12M18 22h12M18 28h12" />
      <rect x="19" y="35" width="10" height="9" rx="3" />
      <circle cx="24" cy="40" r="1.4" />
    </>
  ),
  silhouette: (
    <>
      <path d="M11 20h26l3 21H8z" />
      <path d="M17 20c0-9 14-9 14 0" />
      <path d="M4 44h4M40 44h4" strokeDasharray="1 3" />
    </>
  ),
  gusset: (
    <>
      <path d="M13 40V14l22 8v18z" />
      <path d="M13 14l8-6 22 8-8 6" />
      <path d="M6 40h4M6 14h4M8 14v26" />
    </>
  ),
  handle: (
    <>
      <path d="M10 26C10 6 38 6 38 26" />
      <rect x="6" y="26" width="36" height="16" rx="3" />
      <path d="M17 34h14" />
    </>
  ),
  padlock: (
    <>
      <rect x="10" y="21" width="28" height="21" rx="4" />
      <path d="M16 21v-6a8 8 0 0116 0v6" />
      <circle cx="24" cy="30" r="2.4" />
      <path d="M24 32v4" />
    </>
  ),
  pocket: (
    <>
      <rect x="7" y="7" width="34" height="34" rx="3" />
      <path d="M14 20h20v11a7 7 0 01-7 7h-6a7 7 0 01-7-7z" />
      <path d="M14 20l3-4M34 20l-3-4" />
    </>
  ),
  studs: (
    <>
      <rect x="6" y="12" width="36" height="24" rx="3" />
      <circle cx="13" cy="19" r="2.2" />
      <circle cx="35" cy="19" r="2.2" />
      <circle cx="13" cy="29" r="2.2" />
      <circle cx="35" cy="29" r="2.2" />
    </>
  ),
  belt: (
    <>
      <rect x="4" y="18" width="40" height="12" rx="2" />
      <rect x="17" y="13" width="14" height="22" rx="2.5" />
      <path d="M22 24h4" />
      <path d="M36 24h.01" />
    </>
  ),
  flap: (
    <>
      <rect x="9" y="12" width="30" height="29" rx="3" />
      <path d="M9 18l15 13 15-13" />
      <circle cx="24" cy="31" r="1.8" />
    </>
  ),
  clasp: (
    <>
      <rect x="10" y="14" width="28" height="20" rx="4" />
      <circle cx="24" cy="24" r="5" />
      <path d="M24 19v10M19 24h10" />
    </>
  ),
  charm: (
    <>
      <path d="M24 3v6" />
      <ellipse cx="24" cy="13" rx="2.6" ry="3.8" />
      <ellipse cx="24" cy="20.5" rx="2.6" ry="3.8" />
      <path d="M24 44c-6.5-4.5-10-8-10-12a5 5 0 0110-1.2A5 5 0 0134 32c0 4-3.5 7.5-10 12z" />
    </>
  ),
  strap: (
    <>
      <path d="M6 40V20A14 14 0 0120 6h8a14 14 0 0114 14v20" />
      <path d="M2 40h8M38 40h8" />
      <circle cx="6" cy="43" r="2.5" />
      <circle cx="42" cy="43" r="2.5" />
    </>
  ),
  bottom: (
    <>
      <path d="M8 22l4-11h24l4 11" />
      <path d="M6 22h36l-3 14H9z" />
      <path d="M12 42h24" strokeDasharray="2 3" />
    </>
  ),
  hide: (
    <>
      <path d="M9 12l8 4 7-7 7 7 8-4 5 10-7 5 2 13-10-2H19l-10 2 2-13-7-5z" transform="translate(-1 0)" />
      <path d="M20 24c2 3 6 3 8 0" />
    </>
  ),
  synthetic: (
    <>
      <ellipse cx="14" cy="24" rx="7" ry="15" />
      <path d="M14 9h26v30H14" />
      <path d="M14 15h20M14 33h20" strokeDasharray="1 3" />
    </>
  ),
  fabric: (
    <>
      <rect x="7" y="9" width="34" height="30" rx="2" />
      <path d="M7 19h34M7 29h34M18 9v30M30 9v30" />
    </>
  ),
  fiber: (
    <>
      <path d="M24 5C15 18 11 25 11 31a13 13 0 0026 0c0-6-4-13-13-26z" />
      <path d="M18 33a6 6 0 006 6" />
    </>
  ),
  sewing: (
    <>
      <path d="M5 35h38v7H5z" />
      <path d="M9 35V14h22a6 6 0 016 6v15" />
      <path d="M31 14V8h8" />
      <path d="M14 22h12M22 35v-8" />
      <path d="M36 35v6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="6" y="15" width="36" height="25" rx="3" />
      <path d="M17 15v-4a2 2 0 012-2h10a2 2 0 012 2v4" />
      <path d="M24 22l1.9 3.9 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z" />
    </>
  ),
  hearing: (
    <>
      <circle cx="15" cy="14" r="5" />
      <path d="M5 38c0-8 4-12 10-12s10 4 10 12" />
      <circle cx="34" cy="14" r="5" />
      <path d="M26 38c0-6 3-9 8-9s9 3 9 9" />
      <path d="M2 42h44" />
    </>
  ),
  swatches: (
    <>
      <path d="M4 6h40" />
      <path d="M10 6v22l4 6 4-6V6M22 6v26l4 6 4-6V6M34 6v18l3 5 3-5V6" />
    </>
  ),
  calculator: (
    <>
      <rect x="11" y="4" width="26" height="40" rx="3" />
      <rect x="16" y="9" width="16" height="8" rx="1" />
      <path d="M17 24h.01M24 24h.01M31 24h.01M17 31h.01M24 31h.01M31 31h.01M17 38h.01M24 38h.01M31 38h.01" strokeWidth="3" />
    </>
  ),
  box: (
    <>
      <path d="M5 15l19-9 19 9v19l-19 9-19-9z" />
      <path d="M5 15l19 9 19-9M24 24v19" />
      <path d="M14 10.5l19 9" />
    </>
  ),
  engraving: (
    <>
      <path d="M8 40l3-11L33 7l8 8-22 22z" />
      <path d="M28 12l8 8" />
      <path d="M6 44h14" />
    </>
  ),
  plate: (
    <>
      <rect x="5" y="14" width="38" height="20" rx="3" />
      <circle cx="11" cy="24" r="1.8" />
      <circle cx="37" cy="24" r="1.8" />
      <path d="M18 22h12M20 27h8" />
    </>
  ),
  tag: (
    <>
      <path d="M5 13h23l14 11-14 11H5z" />
      <circle cx="12" cy="24" r="2.4" />
      <path d="M19 21h10M19 27h7" />
    </>
  ),
  support: (
    <>
      <path d="M24 41C10 31 6 23 6 17a9 9 0 0118-3 9 9 0 0118 3c0 6-4 14-18 24z" />
      <path d="M14 22l6 5 4-3 4 3 6-5" />
    </>
  ),
  phone: (
    <path d="M12 6h7l3 9-4.5 3a22 22 0 0012 12L32 25.5l9 3v7a4 4 0 01-4 4A31 31 0 018 10a4 4 0 014-4z" />
  ),
  mail: (
    <>
      <rect x="5" y="11" width="38" height="26" rx="3" />
      <path d="M5 14l19 14 19-14" />
    </>
  ),
  ruler: (
    <>
      <path d="M7 32L32 7l9 9L16 41z" />
      <path d="M14 25l4 4M20 19l3 3M26 13l4 4" />
    </>
  ),
  palette: (
    <>
      <path d="M24 5a19 19 0 000 38c3.5 0 4.5-2.3 3.5-4.5S28 34 31.5 34H37a7 7 0 007-7C44 14 35 5 24 5z" />
      <circle cx="14" cy="24" r="2.2" />
      <circle cx="19" cy="14" r="2.2" />
      <circle cx="30" cy="13" r="2.2" />
    </>
  ),
  check: <path d="M10 25l9 9 19-20" />,
  bag: (
    <>
      <path d="M9 17h30l3 25H6z" />
      <path d="M17 17V13a7 7 0 0114 0v4" />
    </>
  ),
}

interface IconProps {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
}

export function Icon({ name, size = 32, className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

/** 提案書の丸バッジ風アイコン（紺の円＋金の細枠＋金の線画） */
export function IconBadge({
  name,
  size = 56,
  className = '',
}: {
  name: IconName
  size?: number
  className?: string
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, backgroundColor: NAVY, color: GOLD }}
      aria-hidden="true"
    >
      <span
        className="absolute rounded-full"
        style={{ inset: Math.max(3, size * 0.07), border: `1px solid ${GOLD}`, opacity: 0.7 }}
      />
      <Icon name={name} size={size * 0.52} strokeWidth={1.8} />
    </span>
  )
}
