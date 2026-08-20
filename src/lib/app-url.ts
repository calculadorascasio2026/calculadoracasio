/** URL pública del sitio (QR, pedidos, WhatsApp). */
export function appBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  )
}
