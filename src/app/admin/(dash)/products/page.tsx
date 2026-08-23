import { AdminProductsPanel } from '@/components/admin-products-panel'
import { requireAdmin } from '@/lib/admin'
import type { CategoryRow, ProductRow } from '@/types/catalog'

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').order('name'),
  ])

  const categories = (catRes.data ?? []) as CategoryRow[]
  const products = (prodRes.data ?? []).map((row) => ({
    ...row,
    price: Number(row.price),
    stock: Number(row.stock ?? (row.in_stock === false ? 0 : 1)),
  })) as ProductRow[]

  return <AdminProductsPanel categories={categories} initialProducts={products} supabaseUrl={supabaseUrl} />
}
