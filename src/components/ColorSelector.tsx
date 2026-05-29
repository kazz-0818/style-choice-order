import { COLORS } from '../data/colors'
import { BAG_LAYERS, type BagLayer } from '../types/bag'

interface ColorSelectorProps {
  activeLayer: BagLayer
  layerColors: Record<BagLayer, string>
  onLayerChange: (layer: BagLayer) => void
  onColorSelect: (layer: BagLayer, colorId: string) => void
}

export function ColorSelector({
  activeLayer,
  layerColors,
  onLayerChange,
  onColorSelect,
}: ColorSelectorProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div>
        <h3 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
          編集するパーツ
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
          {BAG_LAYERS.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayerChange(layer.id)}
              className={`rounded-full px-2 py-1 text-[10px] transition sm:px-3 sm:py-1.5 sm:text-xs ${
                activeLayer === layer.id
                  ? 'bg-kogicha text-cream'
                  : 'border border-stone bg-white text-warm-gray hover:border-gold'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-widest text-warm-gray uppercase sm:text-xs">
          カラー — {BAG_LAYERS.find((l) => l.id === activeLayer)?.label}
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:mt-3 sm:grid-cols-6 sm:gap-2">
          {COLORS.map((color) => {
            const selected = layerColors[activeLayer] === color.id
            return (
              <button
                key={color.id}
                type="button"
                title={color.name}
                onClick={() => onColorSelect(activeLayer, color.id)}
                className={`group flex flex-col items-center gap-0.5 rounded-lg p-1 transition sm:gap-1 sm:rounded-xl sm:p-1.5 ${
                  selected ? 'ring-2 ring-gold ring-offset-1 sm:ring-offset-2' : 'hover:bg-stone/50'
                }`}
              >
                <span
                  className="h-6 w-6 rounded-full border border-charcoal/10 shadow-sm transition group-hover:scale-105 sm:h-8 sm:w-8"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="max-w-full truncate text-[10px] text-warm-gray">
                  {color.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
