import type { SupabaseClient } from '@supabase/supabase-js'
import type { CategoryRow, CategoryWithProducts, ProductRow } from '@/types/catalog'

export type CategorySummary = CategoryRow & {
  product_count: number
  thumb_path: string | null
}

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

export { mapProduct }

export async function fetchCategoriesWithProducts(
  supabase: SupabaseClient,
  opts?: { includeInactive?: boolean },
): Promise<CategoryWithProducts[]> {
  const includeInactive = opts?.includeInactive ?? false

  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').order('sort_order').order('name'),
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

/** Categorías livianas para la home (conteo + miniatura, sin lista completa). */
export async function fetchCategorySummaries(supabase: SupabaseClient): Promise<CategorySummary[]> {
  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase
      .from('products')
      .select('category_id, image_path, active, sort_order')
      .eq('active', true)
      .order('sort_order'),
  ])

  if (catRes.error) throw catRes.error
  if (prodRes.error) throw prodRes.error

  const categories = (catRes.data ?? []).map(mapCategory)
  const counts = new Map<string, number>()
  const thumbs = new Map<string, string>()

  for (const row of prodRes.data ?? []) {
    const cid = String(row.category_id)
    counts.set(cid, (counts.get(cid) ?? 0) + 1)
    if (!thumbs.has(cid) && row.image_path) {
      thumbs.set(cid, String(row.image_path))
    }
  }

  return categories.map((c) => ({
    ...c,
    product_count: counts.get(c.id) ?? 0,
    thumb_path: thumbs.get(c.id) ?? null,
  }))
}

export type FetchProductsPageOpts = {
  offset?: number
  limit?: number
  categorySlug?: string | null
  includeInactive?: boolean
}

export type ProductsPage = {
  items: ProductRow[]
  total: number
  categoryName: string | null
}

export async function fetchProductsPage(
  supabase: SupabaseClient,
  opts: FetchProductsPageOpts = {},
): Promise<ProductsPage> {
  const offset = Math.max(0, opts.offset ?? 0)
  const limit = Math.min(48, Math.max(1, opts.limit ?? 8))
  const includeInactive = opts.includeInactive ?? false
  const slug = opts.categorySlug?.trim() || null

  let categoryId: string | null = null
  let categoryName: string | null = null

  if (slug) {
    const { data: cat, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    if (!cat) return { items: [], total: 0, categoryName: null }
    categoryId = String(cat.id)
    categoryName = String(cat.name)
  }

  let countQ = supabase.from('products').select('id', { count: 'exact', head: true })
  let dataQ = supabase.from('products').select('*').order('sort_order').order('name')

  if (!includeInactive) {
    countQ = countQ.eq('active', true)
    dataQ = dataQ.eq('active', true)
  }
  if (categoryId) {
    countQ = countQ.eq('category_id', categoryId)
    dataQ = dataQ.eq('category_id', categoryId)
  }

  const [countRes, dataRes] = await Promise.all([
    countQ,
    dataQ.range(offset, offset + limit - 1),
  ])

  if (countRes.error) throw countRes.error
  if (dataRes.error) throw dataRes.error

  return {
    items: (dataRes.data ?? []).map(mapProduct),
    total: countRes.count ?? 0,
    categoryName,
  }
}
