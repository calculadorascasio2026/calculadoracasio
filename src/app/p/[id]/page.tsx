import { CasioMark } from '@/components/casio-mark'
import { appBaseUrl } from '@/lib/app-url'
import { formatDateTimeAr, formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { OrderItem } from '@/lib/order-items'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type OrderRow = {
  id: string
  items: OrderItem[]
  total: number
  status: string
  created_at: string
}

export default async function PublicOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_public_order', { p_id: id }).maybeSingle()

  if (error || !data) notFound()

  const order = data as OrderRow
  const items = Array.isArray(order.items) ? order.items : []
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const shareUrl = `${appBaseUrl()}/p/${order.id}`

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-casio-bg px-4 py-8 text-casio-text sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-xs text-casio-lime hover:underline">
          ← Volver a la tienda
        </Link>
        <CasioMark size="sm" className="opacity-80" />
      </div>

      <h1 className="font-casio text-3xl tracking-[0.12em] text-casio-lime">PEDIDO</h1>
      <p className="mt-1 text-sm text-casio-muted">{formatDateTimeAr(order.created_at)}</p>
      <p className="mt-1 text-[11px] text-casio-muted">
        Estado: {order.status === 'pending' ? 'Pendiente' : order.status === 'seen' ? 'Visto' : 'Cerrado'}
      </p>

      <ul className="mt-6 space-y-3">
        {items.map((it, i) => {
          const thumb = productImagePublicUrl(supabaseUrl, it.image_path ?? null)
          return (
            <li
              key={`${it.product_id}-${i}`}
              className="flex gap-3 rounded-xl border border-white/10 bg-casio-card p-3"
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumb} alt="" className="h-16 w-16 rounded-lg object-contain bg-black" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-black text-[9px] text-casio-muted">
                  sin foto
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{it.name}</p>
                {it.category_name ? (
                  <p className="text-[10px] uppercase tracking-wide text-casio-muted">{it.category_name}</p>
                ) : null}
                <p className="mt-1 text-xs text-casio-muted">
                  {it.quantity} × {formatMoneyArs(it.unit_price)}
                </p>
                <p className="text-sm font-bold text-casio-lime">
                  {formatMoneyArs(it.unit_price * it.quantity)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-casio-card px-4 py-3">
        <span className="text-sm text-casio-muted">Total</span>
        <span className="text-lg font-bold text-casio-lime">{formatMoneyArs(Number(order.total))}</span>
      </div>

      <p className="mt-4 break-all text-[11px] text-casio-muted">Link: {shareUrl}</p>
    </div>
  )
}
