import { DestacadosClient } from '@/components/destacados-client'
import { PublicCatalogPage } from '@/components/public-catalog-page'
import { fetchFeaturedProducts } from '@/lib/fetch-featured'
import { pageMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Calculadoras Casio destacadas',
  description: 'Selección especial de calculadoras Casio recomendadas por Eduardo Viñolo.',
  path: '/destacados',
})

export default async function DestacadosPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let products: Awaited<ReturnType<typeof fetchFeaturedProducts>> = []

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

  return <DestacadosClient products={products} supabaseUrl={supabaseUrl} />
}
