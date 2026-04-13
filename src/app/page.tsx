import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = createServerComponentClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  redirect('/dashboard')
}
