import { GOLD, NAVY } from './icons'

/** 「DO」モノグラム（Desfy Origouf） */
export function DoLogo({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Desfy Origouf"
    >
      <circle cx="40" cy="40" r="37" fill="none" stroke={GOLD} strokeWidth="1.2" />
      <circle cx="40" cy="40" r="33" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.7" />
      <text
        x="40"
        y="51"
        textAnchor="middle"
        fontSize="34"
        fontStyle="italic"
        fill={GOLD}
        fontFamily="'Noto Serif JP', Georgia, serif"
        letterSpacing="-3"
      >
        DO
      </text>
    </svg>
  )
}

/** 金の細線＋中央の飾り */
export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold sm:w-28" />
      <svg viewBox="0 0 40 16" width="40" height="16" fill="none" stroke={GOLD} strokeWidth="1.2">
        <path d="M20 8m-3 0a3 3 0 106 0 3 3 0 10-6 0" />
        <path d="M17 8C12 8 11 3 6 3M23 8c5 0 6-5 11-5M17 8C12 8 11 13 6 13M23 8c5 0 6 5 11 5" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold sm:w-28" />
    </div>
  )
}

/** 表紙風の金枠コーナー */
export function FrameCorner({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      fill="none"
      stroke={GOLD}
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 56V18C4 10 10 4 18 4h38" />
      <path d="M10 56V22c0-7 5-12 12-12h34" opacity="0.6" />
      <path d="M16 16c0-5 6-7 9-4s0 8-4 8-6-3-5-4" />
      <path d="M26 26c6 0 9-4 8-8M26 26c0 6 4 9 8 8" opacity="0.8" />
    </svg>
  )
}

/** 素材のイラスト（本革・合皮・布・化学繊維） */
export function MaterialArt({ id, className }: { id: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true">
      {id === 'genuine-leather' && (
        <g strokeLinejoin="round" strokeLinecap="round">
          <path d="M14 30l10-6 8 5 8-7 10 5 8-3 6 12-8 6 3 14-13-3-8 3-9-4-12 2 3-13-8-6z" fill="#b8865a" stroke={NAVY} strokeWidth="1.4" />
          <path d="M58 22l10-5 8 6 9-5 10 6 6 14-9 6 2 12-14-2-8 4-8-4-11 1 3-12-7-7z" fill="#8a3c3c" stroke={NAVY} strokeWidth="1.4" />
          <path d="M22 44c4 3 9 3 13 0M70 42c4 3 9 3 13 0" fill="none" stroke="#f3e2c7" strokeWidth="1.2" strokeDasharray="2 2.5" />
        </g>
      )}
      {id === 'synthetic-leather' && (
        <g stroke={NAVY} strokeWidth="1.4">
          {[
            [20, '#e59db5'],
            [52, '#9a7fc4'],
            [84, '#5f8fc7'],
          ].map(([x, c]) => (
            <g key={String(x)}>
              <rect x={Number(x) - 12} y="16" width="24" height="48" fill={String(c)} />
              <ellipse cx={x as number} cy="16" rx="12" ry="5" fill={String(c)} />
              <ellipse cx={x as number} cy="16" rx="5" ry="2" fill="#fffdf8" />
              <ellipse cx={x as number} cy="64" rx="12" ry="5" fill={String(c)} />
            </g>
          ))}
        </g>
      )}
      {id === 'fabric' && (
        <g stroke={NAVY} strokeWidth="1.4">
          <rect x="12" y="14" width="42" height="42" rx="2" fill="#f0d8a0" />
          <path d="M12 28h42M12 42h42M26 14v42M40 14v42" stroke="#c0503c" strokeWidth="3" opacity="0.7" />
          <rect x="60" y="24" width="44" height="42" rx="2" fill="#a9c3d8" />
          <path d="M60 38h44M60 52h44" stroke="#fff" strokeWidth="3" opacity="0.8" />
          <path d="M66 10v14M72 10v14M78 10v14" stroke={GOLD} strokeWidth="2" />
        </g>
      )}
      {id === 'fur' && (
        <g stroke={NAVY} strokeWidth="1.2" strokeLinecap="round">
          <rect x="12" y="12" width="96" height="56" rx="8" fill="#fbf8f2" />
          {Array.from({ length: 34 }).map((_, i) => {
            const x = 18 + (i % 9) * 10.5 + (Math.floor(i / 9) % 2) * 4
            const y = 22 + Math.floor(i / 9) * 13
            return <path key={i} d={`M${x} ${y + 8}q2 -6 ${i % 2 ? 3 : -3} -9`} fill="none" stroke="#c9bda8" strokeWidth="1.4" />
          })}
          <path d="M12 20c8 4 16-3 24 1s16-3 24 1 16-3 24 1 16-2 24 0" fill="none" stroke="#8b6f4e" strokeWidth="2" />
        </g>
      )}
      {id === 'tech-fiber' && (
        <g stroke={NAVY} strokeWidth="1.2">
          <rect x="10" y="10" width="100" height="60" rx="3" fill="#c9ced6" />
          <path d="M10 25h100M10 40h100M10 55h100M35 10v60M60 10v60M85 10v60" stroke="#8d95a3" strokeWidth="1" />
          {[
            [30, 22],
            [72, 34],
            [92, 18],
            [50, 52],
          ].map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              d={`M${x} ${y - 7}C${x - 6} ${y + 1} ${x - 6} ${y + 8} ${x} ${y + 8}s6-7 0-15z`}
              fill="#7fb4dc"
            />
          ))}
        </g>
      )}
    </svg>
  )
}

