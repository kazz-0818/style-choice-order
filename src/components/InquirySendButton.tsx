import { useState } from 'react'
import type { BagCustomization } from '../types/bag'
import { sendInquiryWithPhotos } from '../utils/inquiryMail'
import { Icon } from './illustrations/icons'

interface InquirySendButtonProps {
  customization: BagCustomization
  className?: string
}

export function InquirySendButton({ customization, className }: InquirySendButtonProps) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')

  const handleClick = async () => {
    setState('busy')
    try {
      await sendInquiryWithPhotos(customization)
      setState('done')
      window.setTimeout(() => setState('idle'), 4000)
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        setState('idle')
        return
      }
      console.error('[InquirySendButton]', e)
      setState('error')
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'busy'}
        className={className}
      >
        <Icon name="mail" size={16} />
        {state === 'busy' ? '写真を添付しています…' : 'こちらの内容で問い合わせる'}
      </button>
      {state === 'done' && (
        <p className="mt-2 text-center text-xs text-gold sm:text-sm" role="status">
          プレビュー写真を添付したメール下書きを開きました。送信して完了してください
        </p>
      )}
      {state === 'error' && (
        <p className="mt-2 text-center text-xs text-red-700 sm:text-sm" role="alert">
          メールを用意できませんでした。もう一度お試しください
        </p>
      )}
    </div>
  )
}
