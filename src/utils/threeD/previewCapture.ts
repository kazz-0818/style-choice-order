import {
  PerspectiveCamera,
  SRGBColorSpace,
  WebGLRenderTarget,
  type Scene,
  type WebGLRenderer,
} from 'three'

export type CaptureView = 'front' | 'back' | 'side' | 'top' | 'bottom'

export interface CapturedView {
  view: CaptureView
  /** ファイル名用の連番付きキー */
  fileName: string
  blob: Blob
}

export const CAPTURE_VIEWS: { view: CaptureView; fileName: string; caption: string }[] = [
  { view: 'front', fileName: '1_front.png', caption: '表 / FRONT' },
  { view: 'back', fileName: '2_back.png', caption: '裏 / BACK' },
  { view: 'side', fileName: '3_side.png', caption: '側面 / SIDE' },
  { view: 'top', fileName: '4_top.png', caption: '上 / TOP' },
  { view: 'bottom', fileName: '5_bottom.png', caption: '下 / BOTTOM' },
]

const CAPTURE_POSITIONS: Record<CaptureView, [number, number, number]> = {
  front: [0, 1.5, 5.2],
  back: [0, 1.5, -5.2],
  side: [5.5, 0.4, 0],
  top: [0, 5.6, 0.001],
  bottom: [0, -5.6, 0.001],
}

const SIZE = 1200

type Capturer = () => Promise<CapturedView[]>

let capturer: Capturer | null = null

export function registerPreviewCapturer(fn: Capturer | null) {
  capturer = fn
}

export function hasPreviewCapturer(): boolean {
  return capturer !== null
}

export function capturePreviewViews(): Promise<CapturedView[]> {
  if (!capturer) return Promise.reject(new Error('3D preview is not ready'))
  return capturer()
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  })
}

/** 画面の 3D キャンバスとは別のレンダーターゲットに 5 方向を描画して PNG にする */
export async function renderViews(gl: WebGLRenderer, scene: Scene): Promise<CapturedView[]> {
  const target = new WebGLRenderTarget(SIZE, SIZE, { samples: 4, colorSpace: SRGBColorSpace })
  const camera = new PerspectiveCamera(40, 1, 0.1, 100)
  const pixels = new Uint8Array(SIZE * SIZE * 4)
  const prevTarget = gl.getRenderTarget()
  const results: CapturedView[] = []

  try {
    for (const item of CAPTURE_VIEWS) {
      const [x, y, z] = CAPTURE_POSITIONS[item.view]
      camera.position.set(x, y, z)
      camera.lookAt(0, 0, 0)
      camera.updateMatrixWorld()

      gl.setRenderTarget(target)
      gl.clear()
      gl.render(scene, camera)
      gl.readRenderTargetPixels(target, 0, 0, SIZE, SIZE, pixels)
      gl.setRenderTarget(prevTarget)

      // WebGL は下から上の行順なので上下反転しながら ImageData にする
      const image = new ImageData(SIZE, SIZE)
      const rowBytes = SIZE * 4
      for (let row = 0; row < SIZE; row++) {
        image.data.set(
          pixels.subarray((SIZE - 1 - row) * rowBytes, (SIZE - row) * rowBytes),
          row * rowBytes,
        )
      }

      const canvas = document.createElement('canvas')
      canvas.width = SIZE
      canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('2D context unavailable')
      ctx.fillStyle = '#fbf9f4'
      ctx.fillRect(0, 0, SIZE, SIZE)
      ctx.putImageData(image, 0, 0)
      ctx.fillStyle = '#1a2d4b'
      ctx.font = '600 36px sans-serif'
      ctx.textBaseline = 'top'
      ctx.fillText(item.caption, 40, 36)

      results.push({ view: item.view, fileName: item.fileName, blob: await canvasToBlob(canvas) })
    }
  } finally {
    gl.setRenderTarget(prevTarget)
    target.dispose()
  }
  return results
}
