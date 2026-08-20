import { NextResponse } from 'next/server'
import { fetchProductsPage } from '@/lib/fetch-products'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const offset = Number(url.searchParams.get('offset') ?? '0')
    const limit = Number(url.searchParams.get('limit') ?? '8')
    const category = url.searchParams.get('category')

    const supabase = await createClient()
    const page = await fetchProductsPage(supabase, {
      offset: Number.isFinite(offset) ? offset : 0,
      limit: Number.isFinite(limit) ? limit : 8,
      categorySlug: category,
    })

    return NextResponse.json(page)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'No se pudieron cargar los productos' }, { status: 500 })
  }
}
