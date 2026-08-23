'use client'

import { AddToCartButton } from '@/components/add-to-cart-button'
import { formatMoneyArs } from '@/lib/format'
import { useState } from 'react'

type Props = {
  productId: string
  name: string
  description?: string | null
  unitPrice: number
  originalPrice?: number | null
  imagePath?: string | null
  categoryName?: string | null
  stock?: number
  addLabel?: string
  titleTag?: 'h2' | 'h3' | 'h4'
}

export function ProductCardInfo({
  productId,
  name,
  description,
  unitPrice,
  originalPrice,
  imagePath,
  categoryName,
  stock,
  addLabel = 'Agregar',
  titleTag: Title = 'h4',
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const text = description?.trim() ?? ''
  const hasDescription = text.length > 0
  const hasOffer =
    typeof originalPrice === 'number' && originalPrice > unitPrice

  return (
    <div className="border-t border-white/5 p-3 sm:p-4">
      <Title className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm">{name}</Title>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        {hasOffer ? (
          <>
            <span className="text-[11px] text-casio-muted line-through">{formatMoneyArs(originalPrice)}</span>
            <span className="text-sm font-bold text-casio-lime sm:text-base">{formatMoneyArs(unitPrice)}</span>
          </>
        ) : (
          <span className="text-sm font-bold text-casio-lime sm:text-base">{formatMoneyArs(unitPrice)}</span>
        )}
        {hasDescription ? (
          <>
            <span className="text-xs text-casio-muted/40" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="border-0 bg-transparent p-0 text-[11px] font-medium text-casio-lime/85 underline-offset-2 transition hover:text-casio-lime hover:underline sm:text-xs"
              aria-expanded={detailsOpen}
            >
              {detailsOpen ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
          </>
        ) : null}
      </div>
      {detailsOpen ? (
        <p className="mt-2 whitespace-pre-wrap text-[11px] leading-relaxed text-casio-muted sm:text-xs">
          {text}
        </p>
      ) : null}
      {typeof stock === 'number' && stock < 1 ? (
        <p className="mt-1 text-[11px] font-medium text-casio-muted">Sin stock</p>
      ) : null}
      <AddToCartButton
        productId={productId}
        name={name}
        unitPrice={unitPrice}
        imagePath={imagePath}
        categoryName={categoryName}
        label={addLabel}
      />
    </div>
  )
}
