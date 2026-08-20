import type { SupabaseClient } from '@supabase/supabase-js'
import type { ProductRow } from '@/types/catalog'

function mapProduct(row: Record<string, unknown>): ProductRow {
  return {
    id: String(row.id),
    category_id: String(row.category_id),
    name: String(row.name),
    description: row.description != null ? String(row.description) : null,
    price: Number(row.price),
    image_path: row.image_path != null ? String(row.image_path) : null,
    active: Boolean(row.active),
    stock: Number(row.stock ?? (row.in_stock === false ? 0 : 1)),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

/** Productos marcados como destacados (activos), en orden de marketing. */
export async function fetchFeaturedProducts(supabase: SupabaseClient): Promise<ProductRow[]> {
  const { data: featured } = await supabase
    .from('featured_products')
    .select('product_id, sort_order')
    .eq('active', true)
    .order('sort_order')

  const ids = (featured ?? []).map((f) => f.product_id)
  if (ids.length === 0) return []

  const { data: rows } = await supabase.from('products').select('*').in('id', ids).eq('active', true)

  const order = new Map((featured ?? []).map((f, i) => [f.product_id, f.sort_order ?? i]))
  return (rows ?? [])
    .map(mapProduct)
    .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}
