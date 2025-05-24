import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/utils/supabase"
import type { Session } from "@supabase/supabase-js"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    client.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setIsLoading(false)
      })
      .catch((err) => {
        setError(err)
        setIsLoading(false)
      })

    // Optionally, subscribe to session changes:
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return { session, isLoading, error }
}
