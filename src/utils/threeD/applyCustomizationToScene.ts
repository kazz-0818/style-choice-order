import type { Mesh, MeshPhysicalMaterial, Object3D } from 'three'
import { Color } from 'three'
import { MODEL as M } from '../../data/bagShapes'
import { getColorHex } from '../../data/colors'
import type { BagCustomization, BagLayer } from '../../types/bag'
import { STUD_COLORS, computeBagLayout } from './bagLayout'
import { syncFurShells } from './furShells'
import { getMaterialTextures } from './materialTextures'
import { isMeshName, type MeshName } from './modelConfig'
import { buildChainGeometry } from './strapChain'
import { buildHandleBandGeometry } from './handleBand'
import { buildRingGeometry, ringSpecKey } from './ringGeometry'
import { TAPER_MESHES, applyTaper } from './taper'

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
  // 本革：しっとり柔らかい、ツヤ控えめのマット寄り（縁がやわらかく光る）
  'genuine-leather': {
    roughness: 0.78,
    metalness: 0,
    sheen: 0.7,
    sheenRoughness: 0.55,
    sheenColor: '#efe4d3',
  },
  // 合皮：均一でツヤのある表面
  'synthetic-leather': {
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.12,
    clearcoatRoughness: 0.45,
    sheen: 0.35,
    sheenRoughness: 0.6,
    sheenColor: '#f2ece2',
  },
  // 布：マットで毛羽立った光沢（シーン）
  fabric: {
    roughness: 1,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.75,
    sheenColor: '#d9dde8',
  },
  // ファー・ボア：マットでふわふわ、縁が白く光る
  fur: {
    roughness: 1,
    metalness: 0,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: '#ffffff',
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
  'drum-body': 'body',
  'drum-side': 'side',
  'drum-zip-teeth': 'metal',
  'clasp-shield': 'metal',
  'charm-star': 'accent',
  'charm-heart': 'accent',
  'charm-tassel': 'accent',
  'charm-tag': 'metal',
  'strap-chain': 'metal',
  flap: 'body',
  'flap-round': 'body',
  'flap-curve': 'body',
  'flap-point': 'body',
  belt: 'handle',
  'tab-0': 'handle',
  'tab-1': 'handle',
  'tab-2': 'handle',
  'tab-3': 'handle',
  'tab-ring-0': 'metal',
  'tab-ring-1': 'metal',
  'tab-ring-2': 'metal',
  'tab-ring-3': 'metal',
  'side-rings': 'metal',
  'pocket-l': 'accent',
  'pocket-r': 'accent',
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
  'zip-teeth-top': 'metal',
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
    case 'belt':
    case 'flap':
    case 'flap-round':
    case 'flap-curve':
    case 'flap-point':
    case 'tab-0':
    case 'tab-1':
    case 'tab-2':
    case 'tab-3':
      return [sx, sy]
    case 'pocket-l':
    case 'pocket-r':
      return [0.64 * sx, M.POCKET_H * sy]
    case 'drum-body':
      // UV は (X, 円周方向の長さ)。円周の実寸は楕円断面の平均半径に比例
      return [sx, (sy * M.TOP + sz * (M.D / 2)) / 2 / ((M.TOP + M.D / 2) / 2)]
    case 'drum-side':
      return [sz, sy]
    case 'pocket':
    case 'pocket-back':
      return [M.POCKET_W * sx, M.POCKET_H * sy]
    case 'handle':
    case 'handle2':
      return [(2 * M.ATTACH_X * sx + 2 * M.ARCH_H * sy) * 0.9, 2 * Math.PI * 0.038 * Math.max(sz, 1)]
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

    // チェーンストラップ：持ち手のカーブに合わせて形状を作り直す
    if (name === 'strap-chain' && layout.chain) {
      const { points, linkScale } = layout.chain
      const key = `${linkScale}|${points.map((p) => p.map((v) => v.toFixed(3)).join(',')).join(';')}`
      if (mesh.userData.chainKey !== key) {
        mesh.geometry.dispose()
        mesh.geometry = buildChainGeometry(points, linkScale)
        mesh.userData.chainKey = key
      }
    }

    // 表裏の持ち手：幅・厚みが一定のバンドを実寸で作り直す（GLB 標準の持ち手は伸縮で歪むため）
    if (name === 'handle' || name === 'handle2') {
      if (!mesh.userData.baseGeometry) mesh.userData.baseGeometry = mesh.geometry
      const band = layout.handleBand
      const key = band
        ? [band.halfSpan, band.height, band.width, band.thickness].map((v) => v.toFixed(4)).join('|')
        : ''
      if (mesh.userData.bandKey !== key) {
        if (mesh.geometry !== mesh.userData.baseGeometry) mesh.geometry.dispose()
        mesh.geometry = band ? buildHandleBandGeometry(band) : mesh.userData.baseGeometry
        mesh.userData.bandKey = key
      }
    }

    // 取付リング：面が表・裏と平行になるよう、実寸の位置で作り直す
    if (name === 'ring-dual' || name === 'ring-single') {
      const spec = name === 'ring-dual' ? layout.rings.dual : layout.rings.single
      const key = ringSpecKey(spec)
      if (mesh.userData.ringKey !== key) {
        mesh.geometry.dispose()
        mesh.geometry = buildRingGeometry(spec)
        mesh.userData.ringKey = key
      }
    }

    // 上すぼまり（台形・A字）を本体系のジオメトリへ反映
    if (TAPER_MESHES.has(name)) applyTaper(mesh, layout.taper.x, layout.taper.z)

    // ベルトのステッチ：淡いクリーム色の糸
    if (name === 'belt-stitch') {
      paint(mesh, '#e6d9bd', MATTE_STYLE)
      return
    }

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
    if (name === 'zip-tape' || name === 'zip-tape-top' || name === 'drum-zip-tape') {
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
    const isBand = (name === 'handle' || name === 'handle2') && !!layout.handleBand
    // バンドの UV は実寸なので、テクスチャの繰り返しは 1 単位あたりで指定する
    const extent = isBand ? ([1, 1] as [number, number]) : textureExtent(name, target.scale)
    // ファー・ボア：本体まわりは毛層（シェル）を重ねてふわふわにする
    const furry =
      materialId === 'fur' && !!extent && !isBand && ['body', 'side', 'bottom', 'accent'].includes(layer)
    // ファーの下地は柄のない無地（毛の隙間から暗い斑点が見えないよう、毛の根元に近い色でそろえる）
    paint(
      mesh,
      furry ? shade(hex, 0.8) : hex,
      bodyStyle,
      extent && !furry ? { materialId, extent } : null,
    )
    syncFurShells(mesh, furry, hex, extent)
  })
}
