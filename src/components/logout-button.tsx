'use client'

import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-casio-muted hover:border-casio-lime/40 hover:text-casio-lime"
    >
      Salir
    </button>
  )
}
