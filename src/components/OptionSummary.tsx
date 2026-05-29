import { useState } from 'react'
import { getColorName } from '../data/colors'
import { templateMap } from '../data/bagTemplates'
import {
  decorationMap,
  handleMap,
  hardwareMap,
  materialMap,
} from '../data/parts'
import { BAG_LAYERS, type BagCustomization } from '../types/bag'
import { buildInquiryText } from '../utils/inquiryText'
import { calculatePrice, formatYen } from '../utils/price'

interface OptionSummaryProps {
  customization: BagCustomization
}

export function OptionSummary({ customization }: OptionSummaryProps) {
  const [copied, setCopied] = useState(false)
  const price = calculatePrice(customization)

  const rows = [
    { label: 'バッグ型', value: templateMap[customization.templateId]?.name },
    { label: '本体素材', value: materialMap[customization.materialId]?.name },
    { label: '取手タイプ', value: handleMap[customization.handleTypeId]?.name },
    { label: '金具カラー', value: hardwareMap[customization.hardwareColorId]?.name },
    { label: '装飾', value: decorationMap[customization.decorationId]?.name },
    ...BAG_LAYERS.map((layer) => ({
      label: `${layer.label}カラー`,
      value: getColorName(customization.layerColors[layer.id]),
    })),
  ]

  const handleCopy = async () => {
    const text = buildInquiryText(customization)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="rounded-2xl border border-stone bg-white p-6">
      <h3 className="font-serif text-lg text-charcoal">選択内容の確認</h3>
      <p className="mt-1 text-xs text-warm-gray">
        参考価格（税抜・目安）：{formatYen(price.total)}
      </p>
      <dl className="mt-5 divide-y divide-stone text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-warm-gray">{row.label}</dt>
            <dd className="text-right font-medium text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-6 w-full rounded-full border border-charcoal bg-charcoal py-3 text-sm tracking-wide text-cream transition hover:bg-brown-deep"
      >
        問い合わせ用テキストをコピー
      </button>
      {copied && (
        <p className="mt-3 text-center text-sm text-gold" role="status">
          コピーしました
        </p>
      )}
    </div>
  )
}
