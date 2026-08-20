export type OrderItem = {
  product_id: string
  name: string
  unit_price: number
  quantity: number
  image_path?: string | null
  category_name?: string | null
}

export function parseOrderItems(raw: unknown): { ok: true; items: OrderItem[] } | { ok: false; error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: 'El carrito está vacío' }
  }
  if (raw.length > 80) {
    return { ok: false, error: 'Demasiados productos en el carrito' }
  }

  const items: OrderItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') {
      return { ok: false, error: 'Ítem inválido' }
    }
    const r = row as Record<string, unknown>
    const product_id = typeof r.product_id === 'string' ? r.product_id.trim() : ''
    const name = typeof r.name === 'string' ? r.name.trim() : ''
    const unit_price = typeof r.unit_price === 'number' ? r.unit_price : Number(r.unit_price)
    const quantity = typeof r.quantity === 'number' ? r.quantity : Number(r.quantity)
    if (!product_id || !name || !Number.isFinite(unit_price) || unit_price < 0) {
      return { ok: false, error: 'Datos de producto inválidos' }
    }
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
      return { ok: false, error: 'Cantidad inválida' }
    }
    items.push({
      product_id,
      name,
      unit_price,
      quantity: Math.floor(quantity),
      image_path: typeof r.image_path === 'string' ? r.image_path : null,
      category_name: typeof r.category_name === 'string' ? r.category_name : null,
    })
  }
  return { ok: true, items }
}

export function orderItemsTotal(items: OrderItem[]): number {
  return items.reduce((s, it) => s + it.unit_price * it.quantity, 0)
}
