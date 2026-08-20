import { formatMoneyArs } from '@/lib/format'
import type { CartLine } from '@/context/cart-context'
import type { OrderItem } from '@/lib/order-items'

export function formatOrderWhatsAppDetail(lines: CartLine[]): string {
  return lines
    .map((l) => {
      const sub = l.unitPrice * l.quantity
      return `• ${l.name} x${l.quantity} — ${formatMoneyArs(sub)} (${formatMoneyArs(l.unitPrice)} c/u)`
    })
    .join('\n')
}

export function buildOrderWhatsAppMessage(lines: CartLine[], total: number, orderUrl: string): string {
  const plural = lines.reduce((n, l) => n + l.quantity, 0) > 1
  const intro = plural
    ? 'Hola, buen día. Quería consultar por estos productos:'
    : 'Hola, buen día. Quería consultar por este producto:'

  return [
    intro,
    '',
    formatOrderWhatsAppDetail(lines),
    '',
    `Total estimado: ${formatMoneyArs(total)}`,
    '',
    `Ver mi pedido: ${orderUrl}`,
    '',
    'Quedo a la espera de su respuesta. Muchas gracias.',
  ].join('\n')
}

export function whatsappOrderUrl(e164: string, message: string): string {
  const digits = e164.replace(/\D/g, '')
  if (!digits) return '#'
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function orderItemsFromCartLines(lines: CartLine[]): OrderItem[] {
  return lines.map((l) => ({
    product_id: l.productId,
    name: l.name,
    unit_price: l.unitPrice,
    quantity: l.quantity,
    image_path: l.imagePath,
    category_name: l.categoryName,
  }))
}
