import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC = ['/', '/login', '/signup', '/no-access']
const PUBLIC_PREFIX = ['/api/onboard', '/api/auth', '/_next']

function isPublic(pathname: string) {
  return PUBLIC.includes(pathname) || PUBLIC_PREFIX.some(p => pathname.startsWith(p))
}

function redirectTo(req: NextRequest, path: string) {
  const url = req.nextUrl.clone()
  url.pathname = path
  return NextResponse.redirect(url)
}

export async function middleware(req: NextRequest) {
  const res      = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  // getSession() reads the cookie — no network call, just decodes the JWT
  const { data: { session } } = await supabase.auth.getSession()
  const { pathname } = req.nextUrl

  if (isPublic(pathname)) return res

  if (!session) return redirectTo(req, '/login')

  // ── Read role from JWT app_metadata — ZERO DB queries ────────────────────
  // app_metadata is embedded in the Supabase JWT and set via service-role API.
  // No network call needed; decoded locally from the session cookie.
  const meta   = (session.user.app_metadata ?? {}) as Record<string, unknown>
  const jwtRole = typeof meta.role === 'string' ? meta.role : null   // 'super_admin' | 'Admin' | 'Viewer'
  const active  = meta.is_active !== false                            // default true

  // ── Fast path: JWT has role ───────────────────────────────────────────────
  if (jwtRole) {
    if (!active) return redirectTo(req, '/no-access')

    if (jwtRole === 'super_admin') {
      if (pathname === '/dashboard') return redirectTo(req, '/super-admin/dashboard')
      return res
    }
    if (pathname.startsWith('/super-admin')) return redirectTo(req, '/dashboard')
    return res
  }

  // ── Slow path: legacy user without app_metadata — hit DB once ────────────
  // This only runs for users created before the app_metadata migration.
  const [saRes, subRes] = await Promise.all([
    supabase.from('super_admins').select('id').eq('email', session.user.email!).maybeSingle(),
    supabase.from('user_subscriptions').select('is_active').eq('user_email', session.user.email!).maybeSingle(),
  ])

  if (saRes.data) {
    if (pathname === '/dashboard') return redirectTo(req, '/super-admin/dashboard')
    return res
  }
  if (!subRes.data || !subRes.data.is_active) return redirectTo(req, '/no-access')
  if (pathname.startsWith('/super-admin')) return redirectTo(req, '/dashboard')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
