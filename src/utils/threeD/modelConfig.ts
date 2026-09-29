/** GLB配置パス（public/models/ 配下） */
export const CUSTOM_BAG_MODEL_URL = '/models/custom-bag.glb'

/** GLB内メッシュ名（scripts/generate-bag-glb.mjs と一致させる） */
export const MESH_NAMES = [
  'body',
  'side',
  'bottom',
  'handle',
  'handle2',
  'ring-single',
  'ring-dual',
  'clasp',
  'flap',
  'pocket',
  'pocket-back',
  'plate',
  'chain',
  'charm',
  'stud-0',
  'stud-1',
  'stud-2',
  'stud-3',
  'zip-tape',
  'zip-teeth',
  'opening-mouth',
  'frame',
  'magnet-tab',
  'magnet-snap',
  'puller-slider',
  'puller-ring',
  'puller-tab',
  'puller-tassel',
  'puller-bar',
  'puller2-slider',
  'puller2-ring',
  'puller2-tab',
  'puller2-tassel',
  'puller2-bar',
] as const

export type MeshName = (typeof MESH_NAMES)[number]

export function isMeshName(name: string): name is MeshName {
  return (MESH_NAMES as readonly string[]).includes(name)
}
