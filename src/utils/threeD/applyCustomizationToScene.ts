import type { Mesh, MeshPhysicalMaterial, Object3D } from 'three'
import { Color } from 'three'
import { MODEL as M } from '../../data/bagShapes'
import { getColorHex } from '../../data/colors'
import type { BagCustomization, BagLayer } from '../../types/bag'
import { STUD_COLORS, computeBagLayout } from './bagLayout'
import { getMaterialTextures } from './materialTextures'
import { isMeshName, type MeshName } from './modelConfig'

interface MaterialStyle {
  roughness: number
  metalness: number
  clearcoat?: number
  clearcoatRoughness?: number
  sheen?: number
  sheenRoughness?: number
  sheenColor?: string
}

/** 素材ごとの質感（本革・合皮・布・化学繊維） */
const MATERIAL_STYLE: Record<string, MaterialStyle> = {
  // 本革：しっとりした半ツヤ
  'genuine-leather': {
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.08,
    clearcoatRoughness: 0.55,
  },
  // 合皮：均一でツヤのある表面
  'synthetic-leather': {
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.28,
  },
  // 布：マットで毛羽立った光沢（シーン）
  fabric: {
    roughness: 1,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.75,
    sheenColor: '#d9dde8',
  },
  // 化学繊維：ナイロンのような薄いツヤ
  'tech-fiber': {
    roughness: 0.48,
    metalness: 0,
    clearcoat: 0.22,
    clearcoatRoughness: 0.32,
    sheen: 0.55,
    sheenRoughness: 0.35,
    sheenColor: '#ffffff',
  },
}

const METAL_STYLE: MaterialStyle = { roughness: 0.24, metalness: 1 }
const MATTE_STYLE: MaterialStyle = { roughness: 0.95, metalness: 0 }
const PLAIN_STYLE: MaterialStyle = { roughness: 0.75, metalness: 0 }

/** メッシュ → 色を決めるレイヤー */
const LAYER_OF: Partial<Record<MeshName, BagLayer>> = {
  body: 'body',
  flap: 'body',
  'magnet-tab': 'body',
  side: 'side',
  bottom: 'bottom',
  handle: 'handle',
  handle2: 'handle',
  'puller-tab': 'handle',
  'puller2-tab': 'handle',
  'ring-single': 'metal',
  'ring-dual': 'metal',
  clasp: 'metal',
  chain: 'metal',
  frame: 'metal',
  'zip-teeth': 'metal',
  'magnet-snap': 'metal',
  'puller-slider': 'metal',
  'puller-ring': 'metal',
  'puller-bar': 'metal',
  'puller2-slider': 'metal',
  'puller2-ring': 'metal',
  'puller2-bar': 'metal',
  pocket: 'accent',
  'pocket-back': 'accent',
  charm: 'accent',
  'puller-tassel': 'accent',
  'puller2-tassel': 'accent',
}

/** 素材テクスチャを貼るメッシュと、そのUVの実寸（ユニット）換算 */
function textureExtent(name: MeshName, scale: [number, number, number]): [number, number] | null {
  const [sx, sy, sz] = scale
  switch (name) {
    case 'body':
    case 'side':
    case 'bottom':
      return [sx, sy]
    case 'flap':
      return [(M.W - 0.44) * sx, M.FLAP_H * sy]
    case 'pocket':
    case 'pocket-back':
      return [M.POCKET_W * sx, M.POCKET_H * sy]
    case 'handle':
    case 'handle2':
      return [(2 * M.ATTACH_X * sx + 2 * M.ARCH_H * sy) * 0.9, 2 * Math.PI * 0.055 * Math.max(sz, 1)]
    case 'magnet-tab':
      return [0.3 * sx, 0.24 * sy]
    case 'puller-tab':
    case 'puller2-tab':
      return [0.075 * sx, 0.27 * sy]
    default:
      return null
  }
}

function asPhysical(mat: unknown): MeshPhysicalMaterial | null {
  const m = mat as MeshPhysicalMaterial
  return m && m.isMeshPhysicalMaterial ? m : null
}

