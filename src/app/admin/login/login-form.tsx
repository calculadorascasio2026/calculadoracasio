'use client'

import { usernameOrEmailToSupabaseEmail } from '@/lib/auth-login'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const searchParams = useSearchParams()
  const errParam = searchParams.get('error')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(
    errParam === 'no_autorizado'
      ? 'Esta cuenta no está autorizada. El email debe estar en admin_users de Supabase.'
      : '',
  )
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const emailForAuth = usernameOrEmailToSupabaseEmail(username)
    if (!emailForAuth) {
      setLoading(false)
      setError('Ingresá un usuario válido.')
      return
    }

    const loginRes = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username, password }),
    })
    const loginBody = (await loginRes.json().catch(() => ({}))) as { error?: string }
    setLoading(false)
    if (!loginRes.ok) {
      if (loginRes.status === 429) {
        setError(loginBody.error ?? 'Demasiados intentos. Esperá unos minutos.')
        return
      }
      if (loginRes.status === 403 || loginBody.error === 'no_autorizado') {
        setError('Esta cuenta no está autorizada en admin_users.')
        return
      }
      setError(loginBody.error ?? `No se pudo iniciar sesión (${loginRes.status}).`)
      return
    }

    window.location.assign('/admin')
  }

  return (
    <div className="flex min-h-screen flex-col bg-casio-bg text-casio-text">
      <header className="border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between gap-4">
          <Image src="/brand/logo.jpeg" alt="Viñolo Casio" width={120} height={40} className="h-9 w-auto" priority />
          <Link href="/" className="text-xs text-casio-lime hover:underline">
            Ver tienda
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-casio-surface p-8">
          <h1 className="font-casio text-3xl tracking-wide text-casio-lime">ADMIN</h1>
          <p className="mt-1 text-sm text-casio-muted">Gestioná el catálogo de productos</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-casio-muted" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs text-casio-muted" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? <p className="text-xs text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-casio-lime py-2.5 text-sm font-semibold text-black hover:bg-casio-lime-dim disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
