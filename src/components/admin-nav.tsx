'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Inicio', exact: true },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/marketing', label: 'Marketing' },
  { href: '/admin/pedidos', label: 'Pedidos' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-1 border-b border-white/10 pb-3">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
              active
                ? 'bg-casio-lime text-black'
                : 'border border-white/10 text-casio-muted hover:border-casio-lime/40 hover:text-casio-lime'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
