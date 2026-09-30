import { CONTACT_EMAIL } from '../config/contact'
import { templateMap } from '../data/bagTemplates'
import { getColorName } from '../data/colors'
import { hardwareMap, materialMap } from '../data/parts'
import { getSpecSummaryRows } from '../data/specs'
import { BAG_LAYERS, type BagCustomization } from '../types/bag'

export function buildInquiryText(customization: BagCustomization): string {
  const template = templateMap[customization.templateId]
  const material = materialMap[customization.materialId]
  const hardware = hardwareMap[customization.hardwareColorId]

  const specLines = getSpecSummaryRows(customization)
    .map((row) => `${row.label}：${row.value}`)
    .join('\n')

  const colorLines = BAG_LAYERS.map(
    (layer) => `${layer.label}：${getColorName(customization.layerColors[layer.id])}`,
  ).join('\n')

  const colorRequest = (customization.colorRequest ?? '').trim()

  return `Desfy Origouf（フルオーダーメイド）の製作について相談したいです。

【バッグ型】
${template?.name ?? customization.templateId}

【素材】
${material?.name ?? customization.materialId}

【仕様】
${specLines}
金具のカラー・素材：${hardware?.name ?? customization.hardwareColorId}

【カラー】
${colorLines}
${colorRequest ? `\n【色調のご希望（パントーンカラー）】\n${colorRequest}\n` : ''}
【ご相談内容】
数量：
希望納期：
具体的なサイズ（cm）：
その他希望：

※価格・サイズは仕様に応じて個別にご提案をお願いします。`
}

export function buildInquiryMailtoUrl(customization: BagCustomization): string {
  const subject = encodeURIComponent('フルオーダーメイドバッグのご相談')
  const body = encodeURIComponent(buildInquiryText(customization))
  return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
}
