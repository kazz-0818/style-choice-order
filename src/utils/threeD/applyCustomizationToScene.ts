import type { Mesh, Object3D } from 'three'
import { Color, Material } from 'three'
import { getColorHex } from '../../data/colors'
import type { BagCustomization } from '../../types/bag'
import { getPreviewVisualConfig } from '../preview/previewVisualConfig'
import type { MeshLayerName } from './modelConfig'
import { MESH_LAYER_NAMES } from './modelConfig'

type MeshDefaults = {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  visible: boolean
}

let cachedDefaults: Map<string, MeshDefaults> | null = null
let cachedRootUuid: string | null = null

function isMeshLayerName(name: string): name is MeshLayerName {
  return (MESH_LAYER_NAMES as readonly string[]).includes(name)
}

function captureDefaults(root: Object3D): Map<string, MeshDefaults> {
  const defaults = new Map<string, MeshDefaults>()
  root.traverse((node: Object3D) => {
    const mesh = node as Mesh
    if (!mesh.isMesh || !mesh.name || !isMeshLayerName(mesh.name)) return
    defaults.set(mesh.name, {
      position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
      rotation: { x: mesh.rotation.x, y: mesh.rotation.y, z: mesh.rotation.z },
      scale: { x: mesh.scale.x, y: mesh.scale.y, z: mesh.scale.z },
      visible: mesh.visible,
    })
  })
  return defaults
}

function ensureCustomizationDefaults(root: Object3D): void {
  if (cachedRootUuid !== root.uuid) {
    cachedDefaults = captureDefaults(root)
    cachedRootUuid = root.uuid
  }
}

function applyMaterialStyle(
  mesh: Mesh,
  style: { roughness: number; metalness: number },
  layerColors: BagCustomization['layerColors'],
  layer: keyof BagCustomization['layerColors'],
  accentUsesMetal: boolean,
) {
  const hex = getColorHex(layerColors[layer])
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

  for (const material of materials) {
    if (!material) continue
    const mat = material as Material & {
      color?: Color
      roughness?: number
      metalness?: number
    }
    if (mat.color) mat.color.set(hex)
    if (typeof mat.roughness === 'number') {
      mat.roughness = accentUsesMetal && layer === 'accent' ? 0.25 : style.roughness
    }
    if (typeof mat.metalness === 'number') {
      mat.metalness = accentUsesMetal && layer === 'accent' ? 0.85 : style.metalness
    }
    mat.needsUpdate = true
  }
}

/** GLB シーンへカラー・型・素材・取手・装飾を反映。 */
export function applyCustomizationToScene(
  root: Object3D,
  customization: BagCustomization,
): void {
  ensureCustomizationDefaults(root)

  const visual = getPreviewVisualConfig(customization)

  root.traverse((node: Object3D) => {
    const mesh = node as Mesh
    if (!mesh.isMesh || !mesh.name || !isMeshLayerName(mesh.name)) return

    const defaults = cachedDefaults!.get(mesh.name)
    if (!defaults) return

    const meshVisual = visual.meshes[mesh.name]
    mesh.visible = meshVisual.visible
    mesh.position.set(
      defaults.position.x + meshVisual.position[0],
      defaults.position.y + meshVisual.position[1],
      defaults.position.z + meshVisual.position[2],
    )
    mesh.rotation.set(
      defaults.rotation.x + meshVisual.rotation[0],
      defaults.rotation.y + meshVisual.rotation[1],
      defaults.rotation.z + meshVisual.rotation[2],
    )
    mesh.scale.set(
      defaults.scale.x * meshVisual.scale[0],
      defaults.scale.y * meshVisual.scale[1],
      defaults.scale.z * meshVisual.scale[2],
    )

    if (mesh.name === 'handle') {
      applyMaterialStyle(mesh, visual.handleMaterial, customization.layerColors, 'handle', false)
      return
    }
    if (mesh.name === 'metal') {
      applyMaterialStyle(
        mesh,
        { roughness: 0.28, metalness: 0.78 },
        customization.layerColors,
        'metal',
        false,
      )
      return
    }
    if (mesh.name === 'accent') {
      applyMaterialStyle(
        mesh,
        visual.bodyMaterial,
        customization.layerColors,
        'accent',
        visual.accentUsesMetal,
      )
      return
    }
    if (mesh.name === 'body' || mesh.name === 'side' || mesh.name === 'bottom') {
      applyMaterialStyle(mesh, visual.bodyMaterial, customization.layerColors, mesh.name, false)
    }
  })
}

export function resetCustomizationSceneCache(): void {
  cachedDefaults = null
  cachedRootUuid = null
}
