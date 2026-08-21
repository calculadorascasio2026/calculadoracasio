import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

type CookiesToSet = { name: string; value: string; options?: CookieOptions }

function mergeNoStoreHeaders(res: NextResponse, h: Record<string, string | undefined> | undefined) {
  if (!h) return
  for (const [key, val] of Object.entries(h)) {
    if (typeof val === 'string') res.headers.set(key, val)
  }
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value)
  })
}

/** Renueva cookies de sesión en cada request (patrón recomendado Supabase + Next). */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: CookiesToSet[], responseHeaders?: Record<string, string | undefined>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
        mergeNoStoreHeaders(supabaseResponse, responseHeaders)
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminArea = path.startsWith('/admin')
  const isLogin = path === '/admin/login'

  if (isAdminArea && !isLogin) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      const redirectRes = NextResponse.redirect(url)
      copyCookies(supabaseResponse, redirectRes)
      return redirectRes
    }

    const { data: isAdmin } = await supabase.rpc('current_user_is_admin')
    if (isAdmin !== true) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('error', 'no_autorizado')
      const redirectRes = NextResponse.redirect(url)
      copyCookies(supabaseResponse, redirectRes)
      return redirectRes
    }
  }

  if (isLogin && user) {
    const { data: isAdmin } = await supabase.rpc('current_user_is_admin')
    if (isAdmin === true) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      const redirectRes = NextResponse.redirect(url)
      copyCookies(supabaseResponse, redirectRes)
      return redirectRes
    }
  }

  return supabaseResponse
}
