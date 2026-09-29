import { StepTitle } from './StepTitle'
import { HARDWARE_COLORS } from '../data/parts'

const METAL_SWATCH: Record<string, string> = {
  gold: 'linear-gradient(135deg,#f1d98c,#b8923f 55%,#e7c973)',
  silver: 'linear-gradient(135deg,#f4f6f8,#a9b0ba 55%,#e2e6ea)',
  'black-nickel': 'linear-gradient(135deg,#59606d,#1c2029 55%,#454b57)',
  'antique-brass': 'linear-gradient(135deg,#c9a56a,#7a5a2e 55%,#b08a52)',
}

interface HardwareSelectorProps {
  value: string
  onChange: (id: string) => void
  step: number
}

export function HardwareSelector({ value, onChange, step }: HardwareSelectorProps) {
  return (
    <div>
      <StepTitle
        step={step}
        icon="padlock"
        lead="ロックやDカンなど、金属パーツ全体のカラー・素材感を選べます。"
      >
        金具のカラー・素材
      </StepTitle>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-4 sm:gap-2.5">
        {HARDWARE_COLORS.map((option) => {
          const selected = value === option.id
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={selected}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                selected
                  ? 'border-navy bg-navy text-cream'
                  : 'border-stone bg-white text-charcoal hover:border-gold'
              }`}
            >
              <span
                className="h-10 w-10 rounded-full border border-charcoal/15 shadow-inner"
                style={{ background: METAL_SWATCH[option.id] }}
              />
              <span className="text-[11px] leading-tight font-medium">{option.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
