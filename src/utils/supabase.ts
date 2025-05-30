import { parseCookies, setCookie } from '@tanstack/react-start/server'
import { createServerClient, createBrowserClient } from '@supabase/ssr'
import type { Session } from '@supabase/supabase-js'

export function getSupabaseServerClient() {
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        // @ts-ignore Wait till Supabase overload works
        getAll() {
          return Object.entries(parseCookies()).map(([name, value]) => ({
            name,
            value,
          }))
        },
        setAll(cookies) {
          cookies.forEach((cookie) => {
            setCookie(cookie.name, cookie.value)
          })
        },
      },
    },
  )
}

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
  )
}

/**
 * Get a validated session on the server.
 * This combines getSession() for the token with getUser() for validation.
 * For sensitive operations or initial page loads.
 */
export async function getValidatedServerSession(): Promise<{ session: Session | null; isValid: boolean }> {
  const supabase = getSupabaseServerClient()
  
  // First get the session (includes access token)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    return { session: null, isValid: false }
  }
  
  // Validate the session by calling getUser
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.error('Session validation failed:', userError)
    return { session: null, isValid: false }
  }
  
  // Session is valid
  return { session, isValid: true }
}

/**
 * Get session for API calls where we just need the token.
 * The backend will validate the JWT token itself.
 */
export async function getServerSessionForApi() {
  const supabase = getSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}