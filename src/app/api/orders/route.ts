import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { orderItemsTotal, parseOrderItems } from '@/lib/order-items'

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Falta configuración de Supabase')
  return createClient(url, key)
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { items?: unknown }
    const parsed = parseOrderItems(body.items)
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const total = orderItemsTotal(parsed.items)
    const supabase = anonClient()
    const { data, error } = await supabase
      .from('orders')
      .insert({ items: parsed.items, total, status: 'pending' })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.id })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'No se pudo guardar el pedido' }, { status: 500 })
  }
}
