'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'

export interface UserInfo {
  email:     string
  role:      string         // 'Admin' | 'Viewer' | 'super_admin'
  org_id:    string | null
  org_name:  string | null
  plan:      string | null  // 'trial' | 'pro' | 'business' | 'enterprise'
  bus_limit: number | null  // null = unlimited
  bus_count: number | null
}

interface UserContextValue {
  user:    UserInfo | null
  loading: boolean
  refresh: () => void
}

const UserContext = createContext<UserContextValue>({ user: null, loading: true, refresh: () => {} })

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    // no-store ensures we never serve a cached response after a session change
    fetch('/api/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Initial load
  useEffect(() => { load() }, [load])

  // Re-fetch whenever the Supabase session changes (sign-in, sign-out, token refresh)
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        load()
      }
    })
    return () => subscription.unsubscribe()
  }, [load])

  return (
    <UserContext.Provider value={{ user, loading, refresh: load }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
