import { PublicCatalogPage } from '@/components/public-catalog-page'
import { compareByName } from '@/lib/sort-catalog'
import { createClient } from '@/lib/supabase/server'
import type { ProductRow } from '@/types/catalog'

export const dynamic = 'force-dynamic'

export default async function OfertasPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  let products: Array<ProductRow & { discount_percent: number }> = []

  try {
    const supabase = await createClient()
    const { data: offers } = await supabase
      .from('product_offers')
      .select('product_id, discount_percent')
      .eq('active', true)

    const ids = (offers ?? []).map((o) => o.product_id)
    if (ids.length > 0) {
      const { data: rows } = await supabase
        .from('products')
        .select('*')
        .in('id', ids)
        .eq('active', true)

      const discountById = new Map((offers ?? []).map((o) => [o.product_id, Number(o.discount_percent)]))
      products = (rows ?? []).map((row) => ({
        id: String(row.id),
        category_id: String(row.category_id),
        name: String(row.name),
        description: row.description != null ? String(row.description) : null,
        price: Number(row.price),
        image_path: row.image_path != null ? String(row.image_path) : null,
        active: Boolean(row.active),
        stock: Number(row.stock ?? 0),
        sort_order: Number(row.sort_order ?? 0),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
        discount_percent: discountById.get(String(row.id)) ?? 0,
      }))
      products.sort(compareByName)
    }
  } catch {
    /* sin env */
  }

  return (
    <PublicCatalogPage
      title="OFERTAS"
      subtitle="Productos con descuento especiales"
      products={products}
      supabaseUrl={supabaseUrl}
      emptyMessage="Todavía no hay ofertas publicadas."
    />
  )
}
