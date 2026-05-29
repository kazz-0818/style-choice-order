import { $needsRender, $scene } from '@google/model-viewer/lib/model-viewer-base.js'
import type { Object3D } from 'three'
import type { ModelViewerElement } from '../../types/model-viewer'

type ModelSceneInternal = {
  _model: Object3D | null
}

/**
 * model-viewer 内部の Three.js モデルルートを取得。
 * viewer.model は Scene Graph API ラッパーのため traverse 不可。
 */
export function getModelViewerThreeRoot(viewer: ModelViewerElement): Object3D | null {
  const modelScene = (viewer as unknown as Record<symbol, ModelSceneInternal | undefined>)[$scene]
  return modelScene?._model ?? null
}

/** マテリアル・メッシュ変更後に再描画を要求 */
export function requestModelViewerRender(viewer: ModelViewerElement): void {
  const request = (viewer as unknown as Record<symbol, (() => void) | undefined>)[$needsRender]
  request?.()
}
