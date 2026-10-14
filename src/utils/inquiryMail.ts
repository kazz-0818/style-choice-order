import { CONTACT_EMAIL } from '../config/contact'
import type { BagCustomization } from '../types/bag'
import { capturePreviewViews, type CapturedView } from './threeD/previewCapture'
import { buildInquiryMailtoUrl, buildInquiryText } from './inquiryText'

export const INQUIRY_SUBJECT = 'フルオーダーメイドバッグのご相談'

export type InquirySendResult = 'shared' | 'draft' | 'mailto'

function bytesToBase64(bytes: Uint8Array): string {
  let s = ''
  const step = 0x8000
  for (let i = 0; i < bytes.length; i += step) {
    s += String.fromCharCode(...bytes.subarray(i, i + step))
  }
  return btoa(s)
}

function wrap76(s: string): string {
  return s.replace(/.{1,76}/g, (m) => `${m}\r\n`).trimEnd()
}

function encodeHeader(text: string): string {
  return `=?UTF-8?B?${bytesToBase64(new TextEncoder().encode(text))}?=`
}

/** メール添付用に JPEG へ変換（容量を抑える） */
export async function blobToJpeg(blob: Blob, max = 900, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d is unavailable')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const jpeg = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('jpeg encode failed'))), 'image/jpeg', quality)
  })
  return jpeg
}

export async function viewsToJpegFiles(views: CapturedView[]): Promise<File[]> {
  return Promise.all(
    views.map(async (v) => {
      const jpeg = await blobToJpeg(v.blob)
      const name = v.fileName.replace(/\.png$/i, '.jpg')
      return new File([jpeg], name, { type: 'image/jpeg' })
    }),
  )
}

/** 添付付きの未送信メール（.eml）。メーラーで開くと写真が付いた下書きになる */
export async function buildInquiryEml(body: string, files: File[]): Promise<Blob> {
  const boundary = `----=_Desfy_${Date.now().toString(16)}`
  const parts: string[] = [
    `To: ${CONTACT_EMAIL}`,
    `Subject: ${encodeHeader(INQUIRY_SUBJECT)}`,
    'MIME-Version: 1.0',
    'X-Unsent: 1',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrap76(bytesToBase64(new TextEncoder().encode(body))),
  ]

  for (const file of files) {
    const data = new Uint8Array(await file.arrayBuffer())
    parts.push(
      `--${boundary}`,
      `Content-Type: ${file.type || 'application/octet-stream'}; name="${file.name}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${file.name}"`,
      '',
      wrap76(bytesToBase64(data)),
    )
  }
  parts.push(`--${boundary}--`, '')
  return new Blob([parts.join('\r\n')], { type: 'message/rfc822' })
}

function openMailto(customization: BagCustomization) {
  window.location.href = buildInquiryMailtoUrl(customization)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 15000)
}

/**
 * プレビュー5枚を添付して問い合わせメールを開く。
 * 1) 共有シート（スマホ） 2) 添付付き .eml 下書き 3) mailto（写真なし）
 */
export async function sendInquiryWithPhotos(customization: BagCustomization): Promise<InquirySendResult> {
  const text = buildInquiryText(customization)
  let files: File[] = []
  try {
    const views = await capturePreviewViews()
    files = await viewsToJpegFiles(views)
  } catch {
    openMailto(customization)
    return 'mailto'
  }

  const shareData = { title: INQUIRY_SUBJECT, text, files }
  if (typeof navigator.canShare === 'function' && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      return 'shared'
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e
    }
  }

  const eml = await buildInquiryEml(text, files)
  downloadBlob(eml, 'desfy-origouf-inquiry.eml')
  return 'draft'
}
