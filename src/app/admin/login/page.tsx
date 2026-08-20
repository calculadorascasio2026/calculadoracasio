import { Suspense } from 'react'
import { LoginForm } from './login-form'

export default function AdminLoginPage() {
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
