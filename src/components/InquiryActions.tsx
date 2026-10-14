import { useState } from 'react'
import { CONTACT_PHONE_TEL } from '../config/contact'
import type { BagCustomization } from '../types/bag'
import { buildInquiryText } from '../utils/inquiryText'
import { capturePreviewViews } from '../utils/threeD/previewCapture'
import { createZip } from '../utils/zip'
import { InquirySendButton } from './InquirySendButton'
import { Icon } from './illustrations/icons'

interface InquiryActionsProps {
  customization: BagCustomization
  /** 問い合わせ欄は横並び、確認ステップは縦積み */
  layout?: 'row' | 'stack'
}

export function InquiryActions({ customization, layout = 'row' }: InquiryActionsProps) {
  const [copied, setCopied] = useState(false)
  const [photoState, setPhotoState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const stacked = layout === 'stack'
  const sendClass = stacked
    ? 'flex w-full items-center justify-center gap-2 rounded-full border border-navy bg-navy py-2.5 text-center text-xs tracking-wide text-cream transition hover:bg-navy-dark disabled:opacity-60 sm:py-3 sm:text-sm'
    : 'flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 text-sm tracking-wide text-cream transition hover:bg-navy-dark disabled:opacity-60 sm:w-auto'
  const outlineClass = stacked
    ? 'flex w-full items-center justify-center gap-2 rounded-full border border-navy py-2.5 text-xs tracking-wide text-navy transition hover:bg-navy hover:text-cream disabled:opacity-60 sm:py-3 sm:text-sm'
    : 'flex items-center justify-center gap-2 rounded-full border border-navy px-6 py-3 text-sm tracking-wide text-navy transition hover:bg-navy hover:text-cream disabled:opacity-60'
  const phoneClass = stacked
    ? 'flex w-full items-center justify-center gap-2 rounded-full border border-gold bg-white py-2.5 text-xs tracking-wide text-navy transition hover:bg-gold-light/30 sm:py-3 sm:text-sm'
    : 'flex items-center justify-center gap-2 rounded-full border border-gold bg-white px-6 py-3 text-sm tracking-wide text-navy transition hover:bg-gold-light/30'

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
      console.error('[InquiryActions] photo capture failed:', e)
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

  return (
    <div className={stacked ? 'mt-4 sm:mt-5' : undefined}>
      <div className={stacked ? 'flex flex-col gap-2.5' : 'flex flex-col gap-3 sm:flex-row sm:justify-center'}>
        <InquirySendButton
          customization={customization}
          className={sendClass}
          wrapClassName={stacked ? 'w-full' : 'w-full sm:w-auto'}
        />
        <button type="button" onClick={handleCopy} className={outlineClass}>
          問い合わせ内容をコピー
        </button>
        <button
          type="button"
          onClick={handleSavePhotos}
          disabled={photoState === 'busy'}
          className={outlineClass}
        >
          <Icon name="bag" size={16} />
          {photoState === 'busy' ? '写真を作成中…' : 'プレビュー写真を保存（5枚）'}
        </button>
        <a href={`tel:${CONTACT_PHONE_TEL}`} className={phoneClass}>
          <Icon name="phone" size={16} />
          電話で問い合わせる
        </a>
      </div>
      {copied && (
        <p className={`mt-3 text-gold ${stacked ? 'text-center text-xs sm:text-sm' : 'text-sm'}`} role="status">
          コピーしました
        </p>
      )}
      <p className={`mt-3 leading-relaxed text-warm-gray ${stacked ? 'text-[10px] sm:text-xs' : 'text-xs'}`}>
        「こちらの内容で問い合わせる」を押すと、プレビュー写真（表・裏・側面・上・下）が自動で添付されます。
        メーラーが開いたら、そのまま送信してください。
      </p>
      {photoState === 'done' && (
        <p className={`mt-2 text-gold ${stacked ? 'text-xs sm:text-sm' : 'text-sm'}`} role="status">
          ZIPを保存しました。メールに添付してお送りください
        </p>
      )}
      {photoState === 'error' && (
        <p className={`mt-2 text-red-700 ${stacked ? 'text-xs sm:text-sm' : 'text-sm'}`} role="alert">
          写真を作成できませんでした。3Dプレビューが表示されているか確認してください
        </p>
      )}
    </div>
  )
}
