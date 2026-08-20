'use client'

import { useCart } from '@/context/cart-context'
import { appBaseUrl } from '@/lib/app-url'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import {
  buildOrderWhatsAppMessage,
  orderItemsFromCartLines,
  whatsappOrderUrl,
} from '@/lib/whatsapp-order'
import { useEffect, useState } from 'react'

type Props = {
  supabaseUrl: string
  whatsappE164?: string
}

export function StoreCartDrawer({ supabaseUrl, whatsappE164 }: Props) {
  const { lines, itemCount, subtotal, drawerOpen, closeDrawer, setQuantity, removeLine, clearCart } =
    useCart()
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [drawerOpen])

  if (!drawerOpen) return null

  async function handlePedir() {
    if (lines.length === 0) return
    if (!whatsappE164?.replace(/\D/g, '')) {
      alert('Falta configurar el WhatsApp de la tienda.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItemsFromCartLines(lines) }),
      })
      const js = (await res.json()) as { id?: string; error?: string }
      if (!res.ok || !js.id) throw new Error(js.error ?? 'Error')

      const orderUrl = `${appBaseUrl()}/p/${js.id}`
      const msg = buildOrderWhatsAppMessage(lines, subtotal, orderUrl)
      const url = whatsappOrderUrl(whatsappE164!, msg)
      clearCart()
      closeDrawer()
      window.location.assign(url)
    } catch (e) {
      console.error(e)
      alert('No se pudo armar el pedido. Intentá de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/55">
      <button
        type="button"
        className="min-h-0 min-w-0 flex-1 cursor-default border-0 bg-transparent p-0"
        aria-label="Cerrar carrito"
        onClick={closeDrawer}
      />
      <aside className="flex h-full min-h-0 w-full max-w-md flex-col border-l border-white/10 bg-casio-bg shadow-2xl">
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">Tu carrito</h2>
              <p className="text-[11px] text-casio-muted">
                {itemCount === 0 ? 'Vacío' : `${itemCount} producto${itemCount === 1 ? '' : 's'}`}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg p-2 text-casio-muted hover:bg-white/5 hover:text-white"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {lines.length === 0 ? (
            <p className="text-sm text-casio-muted">Todavía no agregaste productos.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((l) => {
                const thumb = productImagePublicUrl(supabaseUrl, l.imagePath)
                return (
                  <li
                    key={l.productId}
                    className="flex gap-3 rounded-xl border border-white/10 bg-casio-card p-3"
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-lg object-contain bg-black"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-black text-[9px] text-casio-muted">
                        sin foto
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium text-white">{l.name}</p>
                      {l.categoryName ? (
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-casio-muted">
                          {l.categoryName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm font-bold text-casio-lime">
                        {formatMoneyArs(l.unitPrice * l.quantity)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-sm hover:border-casio-lime/50"
                          onClick={() => setQuantity(l.productId, l.quantity - 1)}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm">{l.quantity}</span>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-sm hover:border-casio-lime/50"
                          onClick={() => setQuantity(l.productId, l.quantity + 1)}
                          aria-label="Sumar"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-[11px] text-casio-muted hover:text-red-300"
                          onClick={() => removeLine(l.productId)}
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-casio-muted">Total estimado</span>
            <span className="font-bold text-casio-lime">{formatMoneyArs(subtotal)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0 || sending}
            onClick={() => void handlePedir()}
            className="w-full rounded-xl bg-casio-lime px-4 py-3 text-sm font-bold text-black transition hover:bg-casio-lime-bright disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sending ? 'Preparando…' : 'Pedir por WhatsApp'}
          </button>
        </div>
      </aside>
    </div>
  )
}
