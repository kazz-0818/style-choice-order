import type { Mesh, Object3D } from 'three'
import { Color, Material } from 'three'
import { getColorHex } from '../../data/colors'
import type { BagLayer, LayerColors } from '../../types/bag'
import type { MeshLayerName } from './modelConfig'

const MESH_TO_LAYER: Record<MeshLayerName, BagLayer> = {
  body: 'body',
  handle: 'handle',
  metal: 'metal',
  side: 'side',
  bottom: 'bottom',
  accent: 'accent',
}

function isMeshLayerName(name: string): name is MeshLayerName {
  return name in MESH_TO_LAYER
}

/**
 * model-viewer / Three.js シーンへレイヤーカラーを反映。
 * React Three Fiber 移行時も同関数を流用可能。
 */
export function applyLayerColorsToScene(root: Object3D, layerColors: LayerColors): void {
  root.traverse((node: Object3D) => {
    const mesh = node as Mesh
    if (!mesh.isMesh || !mesh.name || !isMeshLayerName(mesh.name)) return

    const layer = MESH_TO_LAYER[mesh.name]
    const hex = getColorHex(layerColors[layer])
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    for (const material of materials) {
      if (!material) continue
      const mat = material as Material & { color?: Color }
      if (mat.color) {
        mat.color.set(hex)
        mat.needsUpdate = true
      }
    }
  })
}
