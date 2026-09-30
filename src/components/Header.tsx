import { DoLogo } from './illustrations/Decor'

const NAV_ITEMS = [
  { href: '#features', label: '特徴' },
  { href: '#lineup', label: 'バッグ型' },
  { href: '#customizer', label: 'カスタム' },
  { href: '#flow', label: '製作の流れ' },
  { href: '#inquiry', label: '問い合わせ' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone/80 bg-cream/95 text-charcoal backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="Desfy Origouf トップへ">
          <DoLogo size={38} />
          <span className="leading-tight">
            <span className="block font-serif text-sm tracking-[0.12em] text-charcoal sm:text-base">
              Desfy Origouf
            </span>
            <span className="hidden text-[9px] tracking-[0.3em] text-warm-gray sm:block">
              FULL ORDER MADE
            </span>
          </span>
        </a>
        <nav
          className="flex max-w-[52vw] gap-5 overflow-x-auto pb-0.5 text-xs tracking-wide text-warm-gray sm:max-w-none sm:gap-6 sm:text-sm"
          aria-label="メインナビゲーション"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap transition-colors hover:text-charcoal"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
