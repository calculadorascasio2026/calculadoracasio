import { CatalogPage } from '@/components/catalog-page'
import { JsonLd } from '@/components/json-ld'
import { fetchCategoriesWithProducts } from '@/lib/fetch-products'
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata, siteUrl } from '@/lib/seo'
import { productImagePublicUrl } from '@/lib/image-url'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('categories').select('name').eq('slug', slug).maybeSingle()
    if (!data) return pageMetadata({ noIndex: true })
    const name = String(data.name)
    return pageMetadata({
      title: `Calculadoras ${name} Casio`,
      description: `Calculadoras Casio ${name} en Mendoza. Catálogo Eduardo Viñolo — consultá por WhatsApp.`,
      path: `/catalogo/${slug}`,
    })
  } catch {
    return pageMetadata({ path: `/catalogo/${slug}` })
  }
}

export default async function CatalogoCategoriaPage({ params }: Props) {
  const { slug } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let categories: Awaited<ReturnType<typeof fetchCategoriesWithProducts>> = []

  try {
    const supabase = await createClient()
    categories = await fetchCategoriesWithProducts(supabase)
  } catch {
    /* sin env */
  }

  const category = categories.find((c) => c.slug === slug)
  if (!category) notFound()

  const products = category.products.map((p) => ({
    name: p.name,
    description: p.description,
    image: productImagePublicUrl(supabaseUrl, p.image_path) ?? undefined,
    url: `${siteUrl()}/catalogo/${slug}`,
  }))

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Catálogo', path: '/catalogo' },
            { name: category.name, path: `/catalogo/${slug}` },
          ]),
          itemListJsonLd(`Calculadoras ${category.name} — Viñolo Casio`, products),
        ]}
      />
      <CatalogPage
        categories={categories}
        supabaseUrl={supabaseUrl}
        activeCategorySlug={slug}
        title={category.name.toUpperCase()}
        subtitle={`Calculadoras Casio — ${category.name}`}
      />
    </>
  )
}
