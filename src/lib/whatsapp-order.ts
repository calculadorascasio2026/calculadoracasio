import { formatMoneyArs } from '@/lib/format'
import type { CartLine } from '@/context/cart-context'
import type { OrderItem } from '@/lib/order-items'

export function formatOrderWhatsAppDetail(lines: CartLine[], withPrices: boolean): string {
  return lines
    .map((l) => {
      if (!withPrices) {
        return `• ${l.name} x${l.quantity}`
      }
      const sub = l.unitPrice * l.quantity
      return `• ${l.name} x${l.quantity} — ${formatMoneyArs(sub)} (${formatMoneyArs(l.unitPrice)} c/u)`
    })
    .join('\n')
}

export function buildOrderWhatsAppMessage(
  lines: CartLine[],
  total: number,
  orderUrl: string,
  opts?: { showPrices?: boolean },
): string {
  const showPrices = opts?.showPrices !== false
  const plural = lines.reduce((n, l) => n + l.quantity, 0) > 1

  if (!showPrices) {
    const intro = plural
      ? 'Hola, buen día. Quería pedir información sobre estos productos:'
      : 'Hola, buen día. Quería pedir información sobre este producto:'

    return [
      intro,
      '',
      formatOrderWhatsAppDetail(lines, false),
      '',
      `Ver mi consulta: ${orderUrl}`,
      '',
      '¿Me podrían pasar más info? Quedo a la espera. Muchas gracias.',
    ].join('\n')
  }

  const intro = plural
    ? 'Hola, buen día. Quería consultar por estos productos:'
    : 'Hola, buen día. Quería consultar por este producto:'

  return [
    intro,
    '',
    formatOrderWhatsAppDetail(lines, true),
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
