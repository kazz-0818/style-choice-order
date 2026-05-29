import { StepTitle } from './StepTitle'
import {
  DECORATIONS,
  HANDLE_TYPES,
  HARDWARE_COLORS,
  MATERIALS,
} from '../data/parts'

export function PartOptionGroup<
  T extends { id: string; name: string; description?: string },
>({
  label,
  options,
  value,
  onChange,
  step,
}: {
  label: string
  options: T[]
  value: string
  onChange: (id: string) => void
  step?: number
}) {
  return (
    <div>
      {step ? (
        <StepTitle step={step}>{label}</StepTitle>
      ) : (
        <h3 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
          {label}
        </h3>
      )}
      <div className="mt-2 flex flex-col gap-1.5 sm:mt-3 sm:gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-lg border px-3 py-2 text-left transition sm:rounded-xl sm:px-4 sm:py-3 ${
              value === option.id
                ? 'border-kogicha bg-kogicha text-cream'
                : 'border-stone bg-white text-charcoal hover:border-gold'
            }`}
          >
            <span className="block text-xs font-medium sm:text-sm">{option.name}</span>
            {option.description && (
              <span
                className={`mt-0.5 block text-[10px] leading-snug sm:mt-1 sm:text-xs sm:leading-relaxed ${
                  value === option.id ? 'text-cream/70' : 'text-warm-gray'
                }`}
              >
                {option.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export { MATERIALS, HANDLE_TYPES, HARDWARE_COLORS, DECORATIONS }
