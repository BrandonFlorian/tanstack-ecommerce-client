import { useSessionStore } from "@/stores/sessionStore"
import { Session } from "@supabase/supabase-js"
import { useEffect } from "react"

export function SessionInitializer({ initialSession}: { initialSession: Session | null }) {
    const setSession = useSessionStore(state => state.setSession)
  
    useEffect(() => {
      if (initialSession) {
        setSession(initialSession)
      }
      // initialize the subscription
      useSessionStore.getState().initialize()
    }, [initialSession, setSession])
    
    return null
}