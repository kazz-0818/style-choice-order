import type { SVGProps } from 'react'
import { getColorHex } from '../data/colors'
import type { BagTemplateId, LayerColors } from '../types/bag'

export interface BagPreviewProps {
  templateId: BagTemplateId
  layerColors: LayerColors
  handleTypeId: string
  decorationId: string
}

const TRANSITION = 'transition-[fill] duration-300 ease-out'

function LayerRect({
  fill,
  ...props
}: SVGProps<SVGRectElement> & { fill: string }) {
  return <rect fill={fill} className={TRANSITION} {...props} />
}

function LayerPath({
  fill,
  ...props
}: SVGProps<SVGPathElement> & { fill: string }) {
  return <path fill={fill} className={TRANSITION} {...props} />
}

function TotePreview({
  colors,
  handleTypeId,
  decorationId,
}: {
  colors: Record<keyof LayerColors, string>
  handleTypeId: string
  decorationId: string
}) {
  const c = (key: keyof LayerColors) => getColorHex(colors[key])
  const showPocket = decorationId === 'front-pocket'
  const showStitch = decorationId === 'stitch-accent'
  const showPlate = decorationId === 'metal-plate'
  const showCharm = decorationId === 'charm'
  const isStrap = handleTypeId === 'shoulder-strap'
  const isChain = handleTypeId === 'chain-handle'
  const isLong = handleTypeId === 'long-handle'

  return (
    <svg viewBox="0 0 320 380" className="h-full w-full max-h-[420px]" aria-label="トートバッグプレビュー">
      <ellipse cx="160" cy="355" rx="95" ry="12" fill="#000" opacity="0.06" />
      {/* bottom */}
      <LayerPath
        fill={c('bottom')}
        d="M 70 295 Q 70 320 160 320 Q 250 320 250 295 L 250 285 L 70 285 Z"
      />
      {/* side */}
      <LayerPath
        fill={c('side')}
        d="M 58 120 L 70 285 L 70 120 Z"
        opacity={0.92}
      />
      <LayerPath
        fill={c('side')}
        d="M 262 120 L 250 285 L 250 120 Z"
        opacity={0.88}
      />
      {/* body */}
      <LayerPath
        fill={c('body')}
        d="M 70 120 L 70 285 L 250 285 L 250 120 Q 250 95 160 88 Q 70 95 70 120 Z"
      />
      {showPocket && (
        <LayerRect fill={c('accent')} x="115" y="175" width="90" height="70" rx="6" opacity={0.85} />
      )}
      {showStitch && (
        <path
          d="M 85 135 L 235 135 M 85 270 L 235 270"
          fill="none"
          stroke={c('accent')}
          strokeWidth="2"
          strokeDasharray="6 4"
          className={TRANSITION}
        />
      )}
      {showPlate && (
        <LayerRect fill={c('metal')} x="135" y="200" width="50" height="18" rx="3" />
      )}
      {showCharm && (
        <circle cx="255" cy="200" r="8" fill={c('accent')} className={TRANSITION} />
      )}
      {/* handles */}
      {isStrap ? (
        <LayerPath
          fill={c('handle')}
          d="M 55 125 Q 20 200 55 300 L 65 298 Q 35 200 68 128 Z"
        />
      ) : isChain ? (
        <>
          <path
            d="M 100 95 L 100 75 M 110 90 L 110 70 M 120 95 L 120 75"
            stroke={c('metal')}
            strokeWidth="3"
            fill="none"
            className={TRANSITION}
          />
          <path
            d="M 200 95 L 200 75 M 210 90 L 210 70 M 220 95 L 220 75"
            stroke={c('metal')}
            strokeWidth="3"
            fill="none"
            className={TRANSITION}
          />
        </>
      ) : (
        <>
          <LayerPath
            fill="none"
            stroke={c('handle')}
            strokeWidth={isLong ? 10 : 14}
            d={
              isLong
                ? 'M 95 100 Q 95 45 130 38 Q 160 32 190 38 Q 225 45 225 100'
                : 'M 110 105 Q 110 55 160 48 Q 210 55 210 105'
            }
          />
          <LayerPath
            fill="none"
            stroke={c('handle')}
            strokeWidth={isLong ? 10 : 14}
            d={
              isLong
                ? 'M 95 100 Q 95 45 130 38'
                : 'M 110 105 Q 110 55 160 48'
            }
          />
        </>
      )}
      {/* metal */}
      <circle cx="72" cy="200" r="5" fill={c('metal')} className={TRANSITION} />
      <circle cx="248" cy="200" r="5" fill={c('metal')} className={TRANSITION} />
      <LayerRect fill={c('metal')} x="150" y="108" width="20" height="12" rx="2" />
    </svg>
  )
}

