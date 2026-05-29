import type { BagCustomization, BagTemplateId } from '../../types/bag'

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
  'mini-hand': 0.76,
  shoulder: 0.94,
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
  'short-handle': {
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'long-handle': {
    scale: [1.12, 1.22, 1],
    position: [0, 0.12, 0],
    rotation: [0, 0, 0],
    visible: true,
  },
  'shoulder-strap': {
    scale: [1.35, 0.85, 0.75],
    position: [0, 0.05, -0.08],
    rotation: [0.55, 0, 0],
    visible: true,
  },
  'chain-handle': {
    scale: [1, 0.72, 1],
    position: [0, 0.08, 0],
    rotation: [0, 0, 0],
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
  const handleMesh = HANDLE_MESH[customization.handleTypeId] ?? HANDLE_MESH['short-handle']
  const decoration = DECORATION_ACCENT[customization.decorationId] ?? DECORATION_ACCENT.none

  const isChainHandle = customization.handleTypeId === 'chain-handle'
  const handleMaterial: PreviewMaterialStyle = isChainHandle
    ? { roughness: 0.22, metalness: 0.88 }
    : bodyMaterial

  const bodyScale: [number, number, number] = [
    templateScale,
    templateScale * (customization.templateId === 'shoulder' ? 1.08 : 1),
    templateScale,
  ]

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
