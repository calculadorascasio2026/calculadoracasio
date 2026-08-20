import { PedidosPanel, type PedidoAdminRow } from '@/components/pedidos-panel'
import { requireAdmin } from '@/lib/admin'
import type { OrderItem } from '@/lib/order-items'

export default async function AdminPedidosPage() {
  const { supabase } = await requireAdmin()
  const { data, error } = await supabase
    .from('orders')
    .select('id, status, created_at, total, items')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/20 px-4 py-6 text-sm text-red-200">
        No se pudieron cargar los pedidos: {error.message}
      </div>
    )
  }

  const rows: PedidoAdminRow[] = (data ?? []).map((row) => {
    const items = Array.isArray(row.items) ? (row.items as OrderItem[]) : []
    return {
      id: row.id as string,
      status: (row.status as PedidoAdminRow['status']) ?? 'pending',
      created_at: row.created_at as string,
      total: Number(row.total) || 0,
      lineCount: items.reduce((n, it) => n + (Number(it.quantity) || 0), 0) || items.length,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-casio text-3xl tracking-wide text-casio-lime">PEDIDOS</h1>
        <p className="mt-1 text-sm text-casio-muted">
          Se crean cuando el cliente toca «Pedir por WhatsApp» en el carrito.
        </p>
      </div>
      <PedidosPanel initialRows={rows} />
    </div>
  )
}
