import { COMPANY_NAME, CONTACT_EMAIL } from '../config/contact'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-stone bg-kogicha-dark py-10 text-cream/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-serif text-sm tracking-widest text-cream">Style Choice Order</p>
          <p className="mt-1 text-xs text-cream/60">{COMPANY_NAME}</p>
        </div>
        <p className="text-xs">
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gold-light">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-xs text-cream/50">© {year} Style Choice LLC</p>
      </div>
    </footer>
  )
}
