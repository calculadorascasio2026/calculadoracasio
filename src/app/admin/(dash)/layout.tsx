import { AdminNav } from '@/components/admin-nav'
import { LogoutButton } from '@/components/logout-button'
import { requireAdmin } from '@/lib/admin'
import Image from 'next/image'
import Link from 'next/link'

export default async function AdminDashLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-casio-bg text-casio-text">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Image src="/brand/logo.jpeg" alt="Viñolo Casio" width={110} height={36} className="h-8 w-auto" />
            </Link>
            <span className="hidden text-xs uppercase tracking-widest text-casio-muted sm:inline">Panel admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-casio-lime hover:underline">
              Ver tienda
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <AdminNav />
      </div>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
