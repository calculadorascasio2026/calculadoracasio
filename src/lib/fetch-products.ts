import type { SupabaseClient } from '@supabase/supabase-js'
import type { CategoryRow, CategoryWithProducts, ProductRow } from '@/types/catalog'

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

function mapCategory(row: Record<string, unknown>): CategoryRow {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    sort_order: Number(row.sort_order ?? 0),
  }
}

export async function fetchCategoriesWithProducts(
  supabase: SupabaseClient,
  opts?: { includeInactive?: boolean },
): Promise<CategoryWithProducts[]> {
  const includeInactive = opts?.includeInactive ?? false

  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('products')
      .select('*')
      .order('sort_order')
      .order('name'),
  ])

  if (catRes.error) throw catRes.error
  if (prodRes.error) throw prodRes.error

  const categories = (catRes.data ?? []).map(mapCategory)
  const products = (prodRes.data ?? []).map(mapProduct).filter((p) => includeInactive || p.active)

  const byCategory = new Map<string, ProductRow[]>()
  for (const p of products) {
    const list = byCategory.get(p.category_id) ?? []
    list.push(p)
    byCategory.set(p.category_id, list)
  }

  return categories.map((c) => ({
    ...c,
    products: byCategory.get(c.id) ?? [],
  }))
}
