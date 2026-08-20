const BUCKET = 'product-images'

export function productImagePublicUrl(supabaseUrl: string, imagePath: string | null | undefined): string | null {
  if (!imagePath?.trim() || !supabaseUrl) return null
  const base = supabaseUrl.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/${BUCKET}/${imagePath.replace(/^\//, '')}`
}
