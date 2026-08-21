'use client'

import { CartHeaderButton } from '@/components/cart-header-button'
import { CasioMark } from '@/components/casio-mark'
import { FeaturedProductsCarousel } from '@/components/featured-products-carousel'
import type { ProductRow } from '@/types/catalog'
import Link from 'next/link'

type Props = {
  products: ProductRow[]
  supabaseUrl: string
}

export function DestacadosClient({ products, supabaseUrl }: Props) {
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
        <h1 className="mt-4 font-casio text-3xl tracking-[0.12em] text-casio-lime sm:text-4xl">DESTACADOS</h1>
        <p className="mt-1 text-sm text-casio-muted">Selección especial de la tienda</p>
      </header>

      <main className="px-2 pt-6 sm:px-4 lg:px-6">
        <FeaturedProductsCarousel products={products} supabaseUrl={supabaseUrl} />
      </main>
    </div>
  )
}
