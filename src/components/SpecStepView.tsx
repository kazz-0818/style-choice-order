import { StepTitle } from './StepTitle'
import { OptionArt } from './illustrations/OptionArt'
import { isGroupVisible, type SpecStep } from '../data/specs'
import type { BagSpecs, SpecKey } from '../types/bag'

interface SpecStepViewProps {
  step: number
  spec: SpecStep
  specs: BagSpecs
  onSelect: (key: SpecKey, optionId: string) => void
}

/** 提案書の項目（開口部・持ち手・底鋲…）を、イラスト付きの選択カードで表示 */
export function SpecStepView({ step, spec, specs, onSelect }: SpecStepViewProps) {
  return (
    <div>
      <StepTitle step={step} icon={spec.icon} lead={spec.lead}>
        {spec.label}
      </StepTitle>

      <div className="mt-3 space-y-4 sm:mt-4 sm:space-y-5">
        {spec.groups
          .filter((group) => isGroupVisible(group, specs))
          .map((group) => {
            const current = specs[group.key] ?? group.defaultId ?? group.options[0].id
            return (
              <fieldset key={group.key}>
                {spec.groups.length > 1 && (
                  <legend className="mb-2 flex items-center gap-2 text-[11px] font-medium tracking-wider text-warm-gray sm:text-xs">
                    <span className="h-px w-4 bg-gold" aria-hidden />
                    {group.label}
                  </legend>
                )}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5">
                  {group.options.map((option) => {
                    const selected = current === option.id
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(group.key, option.id)}
                        aria-pressed={selected}
                        className={`relative flex flex-col items-center rounded-xl border p-2 text-center transition ${
                          selected
                            ? 'border-navy bg-navy text-cream shadow-sm'
                            : 'border-stone bg-white text-charcoal hover:border-gold'
                        }`}
                      >
                        {selected && (
                          <span
                            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] text-navy-dark"
                            aria-hidden
                          >
                            ✓
                          </span>
                        )}
                        <span
                          className={`block w-full rounded-lg p-1 ${
                            selected ? 'bg-cream' : 'art-grid'
                          }`}
                        >
                          <OptionArt
                            specKey={group.key}
                            optionId={option.id}
                            className="mx-auto h-14 w-14 sm:h-[68px] sm:w-[68px]"
                          />
                        </span>
                        <span className="mt-1.5 text-xs leading-tight font-medium">{option.name}</span>
                        {option.description && (
                          <span
                            className={`mt-0.5 text-[10px] leading-snug ${
                              selected ? 'text-cream/75' : 'text-warm-gray'
                            }`}
                          >
                            {option.description}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            )
          })}
      </div>
    </div>
  )
}
