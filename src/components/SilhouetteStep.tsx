import { StepTitle } from './StepTitle'
import { BagArt } from './illustrations/BagArt'
import type { SpecStep } from '../data/specs'
import {
  DEFAULT_SIZE,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  type BagSize,
  type BagTemplateId,
} from '../types/bag'

interface SilhouetteStepProps {
  step: number
  spec: SpecStep
  templateId: BagTemplateId
  size: BagSize
  onChange: (size: BagSize) => void
}

const PRESETS: { id: string; label: string; size: BagSize }[] = [
  { id: 'compact', label: 'コンパクト', size: { height: 88, width: 90, gusset: 90 } },
  { id: 'slim', label: 'スリム', size: { height: 110, width: 90, gusset: 80 } },
  { id: 'standard', label: '標準', size: { ...DEFAULT_SIZE } },
  { id: 'wide', label: 'ワイド', size: { height: 95, width: 120, gusset: 120 } },
]

const AXES: { key: keyof BagSize; label: string; hint: string }[] = [
  { key: 'height', label: '高さ', hint: '縦の大きさ' },
  { key: 'width', label: '幅', hint: '横の大きさ' },
  { key: 'gusset', label: 'マチ', hint: '奥行き・厚み' },
]

function sameSize(a: BagSize, b: BagSize) {
  return a.height === b.height && a.width === b.width && a.gusset === b.gusset
}

/** 高さ・幅・マチを自由に設計する（フリーサイズ設計） */
export function SilhouetteStep({ step, spec, templateId, size, onChange }: SilhouetteStepProps) {
  return (
    <div>
      <StepTitle step={step} icon={spec.icon} lead={spec.lead}>
        {spec.label}（サイズ設計）
      </StepTitle>

      <div className="art-grid mt-3 grid grid-cols-3 gap-1 rounded-xl border border-stone p-2 sm:mt-4 sm:gap-2">
        {(['front', 'side', 'top'] as const).map((view) => (
          <figure key={view} className="text-center">
            <BagArt type={templateId} view={view} size={size} className="mx-auto aspect-square w-full max-w-[120px]" />
            <figcaption className="text-[9px] tracking-widest text-warm-gray uppercase">
              {view === 'front' ? 'Front' : view === 'side' ? 'Side' : 'Top'}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
        {PRESETS.map((preset) => {
          const active = sameSize(size, preset.size)
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange({ ...preset.size })}
              className={`rounded-full border px-3 py-1 text-[11px] transition sm:text-xs ${
                active
                  ? 'border-navy bg-navy text-cream'
                  : 'border-stone bg-white text-warm-gray hover:border-gold'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 space-y-4">
        {AXES.map((axis) => {
          const value = size[axis.key]
          const fill = ((value - SIZE_MIN) / (SIZE_MAX - SIZE_MIN)) * 100
          return (
            <label key={axis.key} className="block">
              <span className="flex items-baseline justify-between text-xs sm:text-sm">
                <span className="font-medium text-charcoal">
                  {axis.label}
                  <span className="ml-1.5 text-[10px] font-normal text-warm-gray">{axis.hint}</span>
                </span>
                <span className="font-serif text-navy">
                  {value}
                  <span className="text-[10px] text-warm-gray">%</span>
                </span>
              </span>
              <input
                type="range"
                className="size-range mt-2"
                min={SIZE_MIN}
                max={SIZE_MAX}
                step={SIZE_STEP}
                value={value}
                style={{ ['--fill' as string]: `${fill}%` }}
                onChange={(event) => onChange({ ...size, [axis.key]: Number(event.target.value) })}
              />
              <span className="mt-1 flex justify-between text-[9px] text-warm-gray/70">
                <span>{SIZE_MIN}%</span>
                <span>標準 100%</span>
                <span>{SIZE_MAX}%</span>
              </span>
            </label>
          )
        })}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-warm-gray">
        ※ 標準サイズに対する割合の目安です。具体的な寸法（cm）はご相談のうえ決定します。
      </p>
    </div>
  )
}
