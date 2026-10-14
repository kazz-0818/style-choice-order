import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_NOTE } from '../config/contact'
import type { BagCustomization } from '../types/bag'
import { GoldDivider } from './illustrations/Decor'
import { InquiryActions } from './InquiryActions'

interface InquirySectionProps {
  customization: BagCustomization
}

export function InquirySection({ customization }: InquirySectionProps) {
  return (
    <section id="inquiry" className="border-b border-stone bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-[10px] tracking-[0.4em] text-gold uppercase">Contact</p>
        <h2 className="mt-2 font-serif text-2xl font-light text-navy sm:text-3xl">
          あなたの『欲しい』を、
          <br className="sm:hidden" />
          まずはご相談ください。
        </h2>
        <GoldDivider className="mt-4" />
        <p className="mt-5 text-sm leading-relaxed text-warm-gray sm:text-base">
          仕様が完全に決まっていない段階でもご相談可能です。1点からのご依頼、小ロット製作、
          ロゴ刻印やオリジナル金具のご要望まで、用途に合わせてご提案いたします。
        </p>
        <div className="mt-10">
          <InquiryActions customization={customization} />
        </div>
        <p className="mt-8 text-xs text-warm-gray">
          {CONTACT_EMAIL} / {CONTACT_PHONE_DISPLAY}（{CONTACT_PHONE_NOTE}）
        </p>
      </div>
    </section>
  )
}
