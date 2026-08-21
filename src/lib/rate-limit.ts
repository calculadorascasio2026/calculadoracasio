/**
 * Rate limit simple en memoria (por instancia del server).
 * En Vercel no es global entre todas las regiones, pero frena abuso básico
 * contra /api/auth/login y /api/orders.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterSec: number
}

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs })
    return { ok: true, remaining: opts.limit - 1, retryAfterSec: Math.ceil(opts.windowMs / 1000) }
  }

  if (existing.count >= opts.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  return {
    ok: true,
    remaining: opts.limit - existing.count,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  }
}

/** IP detrás de Vercel / proxies. */
export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for')
  if (xf) {
    const first = xf.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')?.trim()
  if (real) return real
  return 'unknown'
}
