import { getColorName } from '../data/colors'
import { templateMap } from '../data/bagTemplates'
import {
  decorationMap,
  handleMap,
  hardwareMap,
  materialMap,
} from '../data/parts'
import { BAG_LAYERS, type BagCustomization } from '../types/bag'
import { formatYen, calculatePrice } from './price'

export function buildInquiryText(customization: BagCustomization): string {
  const template = templateMap[customization.templateId]
  const material = materialMap[customization.materialId]
  const handle = handleMap[customization.handleTypeId]
  const hardware = hardwareMap[customization.hardwareColorId]
  const decoration = decorationMap[customization.decorationId]
  const price = calculatePrice(customization)

  const colorLines = BAG_LAYERS.map((layer) => {
    const colorId = customization.layerColors[layer.id]
    return `${layer.label}：${getColorName(colorId)}`
  }).join('\n')

  return `オーダーメイドバッグの見積もりを希望します。

【選択内容】
バッグ型：${template?.name ?? customization.templateId}
本体素材：${material?.name ?? customization.materialId}
取手タイプ：${handle?.name ?? customization.handleTypeId}
金具カラー：${hardware?.name ?? customization.hardwareColorId}
装飾：${decoration?.name ?? customization.decorationId}

【カラー】
${colorLines}

【参考価格（税抜・目安）】
${formatYen(price.total)} ※仕様・数量により変動します

【相談内容】
数量：
希望納期：
その他希望：

この内容をもとに相談したいです。`
}
