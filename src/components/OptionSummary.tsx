import { StepTitle } from './StepTitle'
import { templateMap } from '../data/bagTemplates'
import { getColorName } from '../data/colors'
import { hardwareMap, materialMap } from '../data/parts'
import { getSpecSummaryRows } from '../data/specs'
import { BAG_LAYERS, type BagCustomization } from '../types/bag'
import { buildInquiryMailtoUrl } from '../utils/inquiryText'

interface OptionSummaryProps {
  customization: BagCustomization
  step?: number
  bare?: boolean
}

export function OptionSummary({ customization, step, bare = false }: OptionSummaryProps) {
  const mailto = buildInquiryMailtoUrl(customization)

  const rows = [
    { label: 'バッグ型', value: templateMap[customization.templateId]?.name },
    { label: '素材', value: materialMap[customization.materialId]?.name },
    ...getSpecSummaryRows(customization),
    { label: '金具のカラー・素材', value: hardwareMap[customization.hardwareColorId]?.name },
    ...BAG_LAYERS.map((layer) => ({
      label: `${layer.label}カラー`,
      value: getColorName(customization.layerColors[layer.id]),
    })),
    ...(customization.colorRequest?.trim()
      ? [{ label: '色調のご希望', value: customization.colorRequest.trim() }]
      : []),
  ]

  const content = (
    <>
      {step ? (
        <StepTitle
          step={step}
          icon="check"
          lead="選択内容をご確認のうえ、そのままご相談いただけます。"
        >
          選択内容の確認
        </StepTitle>
      ) : (
        <h3 className="font-serif text-base text-navy sm:text-lg">選択内容の確認</h3>
      )}
      <dl className="mt-3 divide-y divide-stone text-xs sm:mt-4 sm:text-sm">
        {rows.map((row, index) => (
          <div key={`${row.label}-${index}`} className="flex justify-between gap-3 py-2 sm:gap-4">
            <dt className="text-warm-gray">{row.label}</dt>
            <dd className="text-right font-medium text-charcoal">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-[10px] leading-relaxed text-warm-gray sm:text-xs">
        価格・サイズは記載しておりません。仕様に応じて個別にご提案いたします。希少素材などは別途ご相談ください。
      </p>
      <a
        href={mailto}
        className="mt-4 block w-full rounded-full border border-navy bg-navy py-2.5 text-center text-xs tracking-wide text-cream transition hover:bg-navy-dark sm:mt-5 sm:py-3 sm:text-sm"
      >
        こちらの内容で問い合わせる
      </a>
    </>
  )

  if (bare) return content

  return (
    <div className="rounded-xl border border-stone bg-white p-4 sm:rounded-2xl sm:p-6">
      {content}
    </div>
  )
}
