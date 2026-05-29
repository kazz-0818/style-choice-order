import '@google/model-viewer'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getColorHex } from '../data/colors'
import type { BagCustomization } from '../types/bag'
import type { ModelViewerElement } from '../types/model-viewer'
import { getPreviewCssModifiers, getPreviewVisualConfig } from '../utils/preview/previewVisualConfig'
import {
  applyCustomizationToScene,
} from '../utils/threeD/applyCustomizationToScene'
import { CUSTOM_BAG_MODEL_URL, MESH_LAYER_NAMES } from '../utils/threeD/modelConfig'

export interface ThreeDBagPreviewProps {
  customization: BagCustomization
}

type PreviewStatus = 'loading-glb' | 'ready' | 'fallback'

const LOAD_TIMEOUT_MS = 20_000

const FRAME_CLASS =
  'three-d-preview-frame relative mx-auto w-full max-w-[240px] rounded-2xl border border-stone bg-gradient-to-b from-[#faf8f5] via-white to-stone/50 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:max-w-none'

function ColorSwatchRow({ customization }: { customization: BagCustomization }) {
  const layers = MESH_LAYER_NAMES.map((name) => ({
    name,
    hex: getColorHex(customization.layerColors[name]),
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

function Css3dBagScene({ customization }: { customization: BagCustomization }) {
  const dragRef = useRef({ active: false, startX: 0, startY: 0, rotX: -12, rotY: 24 })
  const [rotation, setRotation] = useState({ x: -12, y: 24 })
  const visual = getPreviewVisualConfig(customization)
  const cssMods = getPreviewCssModifiers(customization)

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

  const { layerColors } = customization
  const body = getColorHex(layerColors.body)
  const side = getColorHex(layerColors.side)
  const bottom = getColorHex(layerColors.bottom)
  const handle = getColorHex(layerColors.handle)
  const metal = getColorHex(layerColors.metal)
  const accent = getColorHex(layerColors.accent)
  const accentVisible = visual.meshes.accent.visible
  const handleStyle = visual.meshes.handle
  const bagScale = visual.templateScale

  return (
    <div
      className="three-d-scene relative h-44 w-full cursor-grab touch-none select-none active:cursor-grabbing sm:h-48"
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
          <div
            className={['three-d-bag', ...cssMods].join(' ')}
            style={{ transform: `scale(${bagScale})` }}
          >
            <div className="three-d-bag__face three-d-bag__face--front" style={{ background: body }} />
            <div className="three-d-bag__face three-d-bag__face--back" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--left" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--right" style={{ background: side }} />
            <div className="three-d-bag__face three-d-bag__face--bottom" style={{ background: bottom }} />
            <div className="three-d-bag__face three-d-bag__face--top" style={{ background: accent }} />
            {accentVisible && (
              <div
                className="three-d-bag__face three-d-bag__face--accent"
                style={{
                  background: visual.accentUsesMetal ? metal : accent,
                  transform: `translateZ(0.42rem) scale(${visual.meshes.accent.scale[0]}, ${visual.meshes.accent.scale[1]})`,
                }}
              />
            )}
            <div
              className="three-d-bag__handle"
              style={{
                background: customization.handleTypeId === 'chain-handle'
                  ? `linear-gradient(135deg, ${metal}, ${handle})`
                  : handle,
                transform: `translateZ(24px) scale(${handleStyle.scale[0]}, ${handleStyle.scale[1]}) rotateZ(${handleStyle.rotation[2]}rad)`,
              }}
            />
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

function PreviewFallback({ customization }: { customization: BagCustomization }) {
  return (
    <div className={`${FRAME_CLASS} overflow-hidden p-4 sm:p-8`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(184,149,106,0.08),transparent_55%)]" />
      <div className="relative flex w-full flex-col items-center px-2 pt-6 text-center">
        <Css3dBagScene customization={customization} />
        <p className="mt-3 font-serif text-sm text-charcoal sm:text-base">カラーイメージ</p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-warm-gray sm:text-sm">
          選択したカラーの組み合わせを3Dで確認できます。ドラッグで角度を変えてご覧ください。
        </p>
        <ColorSwatchRow customization={customization} />
      </div>
    </div>
  )
}

function refreshViewerLayout(viewer: ModelViewerElement) {
  const updateFraming = (viewer as ModelViewerElement & { updateFraming?: () => void }).updateFraming
  updateFraming?.()
  window.dispatchEvent(new Event('resize'))
}

export function ThreeDBagPreview({ customization }: ThreeDBagPreviewProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const customizationRef = useRef(customization)
  customizationRef.current = customization

  const [status, setStatus] = useState<PreviewStatus>('loading-glb')
  const [viewerNode, setViewerNode] = useState<ModelViewerElement | null>(null)

  const applyCustomization = useCallback((viewer: ModelViewerElement) => {
    if (!viewer.model) return
    try {
      applyCustomizationToScene(viewer.model, customizationRef.current)
    } catch (error) {
      console.warn('[ThreeDBagPreview] Could not apply customization:', error)
    }
  }, [])

  const markReady = useCallback(() => {
    if (!viewerNode) return
    applyCustomization(viewerNode)
    refreshViewerLayout(viewerNode)
    setStatus('ready')
  }, [applyCustomization, viewerNode])

  const handleModelError = useCallback((event: Event) => {
    console.error('[ThreeDBagPreview] Failed to load GLB model:', event)
    setStatus('fallback')
  }, [])

  useEffect(() => {
    if (!viewerNode) return

    const onLoad = () => markReady()
    const onError = (event: Event) => handleModelError(event)

    viewerNode.addEventListener('load', onLoad)
    viewerNode.addEventListener('error', onError)

    if (viewerNode.model) {
      onLoad()
    }

    return () => {
      viewerNode.removeEventListener('load', onLoad)
      viewerNode.removeEventListener('error', onError)
    }
  }, [viewerNode, markReady, handleModelError])

  useEffect(() => {
    if (!viewerNode || status !== 'loading-glb') return

    const pollId = window.setInterval(() => {
      if (viewerNode.model) {
        markReady()
      }
    }, 300)

    return () => window.clearInterval(pollId)
  }, [viewerNode, status, markReady])

  useEffect(() => {
    if (!viewerNode || status !== 'ready') return
    applyCustomization(viewerNode)
    refreshViewerLayout(viewerNode)
  }, [customization, status, applyCustomization, viewerNode])

  useEffect(() => {
    if (status !== 'loading-glb') return

    const timeoutId = window.setTimeout(() => {
      console.error('[ThreeDBagPreview] GLB load timed out')
      setStatus('fallback')
    }, LOAD_TIMEOUT_MS)

    return () => window.clearTimeout(timeoutId)
  }, [status])

  useEffect(() => {
    if (!viewerNode || status !== 'ready') return

    refreshViewerLayout(viewerNode)

    const frame = frameRef.current
    if (!frame || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      refreshViewerLayout(viewerNode)
    })
    observer.observe(frame)

    return () => observer.disconnect()
  }, [viewerNode, status])

  if (status === 'fallback') {
    return <PreviewFallback customization={customization} />
  }

  return (
    <div ref={frameRef} className={FRAME_CLASS}>
      <p className="absolute top-3 left-3 z-10 text-[10px] tracking-widest text-warm-gray lg:hidden">
        ピンチで拡大 · ドラッグで回転
      </p>
      <p className="absolute top-3 left-3 z-10 hidden text-[10px] tracking-widest text-warm-gray lg:block">
        ドラッグで回転 · ピンチでズーム
      </p>
      {status === 'loading-glb' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
          <p className="text-xs tracking-wide text-warm-gray">3Dモデルを読み込み中…</p>
        </div>
      )}
      <div className="three-d-viewer-shell">
        <model-viewer
          ref={setViewerNode}
          src={CUSTOM_BAG_MODEL_URL}
          alt="オーダーメイドバッグ 3Dプレビュー"
          camera-controls
          touch-action="none"
          shadow-intensity="0.45"
          exposure="1"
          environment-image="neutral"
          interaction-prompt="none"
          loading="eager"
          className="three-d-model-viewer"
        />
      </div>
    </div>
  )
}
