/** GLB配置パス（public/models/ 配下） */
export const CUSTOM_BAG_MODEL_URL = '/models/custom-bag.glb'

/** GLB内メッシュ名 ↔ カスタマイズレイヤーの対応 */
export const MESH_LAYER_NAMES = [
  'body',
  'handle',
  'metal',
  'side',
  'bottom',
  'accent',
] as const

export type MeshLayerName = (typeof MESH_LAYER_NAMES)[number]
