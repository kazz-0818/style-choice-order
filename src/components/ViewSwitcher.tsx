import { BagArt, type BagView } from './illustrations/BagArt'
import { getColorHex } from '../data/colors'
import type { BagCustomization } from '../types/bag'

const VIEWS: { id: BagView; label: string }[] = [
  { id: 'front', label: 'FRONT' },
  { id: 'back', label: 'BACK' },
  { id: 'side', label: 'SIDE' },
  { id: 'top', label: 'TOP' },
  { id: 'bottom', label: 'BOTTOM' },
]

interface ViewSwitcherProps {
  customization: BagCustomization
  active: BagView
  onSelect: (view: BagView) => void
}

/** 提案書の「OTHER VIEWS」：正面・背面・側面・上面・底面を切り替え */
export function ViewSwitcher({ customization, active, onSelect }: ViewSwitcherProps) {
  const { layerColors, size, specs, templateId } = customization
  const fills = {
    body: getColorHex(layerColors.body),
    handle: getColorHex(layerColors.handle),
    metal: getColorHex(layerColors.metal),
    accent: getColorHex(layerColors.accent),
    bottom: getColorHex(layerColors.bottom),
  }

  return (
    <div className="w-[36px] shrink-0 sm:mt-4 sm:w-auto">
      <p className="mb-1.5 hidden items-center sm:flex gap-2 text-[10px] tracking-[0.25em] text-gold uppercase">
        <span className="h-px flex-1 bg-gold/40" />
        Other Views
        <span className="h-px flex-1 bg-gold/40" />
      </p>
      <div className="grid h-full grid-cols-1 content-between gap-1 sm:h-auto sm:grid-cols-5 sm:content-start sm:gap-2">
        {VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view.id)}
            aria-pressed={active === view.id}
            className={`overflow-hidden rounded-lg border transition ${
              active === view.id ? 'border-navy ring-1 ring-gold' : 'border-stone hover:border-gold'
            }`}
          >
            <span className="art-grid block">
              <BagArt
                type={templateId}
                view={view.id}
                size={size}
                fills={fills}
                studs={specs.studs === 'four'}
                charm={specs.charm === 'charm' || specs.charm === 'both'}
                opening={specs.opening}
                flap={specs.flap}
                className="mx-auto aspect-square w-full"
              />
            </span>
            <span
              className={`block py-0.5 text-[7px] tracking-widest sm:text-[9px] ${
                active === view.id ? 'bg-navy text-cream' : 'bg-white text-warm-gray'
              }`}
            >
              {view.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