function MiniHandPreview({
  colors,
  handleTypeId,
  decorationId,
}: {
  colors: Record<keyof LayerColors, string>
  handleTypeId: string
  decorationId: string
}) {
  const c = (key: keyof LayerColors) => getColorHex(colors[key])
  const showStitch = decorationId === 'stitch-accent'
  const showPlate = decorationId === 'metal-plate'
  const isChain = handleTypeId === 'chain-handle'

  return (
    <svg viewBox="0 0 320 380" className="h-full w-full max-h-[420px]" aria-label="ミニハンドバッグプレビュー">
      <ellipse cx="160" cy="355" rx="70" ry="10" fill="#000" opacity="0.06" />
      <LayerPath fill={c('bottom')} d="M 105 285 L 215 285 L 210 310 L 110 310 Z" />
      <LayerPath fill={c('side')} d="M 98 140 L 105 285 L 115 140 Z" opacity={0.9} />
      <LayerPath fill={c('side')} d="M 222 140 L 215 285 L 205 140 Z" opacity={0.85} />
      <LayerPath
        fill={c('body')}
        d="M 115 140 L 105 285 L 215 285 L 205 140 Q 205 115 160 108 Q 115 115 115 140 Z"
      />
      <LayerPath
        fill={c('body')}
        d="M 115 140 Q 115 100 160 92 Q 205 100 205 140 L 205 155 L 115 155 Z"
        opacity={0.95}
      />
      {showStitch && (
        <path
          d="M 125 155 Q 160 165 195 155"
          fill="none"
          stroke={c('accent')}
          strokeWidth="2"
          strokeDasharray="5 3"
          className={TRANSITION}
        />
      )}
      {showPlate && (
        <LayerRect fill={c('metal')} x="142" y="175" width="36" height="14" rx="2" />
      )}
      {decorationId === 'charm' && (
        <circle cx="208" cy="220" r="6" fill={c('accent')} className={TRANSITION} />
      )}
      {decorationId === 'front-pocket' && (
        <LayerRect fill={c('accent')} x="130" y="200" width="60" height="45" rx="5" opacity={0.8} />
      )}
      {isChain ? (
        <path
          d="M 120 95 L 120 70 M 130 88 L 130 65 M 140 95 L 140 70 M 180 95 L 180 70 M 190 88 L 190 65 M 200 95 L 200 70"
          stroke={c('metal')}
          strokeWidth="2.5"
          fill="none"
          className={TRANSITION}
        />
      ) : (
        <LayerPath
          fill="none"
          stroke={c('handle')}
          strokeWidth="12"
          strokeLinecap="round"
          d="M 125 100 Q 125 60 160 52 Q 195 60 195 100"
        />
      )}
      <LayerRect fill={c('metal')} x="148" y="128" width="24" height="16" rx="3" />
      <circle cx="108" cy="210" r="4" fill={c('metal')} className={TRANSITION} />
      <circle cx="212" cy="210" r="4" fill={c('metal')} className={TRANSITION} />
    </svg>
  )
}

function ShoulderPreview({
  colors,
  handleTypeId,
  decorationId,
}: {
  colors: Record<keyof LayerColors, string>
  handleTypeId: string
  decorationId: string
}) {
  const c = (key: keyof LayerColors) => getColorHex(colors[key])
  const showStitch = decorationId === 'stitch-accent'
  const useChain = handleTypeId === 'chain-handle'

  return (
    <svg viewBox="0 0 320 380" className="h-full w-full max-h-[420px]" aria-label="ショルダーバッグプレビュー">
      <ellipse cx="160" cy="355" rx="80" ry="11" fill="#000" opacity="0.06" />
      {/* strap */}
      {useChain ? (
        <path
          d="M 45 80 L 45 50 M 55 75 L 55 45 M 275 80 L 275 50 M 265 75 L 265 45"
          stroke={c('handle')}
          strokeWidth="3"
          fill="none"
          className={TRANSITION}
        />
      ) : (
        <LayerPath
          fill={c('handle')}
          d="M 40 85 Q 25 180 45 290 L 55 288 Q 38 180 52 88 Z M 280 85 Q 295 180 275 290 L 265 288 Q 282 180 268 88 Z"
          opacity={0.95}
        />
      )}
      <LayerPath fill={c('bottom')} d="M 90 278 L 230 278 L 225 305 L 95 305 Z" />
      <LayerPath fill={c('side')} d="M 82 130 L 90 278 L 100 130 Z" opacity={0.9} />
      <LayerPath fill={c('side')} d="M 238 130 L 230 278 L 220 130 Z" opacity={0.88} />
      <LayerPath
        fill={c('body')}
        d="M 100 130 L 90 278 L 230 278 L 220 130 Q 220 108 160 102 Q 100 108 100 130 Z"
      />
      {decorationId === 'front-pocket' && (
        <LayerRect fill={c('accent')} x="125" y="175" width="70" height="55" rx="5" opacity={0.85} />
      )}
      {showStitch && (
        <path
          d="M 105 145 L 215 145"
          fill="none"
          stroke={c('accent')}
          strokeWidth="2"
          strokeDasharray="5 4"
          className={TRANSITION}
        />
      )}
      {decorationId === 'metal-plate' && (
        <LayerRect fill={c('metal')} x="140" y="195" width="40" height="14" rx="2" />
      )}
      <LayerRect fill={c('metal')} x="148" y="118" width="24" height="10" rx="2" />
      <circle cx="94" cy="200" r="4.5" fill={c('metal')} className={TRANSITION} />
      <circle cx="226" cy="200" r="4.5" fill={c('metal')} className={TRANSITION} />
      {decorationId === 'charm' && (
        <circle cx="232" cy="240" r="7" fill={c('accent')} className={TRANSITION} />
      )}
    </svg>
  )
}

export function BagPreview({
  templateId,
  layerColors,
  handleTypeId,
  decorationId,
}: BagPreviewProps) {
  const shared = { colors: layerColors, handleTypeId, decorationId }

  return (
    <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-stone bg-gradient-to-b from-white to-stone/40 p-6 sm:p-8">
      {templateId === 'tote' && <TotePreview {...shared} />}
      {templateId === 'mini-hand' && <MiniHandPreview {...shared} />}
      {templateId === 'shoulder' && <ShoulderPreview {...shared} />}
    </div>
  )
}
