'use client'

import { AddToCartButton } from '@/components/add-to-cart-button'
import { CartHeaderButton } from '@/components/cart-header-button'
import { CasioMark } from '@/components/casio-mark'
import { ProductDetailModal } from '@/components/product-detail-modal'
import { formatMoneyArs } from '@/lib/format'
import { productImagePublicUrl } from '@/lib/image-url'
import type { ProductRow } from '@/types/catalog'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export type PublicProductCard = ProductRow & {
  discount_percent?: number | null
}

type Props = {
  title: string
  subtitle: string
  products: PublicProductCard[]
  supabaseUrl: string
  emptyMessage: string
}

export function PublicCatalogPage({ title, subtitle, products, supabaseUrl, emptyMessage }: Props) {
  const [detail, setDetail] = useState<PublicProductCard | null>(null)
  const detailDiscount = Number(detail?.discount_percent ?? 0)
  const detailHasOffer = detailDiscount > 0
  const detailFinal = detail
    ? detailHasOffer
      ? detail.price * (1 - detailDiscount / 100)
      : detail.price
    : 0

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-casio-bg pb-10 text-casio-text sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xs text-casio-lime hover:underline">
            ← Volver a la tienda
          </Link>
          <div className="flex items-center gap-2">
            <CasioMark size="sm" className="opacity-80" />
            <CartHeaderButton />
          </div>
        </div>
        <h1 className="mt-4 font-casio text-3xl tracking-[0.12em] text-casio-lime sm:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-casio-muted">{subtitle}</p>
      </header>

      <main className="px-4 pt-6 sm:px-6 lg:px-8">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-sm text-casio-muted">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const imgUrl = productImagePublicUrl(supabaseUrl, p.image_path)
              const discount = Number(p.discount_percent ?? 0)
              const hasOffer = discount > 0
              const finalPrice = hasOffer ? p.price * (1 - discount / 100) : p.price

              return (
                <article
                  key={p.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-casio-card"
                >
                  <button
                    type="button"
                    onClick={() => setDetail(p)}
                    className="relative flex aspect-[4/5] w-full items-end justify-center bg-[#0a0a0a] px-3 pt-4 text-left"
                    aria-label={`Ver detalle de ${p.name}`}
                  >
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={p.name}
                        width={140}
                        height={140}
                        className="max-h-[85%] w-auto object-contain drop-shadow-md"
                        unoptimized
                      />
                    ) : (
                      <CasioMark size="sm" className="opacity-20" />
                    )}
                    {hasOffer ? (
                      <span className="absolute left-2 top-2 rounded-md bg-casio-lime px-2 py-1 text-[10px] font-extrabold text-black">
                        -{Math.round(discount)}%
                      </span>
                    ) : null}
                    {p.stock < 1 ? (
                      <span className="absolute right-2 top-2 rounded-md bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 ring-1 ring-white/20">
                        Sin stock
                      </span>
                    ) : null}
                  </button>
                  <div className="border-t border-white/5 p-3 sm:p-4">
                    <h2 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">{p.name}</h2>
                    {hasOffer ? (
                      <div className="mt-2">
                        <p className="text-[11px] text-casio-muted line-through">{formatMoneyArs(p.price)}</p>
                        <p className="text-sm font-bold text-casio-lime sm:text-base">{formatMoneyArs(finalPrice)}</p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-bold text-casio-lime sm:text-base">{formatMoneyArs(p.price)}</p>
                    )}
                    <AddToCartButton
                      productId={p.id}
                      name={p.name}
                      unitPrice={finalPrice}
                      imagePath={p.image_path}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      {detail ? (
        <ProductDetailModal
          product={detail}
          supabaseUrl={supabaseUrl}
          unitPrice={detailFinal}
          originalPrice={detailHasOffer ? detail.price : null}
          discountPercent={detailHasOffer ? detailDiscount : null}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </div>
  )
}
