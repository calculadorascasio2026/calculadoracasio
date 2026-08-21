import { DestacadosClient } from '@/components/destacados-client'
import { PublicCatalogPage } from '@/components/public-catalog-page'
import { fetchFeaturedProducts } from '@/lib/fetch-featured'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

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
