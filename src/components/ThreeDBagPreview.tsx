import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { getColorHex } from '../data/colors'
import type { BagCustomization } from '../types/bag'
import { BagArt, type BagView } from './illustrations/BagArt'
import { Icon } from './illustrations/icons'
import { BagModel } from './three/BagModel'
import { sendInquiryWithPhotos } from '../utils/inquiryMail'
import { registerPreviewCapturer, renderViews } from '../utils/threeD/previewCapture'

export interface ViewRequest {
  view: BagView
  nonce: number
  /** 'reset' = バッグ型の変更に伴う正面リセット（自動回転は維持） */
  source?: 'user' | 'reset'
}

export interface ThreeDBagPreviewProps {
  customization: BagCustomization
  viewRequest: ViewRequest
}

const FRAME_CLASS =
  'three-d-preview-frame relative mx-auto w-full max-w-[240px] rounded-2xl border border-stone bg-gradient-to-b from-[#fbf9f4] via-white to-stone/50 shadow-[0_20px_60px_rgba(26,45,75,0.08)] sm:max-w-none'

const CAMERA_POSITIONS: Record<BagView, [number, number, number]> = {
  front: [0, 1.5, 5.2],
  back: [0, 1.5, -5.2],
  side: [5.5, 0.4, 0],
  top: [0, 5.6, 0.001],
  bottom: [0, -5.6, 0.001],
}

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

function PreviewInquiryButton({ customization }: { customization: BagCustomization }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  const handleClick = async () => {
    setState('busy')
    try {
      await sendInquiryWithPhotos(customization)
      setState('done')
      window.setTimeout(() => setState('idle'), 4000)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setState('idle')
        return
      }
      console.error('[PreviewInquiryButton]', e)
      setState('error')
    }
  }

  const label =
    state === 'busy' ? '添付中…' : state === 'done' ? '下書きを開きました' : state === 'error' ? '再試行' : 'こちらで問い合わせ'

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'busy'}
        aria-label="こちらの内容で問い合わせる"
        className="absolute top-3 right-3 z-20 flex max-w-[calc(100%-7.5rem)] items-center justify-center gap-1 rounded-full border border-navy bg-navy px-2 py-1.5 text-[9px] leading-none tracking-wide text-cream shadow-sm transition hover:bg-navy-dark disabled:opacity-60 sm:max-w-none sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-widest"
      >
        <Icon name="mail" size={12} className="shrink-0" />
        <span className="truncate">{label}</span>
      </button>
      {state === 'error' && (
        <p className="absolute top-11 right-3 z-20 max-w-[11rem] rounded-md bg-white/90 px-2 py-1 text-[9px] leading-snug text-red-700 shadow-sm" role="alert">
          メールを用意できませんでした
        </p>
      )}
    </>
  )
}

/** 3D が使えない環境向けのイラスト表示 */
function PreviewFallback({ customization }: { customization: BagCustomization }) {
  const { layerColors, specs } = customization
  return (
    <div className={`${FRAME_CLASS} flex items-center justify-center overflow-hidden p-4 sm:p-8`}>
      <PreviewInquiryButton customization={customization} />
      <BagArt
        type={customization.templateId}
        size={customization.size}
        fills={{
          body: getColorHex(layerColors.body),
          handle: getColorHex(layerColors.handle),
          metal: getColorHex(layerColors.metal),
          accent: getColorHex(layerColors.accent),
        }}
        charm={specs.charm === 'charm' || specs.charm === 'both'}
        className="h-full w-full max-w-sm"
      />
    </div>
  )
}

function SceneReadyMarker({ onReady }: { onReady: () => void }) {
  useLayoutEffect(() => {
    onReady()
  }, [onReady])
  return null
}

/** 「OTHER VIEWS」ボタンからの視点切り替え */
function ViewController({ request }: { request: ViewRequest }) {
  const camera = useThree((state) => state.camera)
  const controls = useThree((state) => state.controls) as { update?: () => void } | null

  useEffect(() => {
    const [x, y, z] = CAMERA_POSITIONS[request.view]
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    controls?.update?.()
  }, [request, camera, controls])

  return null
}

