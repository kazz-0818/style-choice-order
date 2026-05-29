import type { BagCustomization, BagTemplateId } from '../../types/bag'
import { isChainHandleId } from '../../data/handlesByTemplate'

export interface PreviewMeshTransform {
  scale: [number, number, number]
  position: [number, number, number]
  rotation: [number, number, number]
  visible: boolean
}

export interface PreviewMaterialStyle {
  roughness: number
  metalness: number
}

export interface PreviewVisualConfig {
  templateScale: number
  bodyMaterial: PreviewMaterialStyle
  handleMaterial: PreviewMaterialStyle
  meshes: Record<
    'body' | 'handle' | 'metal' | 'side' | 'bottom' | 'accent',
    PreviewMeshTransform
  >
  accentUsesMetal: boolean
}

const TEMPLATE_SCALE: Record<BagTemplateId, number> = {
  tote: 1,
  'mini-hand': 0.68,
  shoulder: 0.92,
}

const MATERIAL_STYLE: Record<string, PreviewMaterialStyle> = {
  'smooth-leather': { roughness: 0.52, metalness: 0.06 },
  'textured-leather': { roughness: 0.84, metalness: 0.03 },
  canvas: { roughness: 0.96, metalness: 0 },
  'nylon-like': { roughness: 0.38, metalness: 0.12 },
}

const DEFAULT_MESH: PreviewMeshTransform = {
  scale: [1, 1, 1],
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  visible: true,
}

const HANDLE_MESH: Record<string, PreviewMeshTransform> = {
  // Tote Bag
  'tote-long': {
    scale: [1.15, 1.45, 1],
    position: [0, 0.22, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'tote-rope': {
    scale: [0.82, 1.18, 0.82],
    position: [0, 0.16, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'tote-short': {
    scale: [0.95, 0.88, 1],
    position: [0, -0.02, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  // Mini Hand Bag
  'mini-short': {
    scale: [0.92, 0.85, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'mini-chain': {
    scale: [1.05, 0.55, 1],
    position: [0, 0.12, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'mini-bow': {
    scale: [1.25, 0.72, 1],
    position: [0, 0.06, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  // Shoulder Bag
  'shoulder-standard': {
    scale: [1.55, 0.7, 0.65],
    position: [0, 0.08, -0.12],
    rotation: [0.85, 0, 0],
    visible: true,
  },
  'shoulder-wide': {
    scale: [1.85, 0.78, 0.7],
    position: [0, 0.06, -0.1],
    rotation: [0.75, 0, 0],
    visible: true,
  },
  'shoulder-chain': {
    scale: [1.45, 0.62, 0.6],
    position: [0, 0.1, -0.08],
    rotation: [0.9, 0, 0],
    visible: true,
  },
}

const DECORATION_ACCENT: Record<
  string,
  Pick<PreviewMeshTransform, 'visible' | 'scale' | 'position'> & { accentUsesMetal?: boolean }
> = {
  none: { visible: false, scale: [1, 1, 1], position: [0, 0, 0] },
  'stitch-accent': { visible: true, scale: [1.05, 0.12, 1], position: [0, -0.2, 0.02] },
  'front-pocket': { visible: true, scale: [1, 1, 1], position: [0, 0, 0] },
  'metal-plate': {
    visible: true,
    scale: [0.55, 0.35, 1],
    position: [0, 0.15, 0.04],
    accentUsesMetal: true,
  },
  charm: { visible: true, scale: [0.35, 0.35, 1], position: [0.42, -0.35, 0.06] },
}

export function getPreviewVisualConfig(customization: BagCustomization): PreviewVisualConfig {
  const templateScale = TEMPLATE_SCALE[customization.templateId]
  const bodyMaterial = MATERIAL_STYLE[customization.materialId] ?? MATERIAL_STYLE['smooth-leather']
  const handleMesh = HANDLE_MESH[customization.handleTypeId] ?? HANDLE_MESH['tote-long']
  const decoration = DECORATION_ACCENT[customization.decorationId] ?? DECORATION_ACCENT.none

  const isChainHandle = isChainHandleId(customization.handleTypeId)
  const handleMaterial: PreviewMaterialStyle = isChainHandle
    ? { roughness: 0.22, metalness: 0.88 }
    : bodyMaterial

  const bodyScale: [number, number, number] =
    customization.templateId === 'shoulder'
      ? [templateScale * 1.15, templateScale * 0.92, templateScale * 0.82]
      : customization.templateId === 'mini-hand'
        ? [templateScale * 0.92, templateScale, templateScale * 0.88]
        : [templateScale, templateScale, templateScale]

  return {
    templateScale,
    bodyMaterial,
    handleMaterial,
    accentUsesMetal: decoration.accentUsesMetal ?? false,
    meshes: {
      body: { ...DEFAULT_MESH, scale: bodyScale, visible: true },
      side: { ...DEFAULT_MESH, scale: bodyScale, visible: true },
      bottom: { ...DEFAULT_MESH, scale: bodyScale, visible: true },
      handle: { ...handleMesh },
      metal: { ...DEFAULT_MESH, scale: [templateScale, templateScale, templateScale], visible: true },
      accent: {
        ...DEFAULT_MESH,
        visible: decoration.visible,
        scale: decoration.scale,
        position: decoration.position,
        rotation: [0, 0, 0],
      },
    },
  }
}

/** CSS 3D プレビュー用クラス名 */
export function getPreviewCssModifiers(customization: BagCustomization): string[] {
  const mods = [`template-${customization.templateId}`, `material-${customization.materialId}`]
  mods.push(`handle-${customization.handleTypeId}`)
  if (customization.decorationId !== 'none') {
    mods.push(`decoration-${customization.decorationId}`)
  }
  return mods
}
