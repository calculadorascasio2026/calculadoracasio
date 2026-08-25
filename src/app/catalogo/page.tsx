import { CatalogPage } from '@/components/catalog-page'
import { JsonLd } from '@/components/json-ld'
import { fetchCategoriesWithProducts } from '@/lib/fetch-products'
import { itemListJsonLd, pageMetadata, siteUrl } from '@/lib/seo'
import { productImagePublicUrl } from '@/lib/image-url'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Catálogo de calculadoras Casio',
  description:
    'Explorá el catálogo completo de calculadoras Casio: científicas, ClassWiz, gráficas y más. Eduardo Viñolo, Mendoza.',
  path: '/catalogo',
})

export default async function CatalogoPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let categories: Awaited<ReturnType<typeof fetchCategoriesWithProducts>> = []

  try {
    const supabase = await createClient()
    categories = await fetchCategoriesWithProducts(supabase)
  } catch {
    /* sin env */
  }

  const allProducts = categories.flatMap((c) =>
    c.products.map((p) => ({
      name: p.name,
      description: p.description,
      image: productImagePublicUrl(supabaseUrl, p.image_path) ?? undefined,
      url: `${siteUrl()}/catalogo/${c.slug}`,
    })),
  )

  return (
    <>
      <JsonLd
        data={itemListJsonLd('Catálogo de calculadoras Casio — Viñolo', allProducts)}
      />
      <CatalogPage
        categories={categories}
        supabaseUrl={supabaseUrl}
        title="CATÁLOGO"
        subtitle="Todas las calculadoras Casio disponibles"
      />
    </>
  )
}
