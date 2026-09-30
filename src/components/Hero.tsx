import { BagArt } from './illustrations/BagArt'
import { DoLogo, FrameCorner, GoldDivider } from './illustrations/Decor'
import { BAG_TEMPLATES } from '../data/bagTemplates'
import type { BagTemplateId } from '../types/bag'

/** 表紙（紺地＋金枠）をイメージしたヒーロー */
interface HeroProps {
  onSelectTemplate?: (id: BagTemplateId) => void
}

export function Hero({ onSelectTemplate }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-stone bg-gradient-to-b from-white to-cream text-charcoal">
      <div className="pointer-events-none absolute inset-3 border border-gold/60 sm:inset-6" />
      <div className="pointer-events-none absolute inset-4 border border-gold/20 sm:inset-8" />
      <FrameCorner className="pointer-events-none absolute top-3 left-3 h-12 w-12 sm:top-6 sm:left-6 sm:h-20 sm:w-20" />
      <FrameCorner className="pointer-events-none absolute top-3 right-3 h-12 w-12 -scale-x-100 sm:top-6 sm:right-6 sm:h-20 sm:w-20" />
      <FrameCorner className="pointer-events-none absolute bottom-3 left-3 h-12 w-12 -scale-y-100 sm:bottom-6 sm:left-6 sm:h-20 sm:w-20" />
      <FrameCorner className="pointer-events-none absolute right-3 bottom-3 h-12 w-12 -scale-100 sm:right-6 sm:bottom-6 sm:h-20 sm:w-20" />

      <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:px-10 sm:py-24">
        <DoLogo size={84} className="mx-auto" />
        <h1 className="mt-4 font-serif text-3xl font-light tracking-[0.14em] text-kogicha sm:text-5xl">
          Desfy Origouf
        </h1>
        <p className="mt-2 text-[10px] tracking-[0.5em] text-gold sm:text-xs">FULL ORDER MADE</p>
        <GoldDivider className="mt-5" />

        <p className="mt-6 font-serif text-lg leading-relaxed text-charcoal sm:text-2xl">
          あなたの『欲しい』をカタチにします。
        </p>
        <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-warm-gray sm:text-sm">
          本革・合皮・布・ファー・化学繊維から素材を選び、デザイン・サイズ・細部の仕様まで。
          1点から製作できるフルオーダーメイドバッグです。
        </p>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:mt-10 sm:grid-cols-4 lg:grid-cols-7 sm:gap-3">
          {BAG_TEMPLATES.map((template) => (
            <a
              key={template.id}
              href="#customizer"
              onClick={() => onSelectTemplate?.(template.id)}
              className="group rounded-lg border border-stone bg-white p-1.5 transition hover:border-gold hover:shadow-sm"
              aria-label={`${template.name}をカスタムする`}
            >
              <BagArt
                type={template.id}
                lineColor="#523a2c"
                paper="#ffffff"
                className="mx-auto aspect-square w-full"
              />
              <span className="block truncate text-[9px] tracking-wide text-warm-gray group-hover:text-kogicha sm:text-[10px]">
                {template.name}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4">
          <a
            href="#customizer"
            className="inline-flex w-full items-center justify-center rounded-full border border-kogicha bg-kogicha px-8 py-3.5 text-sm tracking-wide text-cream transition hover:bg-kogicha-dark sm:w-auto"
          >
            バッグをカスタムする
          </a>
          <a
            href="#flow"
            className="inline-flex w-full items-center justify-center rounded-full border border-charcoal/20 bg-white px-8 py-3.5 text-sm tracking-wide text-charcoal transition hover:border-gold hover:text-gold sm:w-auto"
          >
            製作の流れを見る
          </a>
        </div>
      </div>
    </section>
  )
}