/** メール添付用：現在の見た目のまま 5 方向の画像を書き出せるよう登録する */
function CaptureBridge() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    registerPreviewCapturer(() => renderViews(gl, scene))
    return () => registerPreviewCapturer(null)
  }, [gl, scene])

  return null
}

/** 金具や革のツヤ表現のための環境光（外部ファイル不要） */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useLayoutEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    scene.environment = target.texture
    scene.environmentIntensity = 0.75
    return () => {
      scene.environment = null
      target.dispose()
      pmrem.dispose()
      room.dispose()
    }
  }, [gl, scene])

  return null
}

function R3FScene({
  customization,
  viewRequest,
  autoRotate,
  onReady,
}: {
  customization: BagCustomization
  viewRequest: ViewRequest
  autoRotate: boolean
  onReady: () => void
}) {
  return (
    <>
      <StudioEnvironment />
      <CaptureBridge />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, 3, -4]} intensity={0.45} />
      <Suspense fallback={null}>
        <BagModel customization={customization} />
        <SceneReadyMarker onReady={onReady} />
      </Suspense>
      <OrbitControls
        makeDefault
        autoRotate={autoRotate}
        autoRotateSpeed={2.5}
        enablePan={false}
        minDistance={3}
        maxDistance={8.5}
        target={[0, 0, 0]}
      />
      <ViewController request={viewRequest} />
    </>
  )
}

export function ThreeDBagPreview({ customization, viewRequest }: ThreeDBagPreviewProps) {
  const [useFallback, setUseFallback] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const initialNonceRef = useRef(viewRequest.nonce)

  // 「OTHER VIEWS」で視点を選んだら、その向きで止めて見られるよう自動回転を止める
  useEffect(() => {
    if (viewRequest.nonce !== initialNonceRef.current && viewRequest.source !== 'reset') {
      setAutoRotate(false)
    }
  }, [viewRequest.nonce, viewRequest.source])

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
      <button
        type="button"
        role="switch"
        aria-checked={autoRotate}
        aria-label={autoRotate ? '自動回転 ON' : '自動回転 OFF'}
        onClick={() => setAutoRotate((v) => !v)}
        className="absolute top-3 left-3 z-20 flex items-center justify-center gap-1.5 rounded-full border border-stone bg-white/85 px-2 py-1 text-[9px] tracking-widest text-navy shadow-sm backdrop-blur-sm transition-colors hover:bg-white sm:gap-2 sm:px-2.5 sm:text-[10px]"
      >
        <Icon
          name="rotate"
          size={14}
          className={`sm:hidden ${autoRotate ? 'animate-[spin_3s_linear_infinite] text-gold' : 'text-warm-gray'}`}
        />
        <span className="hidden sm:inline">自動回転</span>
        <span
          aria-hidden="true"
          className={`relative inline-block h-4 w-7 rounded-full transition-colors ${autoRotate ? 'bg-gold' : 'bg-stone'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${autoRotate ? 'translate-x-3' : ''}`}
          />
        </span>
        <span className="w-4 text-left font-medium">{autoRotate ? 'ON' : 'OFF'}</span>
      </button>
      <PreviewInquiryButton customization={customization} />
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-[10px] whitespace-nowrap tracking-widest text-warm-gray">
        <span className="lg:hidden">ピンチで拡大 · ドラッグで回転</span>
        <span className="hidden lg:inline">ドラッグで回転 · ピンチでズーム</span>
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
            camera={{ position: CAMERA_POSITIONS.front, fov: 40 }}
            gl={{ antialias: true, alpha: true, stencil: true }}
            dpr={[1, 2]}
          >
            <color attach="background" args={['#fbf9f4']} />
            <R3FScene
              customization={customization}
              viewRequest={viewRequest}
              autoRotate={autoRotate}
              onReady={handleReady}
            />
          </Canvas>
        </GlbErrorBoundary>
      </div>
    </div>
  )
}
