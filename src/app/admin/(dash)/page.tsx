import { requireAdmin } from '@/lib/admin'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin()

  const [prodRes, offerRes, featRes, catRes, orderRes] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('product_offers').select('product_id', { count: 'exact', head: true }),
    supabase.from('featured_products').select('product_id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const cards = [
    {
      href: '/admin/products',
      title: 'Productos',
      desc: 'Cargá, editá precios, stock e imágenes.',
      stat: `${prodRes.count ?? 0} productos · ${catRes.count ?? 0} categorías`,
    },
    {
      href: '/admin/marketing',
      title: 'Marketing',
      desc: 'Ofertas, destacados y códigos QR para el local.',
      stat: `${offerRes.count ?? 0} en oferta · ${featRes.count ?? 0} destacados`,
    },
    {
      href: '/admin/pedidos',
      title: 'Pedidos',
      desc: 'Consultas armadas desde el carrito y enviadas por WhatsApp.',
      stat: `${orderRes.count ?? 0} pendientes`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-casio text-3xl tracking-wide text-casio-lime">DASHBOARD</h1>
        <p className="mt-1 text-sm text-casio-muted">Elegí qué querés gestionar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-white/10 bg-casio-surface p-5 transition hover:border-casio-lime/40"
          >
            <h2 className="text-lg font-semibold text-white">{card.title}</h2>
            <p className="mt-1 text-sm text-casio-muted">{card.desc}</p>
            <p className="mt-4 text-xs font-medium text-casio-lime">{card.stat}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
