import { useState } from 'react'
import { CONTACT_EMAIL, CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../config/contact'
import type { BagCustomization } from '../types/bag'
import { createZip } from '../utils/zip'
import { capturePreviewViews } from '../utils/threeD/previewCapture'
import { buildInquiryMailtoUrl, buildInquiryText } from '../utils/inquiryText'
import { GoldDivider } from './illustrations/Decor'
import { Icon } from './illustrations/icons'

interface InquirySectionProps {
  customization: BagCustomization
}

export function InquirySection({ customization }: InquirySectionProps) {
  const [copied, setCopied] = useState(false)
  const [photoState, setPhotoState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  /** プレビューの表・裏・側面・上・下の写真と仕様テキストを ZIP にして保存する */
  const handleSavePhotos = async () => {
    setPhotoState('busy')
    try {
      const views = await capturePreviewViews()
      const entries = await Promise.all(
        views.map(async (v) => ({ name: v.fileName, data: new Uint8Array(await v.blob.arrayBuffer()) })),
      )
      entries.push({
        name: 'spec.txt',
        data: new TextEncoder().encode(buildInquiryText(customization)),
      })
      const url = URL.createObjectURL(createZip(entries))
      const a = document.createElement('a')
      a.href = url
      a.download = 'desfy-origouf-preview.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 10000)
      setPhotoState('done')
    } catch (e) {
      console.error('[InquirySection] photo capture failed:', e)
      setPhotoState('error')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildInquiryText(customization))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }

  const mailto = buildInquiryMailtoUrl(customization)

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
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={mailto}
            className="flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm tracking-wide text-cream transition hover:bg-navy-dark"
          >
            <Icon name="mail" size={16} />
            こちらの内容で問い合わせる
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-navy px-6 py-3 text-sm tracking-wide text-navy transition hover:bg-navy hover:text-cream"
          >
            問い合わせ内容をコピー
          </button>
          <button
            type="button"
            onClick={handleSavePhotos}
            disabled={photoState === 'busy'}
            className="flex items-center justify-center gap-2 rounded-full border border-navy px-6 py-3 text-sm tracking-wide text-navy transition hover:bg-navy hover:text-cream disabled:opacity-60"
          >
            <Icon name="bag" size={16} />
            {photoState === 'busy' ? '写真を作成中…' : 'プレビュー写真を保存（5枚）'}
          </button>
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="flex items-center justify-center gap-2 rounded-full border border-gold bg-white px-6 py-3 text-sm tracking-wide text-navy transition hover:bg-gold-light/30"
          >
            <Icon name="phone" size={16} />
            電話で問い合わせる
          </a>
        </div>
        {copied && (
          <p className="mt-4 text-sm text-gold" role="status">
            コピーしました
          </p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-warm-gray">
          メールにプレビュー写真（表・裏・側面・上・下）を添付する場合は、先に「プレビュー写真を保存」を押して、
          保存されたZIPをメールに添付してください。
        </p>
        {photoState === 'done' && (
          <p className="mt-2 text-sm text-gold" role="status">
            ZIPを保存しました。メールに添付してお送りください
          </p>
        )}
        {photoState === 'error' && (
          <p className="mt-2 text-sm text-red-700" role="alert">
            写真を作成できませんでした。3Dプレビューが表示されているか確認してください
          </p>
        )}
        <p className="mt-8 text-xs text-warm-gray">
          {CONTACT_EMAIL} / {CONTACT_PHONE_DISPLAY}
        </p>
      </div>
    </section>
  )
}
