'use client'

import { useCart } from '@/context/cart-context'

type Props = {
  productId: string
  name: string
  unitPrice: number
  imagePath?: string | null
  categoryName?: string | null
  className?: string
  label?: string
}

export function AddToCartButton({
  productId,
  name,
  unitPrice,
  imagePath,
  categoryName,
  className = '',
  label = 'Agregar',
}: Props) {
  const { addProduct } = useCart()

  return (
    <button
      type="button"
      onClick={() =>
        addProduct({
          productId,
          name,
          unitPrice,
          imagePath,
          categoryName,
        })
      }
      className={`mt-2 w-full rounded-lg bg-casio-lime/90 px-2 py-1.5 text-[11px] font-bold tracking-wide text-black transition hover:bg-casio-lime sm:text-xs ${className}`}
    >
      {label}
    </button>
  )
}
