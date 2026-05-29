import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  Component,
  Suspense,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getColorHex } from '../data/colors'
import type { BagCustomization } from '../types/bag'
import { getPreviewCssModifiers, getPreviewVisualConfig } from '../utils/preview/previewVisualConfig'
import { MESH_LAYER_NAMES } from '../utils/threeD/modelConfig'
import { BagModel } from './three/BagModel'

export interface ThreeDBagPreviewProps {
  customization: BagCustomization
}

const FRAME_CLASS =
  'three-d-preview-frame relative mx-auto w-full max-w-[240px] rounded-2xl border border-stone bg-gradient-to-b from-[#faf8f5] via-white to-stone/50 shadow-[0_20px_60px_rgba(26,26,26,0.06)] sm:max-w-none'

class GlbErrorBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[ThreeDBagPreview] GLB render failed:', error)
    this.props.onError()
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function ColorSwatchRow({ customization }: { customization: BagCustomization }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {MESH_LAYER_NAMES.map((name) => (
        <span
          key={name}
          title={name}
          className="h-4 w-4 rounded-full border border-charcoal/10 shadow-sm sm:h-5 sm:w-5"
          style={{ backgroundColor: getColorHex(customization.layerColors[name]) }}
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
  const { layerColors } = customization

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

  return (
    <div
      className="three-d-scene relative h-44 w-full cursor-grab touch-none select-none active:cursor-grabbing sm:h-48"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="three-d-scene__stage">
        <div
          className="three-d-scene__object"
          style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
          <div
            className={['three-d-bag', ...cssMods].join(' ')}
            style={{ transform: `scale(${visual.templateScale})` }}
          >
            <div className="three-d-bag__face three-d-bag__face--front" style={{ background: getColorHex(layerColors.body) }} />
            <div className="three-d-bag__face three-d-bag__face--back" style={{ background: getColorHex(layerColors.side) }} />
            <div className="three-d-bag__face three-d-bag__face--left" style={{ background: getColorHex(layerColors.side) }} />
            <div className="three-d-bag__face three-d-bag__face--right" style={{ background: getColorHex(layerColors.side) }} />
            <div className="three-d-bag__face three-d-bag__face--bottom" style={{ background: getColorHex(layerColors.bottom) }} />
            <div className="three-d-bag__face three-d-bag__face--top" style={{ background: getColorHex(layerColors.accent) }} />
            {visual.meshes.accent.visible && (
              <div
                className="three-d-bag__face three-d-bag__face--accent"
                style={{
                  background: visual.accentUsesMetal
                    ? getColorHex(layerColors.metal)
                    : getColorHex(layerColors.accent),
                }}
              />
            )}
            <div
              className="three-d-bag__handle"
              style={{
                background: customization.handleTypeId === 'chain-handle'
                  ? `linear-gradient(135deg, ${getColorHex(layerColors.metal)}, ${getColorHex(layerColors.handle)})`
                  : getColorHex(layerColors.handle),
              }}
            />
            <div className="three-d-bag__metal" style={{ background: getColorHex(layerColors.metal) }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function PreviewFallback({ customization }: { customization: BagCustomization }) {
  return (
    <div className={`${FRAME_CLASS} overflow-hidden p-4 sm:p-8`}>
      <div className="relative flex w-full flex-col items-center px-2 pt-6 text-center">
        <Css3dBagScene customization={customization} />
        <p className="mt-3 font-serif text-sm text-charcoal">カラーイメージ</p>
        <ColorSwatchRow customization={customization} />
      </div>
    </div>
  )
}

function SceneReadyMarker({ onReady }: { onReady: () => void }) {
  useLayoutEffect(() => {
    onReady()
  }, [onReady])
  return null
}

function R3FScene({
  customization,
  onReady,
}: {
  customization: BagCustomization
  onReady: () => void
}) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 5]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <BagModel customization={customization} />
        <SceneReadyMarker onReady={onReady} />
      </Suspense>
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={7} target={[0, 0, 0]} />
    </>
  )
}

export function ThreeDBagPreview({ customization }: ThreeDBagPreviewProps) {
  const [useFallback, setUseFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)

  const handleReady = useCallback(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      setIsLoading(false)
    }
  }, [])

  if (useFallback) {
    return <PreviewFallback customization={customization} />
  }

  return (
    <div className={FRAME_CLASS}>
      <p className="absolute top-3 left-3 z-10 text-[10px] tracking-widest text-warm-gray lg:hidden">
        ピンチで拡大 · ドラッグで回転
      </p>
      <p className="absolute top-3 left-3 z-10 hidden text-[10px] tracking-widest text-warm-gray lg:block">
        ドラッグで回転 · ピンチでズーム
      </p>
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
          <p className="text-xs tracking-wide text-warm-gray">3Dモデルを読み込み中…</p>
        </div>
      )}
      <div className="three-d-viewer-shell">
        <GlbErrorBoundary onError={() => setUseFallback(true)}>
          <Canvas
            className="three-d-canvas"
            camera={{ position: [0, 0.15, 4.2], fov: 42 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#faf8f5']} />
            <R3FScene customization={customization} onReady={handleReady} />
          </Canvas>
        </GlbErrorBoundary>
      </div>
    </div>
  )
}
