import { COMPANY_NAME, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../config/contact'
import { DoLogo } from './illustrations/Decor'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gold/30 bg-navy-dark py-10 text-cream/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <DoLogo size={44} />
          <div>
            <p className="font-serif text-sm tracking-[0.15em] text-gold-light">Desfy Original</p>
            <p className="mt-0.5 text-[10px] tracking-[0.3em] text-cream/50">FULL ORDER MADE</p>
          </div>
        </div>
        <div className="text-xs leading-relaxed">
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="block hover:text-gold-light">
            TEL {CONTACT_PHONE_DISPLAY}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:text-gold-light">
            {CONTACT_EMAIL}
          </a>
        </div>
        <p className="text-xs text-cream/50">
          © {year} {COMPANY_NAME}
        </p>
      </div>
    </footer>
  )
}
