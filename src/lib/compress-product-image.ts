const MAX_EDGE_PX = 1200
const WEBP_QUALITY = 0.82

/** Comprime fotos de producto antes de subirlas a Storage (máx. 1200 px, WebP). */
export async function compressProductImageFile(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file
  if (typeof createImageBitmap !== 'function') return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  try {
    let { width, height } = bitmap
    const longest = Math.max(width, height)
    if (longest > MAX_EDGE_PX) {
      const scale = MAX_EDGE_PX / longest
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.drawImage(bitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY)
    })
    if (!blob) return file

    const baseName = file.name.replace(/\.[^.]+$/i, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'imagen'
    return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
  } finally {
    bitmap.close()
  }
}
