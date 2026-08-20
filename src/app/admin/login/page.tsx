import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export default async function AdminLoginPage() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: isAdmin } = await supabase.rpc('current_user_is_admin')
      if (isAdmin === true) redirect('/admin')
    }
  } catch {
    /* sin env o sin sesión: mostrar login */
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-casio-bg text-casio-muted">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