/** 製作の流れ（5ステップ）用のイラスト */
export function FlowArt({ step, className }: { step: number; className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden="true" strokeLinejoin="round" strokeLinecap="round">
      <rect width="160" height="110" rx="10" fill="#f3ede0" />
      {step === 1 && (
        <g stroke={NAVY} strokeWidth="1.6">
          <path d="M14 78h132" />
          <rect x="18" y="70" width="124" height="8" rx="2" fill="#d7b98a" />
          <path d="M26 78v20M134 78v20" />
          {/* 左の人 */}
          <circle cx="50" cy="36" r="10" fill="#f7dcc0" />
          <path d="M32 70c0-16 8-22 18-22s18 6 18 22z" fill={NAVY} />
          {/* 右の人 */}
          <circle cx="110" cy="36" r="10" fill="#f7dcc0" />
          <path d="M92 70c0-16 8-22 18-22s18 6 18 22z" fill="#5f6675" />
          {/* 吹き出し */}
          <path d="M62 14h30a5 5 0 015 5v10a5 5 0 01-5 5H76l-6 6v-6h-8a5 5 0 01-5-5V19a5 5 0 015-5z" fill="#fffdf8" />
          <path d="M66 22h22M66 28h14" stroke={GOLD} />
          {/* 手元のバッグスケッチ */}
          <rect x="66" y="62" width="28" height="8" rx="1" fill="#fffdf8" />
          <path d="M72 66h16" stroke={GOLD} />
        </g>
      )}
      {step === 2 && (
        <g stroke={NAVY} strokeWidth="1.6">
          <path d="M14 14h132" strokeWidth="3" />
          {[
            [28, '#a86f45', 60],
            [50, '#1e3a68', 74],
            [72, '#8a3c3c', 56],
            [94, '#d9b98a', 70],
            [116, '#4a6a52', 62],
          ].map(([x, c, len]) => (
            <g key={String(x)}>
              <path d={`M${x} 14v10`} />
              <path d={`M${Number(x) - 9} 24h18v${len}l-9 8-9-8z`} fill={String(c)} />
              <circle cx={x as number} cy="30" r="1.6" fill="#fffdf8" />
            </g>
          ))}
          <path d="M130 62l6-6 6 6-6 8z" fill={GOLD} stroke="none" opacity="0.0" />
        </g>
      )}
      {step === 3 && (
        <g stroke={NAVY} strokeWidth="1.6">
          {/* ノートPC */}
          <rect x="18" y="26" width="72" height="46" rx="3" fill="#fffdf8" />
          <path d="M8 78h92l-6-6H14z" fill="#d7b98a" />
          <path d="M28 38h34M28 46h44M28 54h26" stroke={GOLD} />
          <rect x="74" y="34" width="10" height="26" rx="1" fill="#e6dfd0" />
          {/* 電卓 */}
          <rect x="102" y="24" width="40" height="64" rx="4" fill={NAVY} />
          <rect x="108" y="30" width="28" height="12" rx="1.5" fill="#dfe8d5" />
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => (
              <circle key={`${r}-${c}`} cx={112 + c * 10} cy={52 + r * 10} r="3" fill={GOLD} stroke="none" />
            )),
          )}
        </g>
      )}
      {step === 4 && (
        <g stroke={NAVY} strokeWidth="1.6">
          <rect x="18" y="82" width="124" height="10" rx="2" fill="#d7b98a" />
          <path d="M28 82V30h62a12 12 0 0112 12v40" fill="#fffdf8" />
          <path d="M90 30V16h28v10" fill="#fffdf8" />
          <path d="M104 26v40" />
          <circle cx="104" cy="70" r="3" fill={GOLD} stroke="none" />
          <path d="M40 46h34M40 56h22" stroke={GOLD} />
          {/* 革と縫い目 */}
          <path d="M76 82l8-14 30 0 8 14z" fill="#a86f45" />
          <path d="M82 76h30" stroke="#f3e2c7" strokeDasharray="2.6 2.6" />
        </g>
      )}
      {step === 5 && (
        <g stroke={NAVY} strokeWidth="1.6">
          <rect x="16" y="80" width="128" height="8" rx="2" fill="#d7b98a" />
          <path d="M26 88v8M134 88v8" />
          <path d="M22 50l24-10 24 10v30l-24 10-24-10z" fill="#d9b98a" />
          <path d="M22 50l24 10 24-10M46 60v30" />
          <path d="M70 60l26-10 30 10v20H70z" fill="#c9a06a" />
          <path d="M70 60h56M98 50v30" />
          <path d="M102 28c0-6 8-8 11-3 3-5 11-3 11 3 0 6-11 12-11 12s-11-6-11-12z" fill={GOLD} stroke="none" />
        </g>
      )}
    </svg>
  )
}
