import { StepTitle } from './StepTitle'
import { MaterialArt } from './illustrations/Decor'
import { MATERIALS } from '../data/parts'

interface MaterialSelectorProps {
  value: string
  onChange: (id: string) => void
  step: number
}

export function MaterialSelector({ value, onChange, step }: MaterialSelectorProps) {
  return (
    <div>
      <StepTitle
        step={step}
        icon="hide"
        lead="本革・合皮・布・ファー・化学繊維から選べます。革の種類や質感はご相談の中で決定します。"
      >
        素材
      </StepTitle>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3">
        {MATERIALS.map((material) => {
          const selected = value === material.id
          return (
            <button
              key={material.id}
              type="button"
              onClick={() => onChange(material.id)}
              aria-pressed={selected}
              className={`flex flex-col overflow-hidden rounded-xl border text-left transition ${
                selected ? 'border-navy ring-2 ring-gold' : 'border-stone bg-white hover:border-gold'
              }`}
            >
              <span className="block bg-[#f3ede0] p-2">
                <MaterialArt id={material.id} className="h-16 w-full sm:h-20" />
              </span>
              <span
                className={`block flex-1 px-2.5 py-2 ${
                  selected ? 'bg-navy text-cream' : 'bg-white text-charcoal'
                }`}
              >
                <span className="block text-sm font-medium">{material.name}</span>
                <span
                  className={`mt-0.5 block text-[10px] leading-snug sm:text-[11px] ${
                    selected ? 'text-cream/75' : 'text-warm-gray'
                  }`}
                >
                  {material.description}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
