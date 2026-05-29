const GLB_MAGIC = [0x67, 0x6c, 0x54, 0x46] as const // "glTF"

function isGlbBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false
  return GLB_MAGIC.every((value, index) => bytes[index] === value)
}

function isGlbContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase()
  if (normalized.includes('text/html')) return false
  return (
    normalized.includes('gltf') ||
    normalized.includes('octet-stream') ||
    normalized.includes('model/')
  )
}

/**
 * GLB の実在を確認する。
 * SPA の index.html フォールバック（text/html 200）を誤検知しないよう Content-Type と magic bytes を検証。
 */
export async function checkModelExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-3' },
    })

    if (!response.ok && response.status !== 206) return false

    const contentType = response.headers.get('content-type') ?? ''
    if (contentType && !isGlbContentType(contentType)) return false

    const buffer = await response.arrayBuffer()
    return isGlbBytes(new Uint8Array(buffer))
  } catch {
    return false
  }
}
