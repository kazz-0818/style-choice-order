const NAV_ITEMS = [
  { href: '#features', label: '特徴' },
  { href: '#customizer', label: 'カスタム' },
  { href: '#flow', label: '流れ' },
  { href: '#inquiry', label: '問い合わせ' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone/80 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a
          href="#"
          className="shrink-0 font-serif text-sm tracking-[0.2em] text-charcoal uppercase sm:text-base"
        >
          Style Choice Order
        </a>
        <nav
          className="flex max-w-[60vw] gap-6 overflow-x-auto pb-0.5 text-xs tracking-wide text-warm-gray sm:max-w-none sm:text-sm"
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
