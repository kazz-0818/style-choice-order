import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getColorHex } from '../data/colors'
import type { BagTemplateId, LayerColors } from '../types/bag'
import type { ModelViewerElement } from '../types/model-viewer'
import { applyLayerColorsToScene } from '../utils/threeD/applyLayerColors'
import { checkModelExists } from '../utils/threeD/checkModelExists'
import { CUSTOM_BAG_MODEL_URL, MESH_LAYER_NAMES } from '../utils/threeD/modelConfig'

export interface ThreeDBagPreviewProps {
  layerColors: LayerColors
  /** 将来: テンプレート別GLB切替用 */
  templateId?: BagTemplateId
}

type PreviewStatus = 'placeholder' | 'loading-glb' | 'ready' | 'error'

const FRAME_CLASS =
  'mx-auto flex aspect-[4/5] w-full max-w-[185px] items-center justify-center rounded-2xl border border-stone bg-gradient-to-b from-[#faf8f5] via-white to-stone/50 p-3 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:max-w-none sm:p-8'

function PreviewBadge() {
  return (
    <span className="absolute top-3 right-3 z-20 rounded-full border border-gold/40 bg-white/95 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-gold uppercase shadow-sm backdrop-blur-sm">
      3D Preview β
    </span>
  )
}

function ColorSwatchRow({ layerColors }: { layerColors: LayerColors }) {
  const layers = MESH_LAYER_NAMES.map((name) => ({
    name,
    hex: getColorHex(layerColors[name]),
  }))

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {layers.map((layer) => (
        <span
          key={layer.name}
          title={layer.name}
          className="h-4 w-4 rounded-full border border-charcoal/10 shadow-sm sm:h-5 sm:w-5"
          style={{ backgroundColor: layer.hex }}
        />
      ))}
    </div>
  )
}

function Css3dBagScene({ layerColors }: { layerColors: LayerColors }) {
  const dragRef = useRef({ active: false, startX: 0, startY: 0, rotX: -12, rotY: 24 })
  const [rotation, setRotation] = useState({ x: -12, y: 24 })

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    dragRef.current = {
      ...dragRef.current,
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [rotation.x, rotation.y])

  const onPointerMove = useCallback((event: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    setRotation({
      x: Math.max(-35, Math.min(35, dragRef.current.rotX - dy * 0.35)),
      y: dragRef.current.rotY + dx * 0.45,
    })
  }, [])

  const onPointerUp = useCallback((event: React.PointerEvent) => {
    dragRef.current.active = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  const body = getColorHex(layerColors.body)
  const side = getColorHex(layerColors.side)
  const bottom = getColorHex(layerColors.bottom)
  const handle = getColorHex(layerColors.handle)
  const metal = getColorHex(layerColors.metal)
  const accent = getColorHex(layerColors.accent)

  return (
    <div
      className="three-d-scene relative h-36 w-full cursor-grab touch-none select-none active:cursor-grabbing sm:h-48"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="3Dプレビュー（ドラッグで回転）"
    >
      <div className="three-d-scene__stage">
        <div
          className="three-d-scene__object"
          style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
          <div className="three-d-bag">
            <div className="three-d-bag__face three-d-bag__face--front" style={{ background: body }} />
            <div className="three-d-bag__face three-d-bag__face--back" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--left" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--right" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--bottom" style={{ background: bottom }} />
            <div className="three-d-bag__face three-d-bag__face--top" style={{ background: accent }} />
            <div className="three-d-bag__handle" style={{ background: handle }} />
            <div className="three-d-bag__metal" style={{ background: metal }} />
          </div>
        </div>
      </div>
      <p className="absolute inset-x-0 bottom-0 text-center text-[10px] tracking-wide text-warm-gray/70">
        ドラッグで回転
      </p>
    </div>
  )
}

function PreviewPlaceholder({
  layerColors,
  title,
  description,
  hint,
}: {
  layerColors: LayerColors
  title: string
  description: string
  hint?: string
}) {
  return (
    <div className={`${FRAME_CLASS} relative overflow-hidden`}>
      <PreviewBadge />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(184,149,106,0.08),transparent_55%)]" />
      <div className="relative flex w-full flex-col items-center px-2 text-center">
        <Css3dBagScene layerColors={layerColors} />
        <p className="mt-3 font-serif text-sm text-charcoal sm:text-base">{title}</p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-warm-gray sm:text-sm">
          {description}
        </p>
        {hint && (
          <p className="mt-2 text-[10px] tracking-wide text-warm-gray/80 sm:text-xs">{hint}</p>
        )}
        <ColorSwatchRow layerColors={layerColors} />
      </div>
    </div>
  )
}

export function ThreeDBagPreview({ layerColors, templateId: _templateId }: ThreeDBagPreviewProps) {
  const viewerRef = useRef<ModelViewerElement>(null)
  const [status, setStatus] = useState<PreviewStatus>('placeholder')
  const [shouldLoadGlb, setShouldLoadGlb] = useState(false)

  useEffect(() => {
    let cancelled = false

    checkModelExists(CUSTOM_BAG_MODEL_URL).then((exists) => {
      if (cancelled) return
      if (exists) {
        setShouldLoadGlb(true)
        setStatus('loading-glb')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !shouldLoadGlb) return

    const handleLoad = () => {
      if (viewer.model) {
        applyLayerColorsToScene(viewer.model, layerColors)
      }
      setStatus('ready')
    }

    const handleError = (event: Event) => {
      console.error('[ThreeDBagPreview] Failed to load GLB model:', event)
      setStatus('error')
      setShouldLoadGlb(false)
    }

    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('error', handleError)

    if (viewer.model) {
      handleLoad()
    }

    return () => {
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('error', handleError)
    }
  }, [shouldLoadGlb, layerColors])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer?.model || status !== 'ready') return
    applyLayerColorsToScene(viewer.model, layerColors)
  }, [layerColors, status])

  if (status === 'placeholder') {
    return (
      <PreviewPlaceholder
        layerColors={layerColors}
        title="カラーイメージ"
        description="選択したカラーの組み合わせを3Dで確認できます。ドラッグで角度を変えてご覧ください。"
      />
    )
  }

  if (status === 'error') {
    return (
      <PreviewPlaceholder
        layerColors={layerColors}
        title="3Dモデルを読み込めませんでした"
        description="カラーイメージ表示に切り替えています。しばらくしてから再度お試しください。"
      />
    )
  }

  return (
    <div className={`${FRAME_CLASS} relative !p-2 sm:!p-4`}>
      <PreviewBadge />
      <p className="absolute top-3 left-3 z-10 hidden text-[10px] tracking-widest text-warm-gray lg:block">
        ドラッグで回転 · ピンチでズーム
      </p>
      {status === 'loading-glb' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
          <p className="text-xs tracking-wide text-warm-gray">3Dモデルを読み込み中…</p>
        </div>
      )}
      <model-viewer
        ref={viewerRef}
        src={CUSTOM_BAG_MODEL_URL}
        alt="オーダーメイドバッグ 3Dプレビュー"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="0.45"
        exposure="1"
        interaction-prompt="none"
        className="three-d-model-viewer h-full min-h-[220px] w-full rounded-xl bg-gradient-to-b from-white to-stone/20 sm:min-h-[360px]"
      />
    </div>
  )
}
