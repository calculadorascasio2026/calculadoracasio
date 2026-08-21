'use client'

import { AddToCartButton } from '@/components/add-to-cart-button'
import { CasioMark } from '@/components/casio-mark'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { ProductRow } from '@/types/catalog'
import { useEffect } from 'react'

type Props = {
  product: ProductRow
  supabaseUrl: string
  categoryName?: string | null
  /** Precio a mostrar / agregar (ej. con descuento). Por defecto product.price */
  unitPrice?: number
  originalPrice?: number | null
  discountPercent?: number | null
  onClose: () => void
}

export function ProductDetailModal({
  product,
  supabaseUrl,
  categoryName,
  unitPrice,
  originalPrice,
  discountPercent,
  onClose,
}: Props) {
  const imgUrl = productImagePublicUrl(supabaseUrl, product.image_path)
  const price = unitPrice ?? product.price
  const hasOffer =
    typeof discountPercent === 'number' &&
    discountPercent > 0 &&
    typeof originalPrice === 'number' &&
    originalPrice > price

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default border-0 bg-transparent"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="relative z-10 flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/15 bg-casio-card shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className="relative flex aspect-[4/3] shrink-0 items-center justify-center bg-[#0a0a0a] px-6 py-4">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <CasioMark size="md" className="opacity-25" />
          )}
          {hasOffer ? (
            <span className="absolute left-3 top-3 rounded-md bg-casio-lime px-2 py-1 text-[10px] font-extrabold text-black">
              -{Math.round(discountPercent!)}%
            </span>
          ) : null}
          {product.stock < 1 ? (
            <span className="absolute right-3 top-3 rounded-md bg-black/80 px-2 py-1 text-[10px] font-bold uppercase text-white/90 ring-1 ring-white/20">
              Sin stock
            </span>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {categoryName ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-casio-muted">{categoryName}</p>
          ) : null}
          <h2 id="product-detail-title" className="mt-1 text-lg font-semibold leading-snug text-white">
            {product.name}
          </h2>
          {hasOffer ? (
            <div className="mt-2">
              <p className="text-sm text-casio-muted line-through">{formatMoneyArs(originalPrice!)}</p>
              <p className="text-xl font-bold text-casio-lime">{formatMoneyArs(price)}</p>
            </div>
          ) : (
            <p className="mt-2 text-xl font-bold text-casio-lime">{formatMoneyArs(price)}</p>
          )}
          {product.description?.trim() ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-casio-muted">
              {product.description.trim()}
            </p>
          ) : (
            <p className="mt-3 text-sm text-casio-muted">Sin descripción adicional.</p>
          )}
          <AddToCartButton
            productId={product.id}
            name={product.name}
            unitPrice={price}
            imagePath={product.image_path}
            categoryName={categoryName}
            className="mt-4 py-2.5 text-sm"
            label="Agregar al carrito"
          />
        </div>
      </div>
    </div>
  )
}
