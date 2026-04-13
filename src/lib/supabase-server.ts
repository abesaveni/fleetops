import { createServerComponentClient as _createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export function createServerComponentClient() {
  const cookieStore = cookies()
  return _createServerComponentClient({ cookies: () => cookieStore })
}

export function createAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