function clearTexture(mat: MeshPhysicalMaterial) {
  if (!mat.userData.texId) return
  mat.map?.dispose()
  mat.normalMap?.dispose()
  mat.map = null
  mat.normalMap = null
  mat.userData.texId = undefined
  mat.needsUpdate = true
}

function applyTexture(mat: MeshPhysicalMaterial, materialId: string, extent: [number, number]) {
  const set = getMaterialTextures(materialId)
  if (mat.userData.texId !== materialId) {
    mat.map?.dispose()
    mat.normalMap?.dispose()
    mat.map = set.map.clone()
    mat.map.needsUpdate = true
    mat.normalMap = set.normalMap.clone()
    mat.normalMap.needsUpdate = true
    mat.normalScale.set(set.normalScale, set.normalScale)
    mat.userData.texId = materialId
    mat.needsUpdate = true
  }
  const rx = Math.max(0.05, extent[0] / set.tile)
  const ry = Math.max(0.05, extent[1] / set.tile)
  mat.map!.repeat.set(rx, ry)
  mat.normalMap!.repeat.set(rx, ry)
}

function paint(
  mesh: Mesh,
  hex: string,
  style: MaterialStyle,
  texture?: { materialId: string; extent: [number, number] } | null,
) {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  for (const material of materials) {
    const mat = asPhysical(material)
    if (!mat) continue
    mat.color.set(hex)
    mat.roughness = style.roughness
    mat.metalness = style.metalness
    mat.clearcoat = style.clearcoat ?? 0
    mat.clearcoatRoughness = style.clearcoatRoughness ?? 0
    mat.sheen = style.sheen ?? 0
    mat.sheenRoughness = style.sheenRoughness ?? 1
    mat.sheenColor.set(style.sheenColor ?? '#000000')
    if (texture) applyTexture(mat, texture.materialId, texture.extent)
    else clearTexture(mat)
    mat.needsUpdate = true
  }
}

function shade(hex: string, factor: number): string {
  return `#${new Color(hex).multiplyScalar(factor).getHexString()}`
}

/** GLB シーンへ型・サイズ・素材・各パーツ仕様・カラーを反映する。 */
export function applyCustomizationToScene(
  root: Object3D,
  customization: BagCustomization,
): void {
  const layout = computeBagLayout(customization)
  const { layerColors, specs, materialId } = customization
  const bodyStyle = MATERIAL_STYLE[materialId] ?? MATERIAL_STYLE['genuine-leather']

  root.scale.setScalar(layout.rootScale)
  root.position.y = layout.rootY

  root.traverse((node: Object3D) => {
    const mesh = node as Mesh
    if (!mesh.isMesh || !isMeshName(mesh.name)) return

    const name = mesh.name
    const target = layout.meshes[name]
    mesh.visible = target.visible
    mesh.position.set(...target.position)
    mesh.rotation.set(...target.rotation)
    mesh.scale.set(...target.scale)
    if (!target.visible) return

    // 底鋲：素材・カラーの選択に従う
    if (name.startsWith('stud-')) {
      paint(mesh, STUD_COLORS[specs.studColor ?? 'gold'] ?? STUD_COLORS.gold, METAL_STYLE)
      return
    }

    // ロゴ・プレート・タグ
    if (name === 'plate') {
      if (specs.logo === 'tag') {
        paint(mesh, getColorHex(layerColors.accent), bodyStyle)
      } else if (specs.logo === 'engrave') {
        paint(mesh, getColorHex(layerColors.accent), { roughness: 0.75, metalness: 0.02 })
      } else {
        paint(mesh, getColorHex(layerColors.metal), METAL_STYLE)
      }
      return
    }

    // ファスナーテープ・開口部の内側
    if (name === 'zip-tape') {
      paint(mesh, shade(getColorHex(layerColors.body), 0.45), MATTE_STYLE)
      return
    }
    if (name === 'opening-mouth') {
      paint(mesh, '#2b2622', PLAIN_STYLE)
      return
    }

    const layer = LAYER_OF[name]
    if (!layer) return
    const hex = getColorHex(layerColors[layer])
    if (layer === 'metal') {
      paint(mesh, hex, METAL_STYLE)
      return
    }
    const extent = textureExtent(name, target.scale)
    paint(mesh, hex, bodyStyle, extent ? { materialId, extent } : null)
  })
}
