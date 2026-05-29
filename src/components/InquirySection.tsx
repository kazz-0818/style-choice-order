import { useState } from 'react'
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
} from '../config/contact'
import type { BagCustomization } from '../types/bag'
import { buildInquiryText } from '../utils/inquiryText'

interface InquirySectionProps {
  customization: BagCustomization
}

export function InquirySection({ customization }: InquirySectionProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildInquiryText(customization))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const mailSubject = encodeURIComponent('オーダーメイドバッグのご相談')
  const mailBody = encodeURIComponent(buildInquiryText(customization))
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${mailSubject}&body=${mailBody}`

  return (
    <section id="inquiry" className="border-b border-stone bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-serif text-2xl font-light text-charcoal sm:text-3xl">
          完成イメージをもとに、製作相談へ。
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-warm-gray sm:text-base">
          仕様が完全に決まっていない段階でもご相談可能です。ショップ別注、イベント販売、ブランドオリジナル商品など、用途に合わせてご提案いたします。
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-charcoal px-6 py-3 text-sm tracking-wide transition hover:bg-charcoal hover:text-cream"
          >
            問い合わせ内容をコピー
          </button>
          <a
            href={mailto}
            className="rounded-full bg-charcoal px-6 py-3 text-sm tracking-wide text-cream transition hover:bg-brown-deep"
          >
            メールで問い合わせる
          </a>
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="rounded-full border border-stone bg-cream px-6 py-3 text-sm tracking-wide text-charcoal transition hover:border-gold"
          >
            電話で問い合わせる
          </a>
        </div>
        {copied && (
          <p className="mt-4 text-sm text-gold" role="status">
            コピーしました
          </p>
        )}
        <p className="mt-8 text-xs text-warm-gray">
          {CONTACT_EMAIL} / {CONTACT_PHONE_DISPLAY}
        </p>
      </div>
    </section>
  )
}
