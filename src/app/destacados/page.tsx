import { CasioMark } from '@/components/casio-mark'
import { FeaturedProductsCarousel } from '@/components/featured-products-carousel'
import { PublicCatalogPage } from '@/components/public-catalog-page'
import { fetchFeaturedProducts } from '@/lib/fetch-featured'
import { createClient } from '@/lib/supabase/server'
import type { ProductRow } from '@/types/catalog'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DestacadosPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let products: ProductRow[] = []

  try {
    const supabase = await createClient()
    products = await fetchFeaturedProducts(supabase)
  } catch {
    /* sin env */
  }

  if (products.length === 0) {
    return (
      <PublicCatalogPage
        title="DESTACADOS"
        subtitle="Selección especial de la tienda"
        products={[]}
        supabaseUrl={supabaseUrl}
        emptyMessage="Todavía no hay productos destacados."
      />
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-casio-bg pb-10 text-casio-text sm:max-w-xl md:max-w-3xl lg:max-w-5xl">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-xs text-casio-lime hover:underline">
            ← Volver a la tienda
          </Link>
          <CasioMark size="sm" className="opacity-80" />
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
