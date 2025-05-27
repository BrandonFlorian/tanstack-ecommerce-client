import { getSupabaseBrowserClient } from "@/utils/supabase"
import { Session, Subscription } from "@supabase/supabase-js"
import { useEffect } from "react"
import { create } from "zustand"

interface SessionState {
    session: Session | null
    isLoading: boolean
    isInitialized: boolean
    anonymousUserIdBeforeLogin: string | null
    lastUpdateTime: number
    subscription: Subscription | null
    
    // Actions
    initialize: () => Promise<Subscription | null>
    setSession: (session: Session | null) => void
    setSubscription: (subscription: Subscription) => void
    ensureUser: () => Promise<void>
    clearAnonymousUserId: () => void
    refresh: () => Promise<void> // Add this for server-side auth changes
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  isLoading: true,
  isInitialized: false,
  anonymousUserIdBeforeLogin: null,
  lastUpdateTime: Date.now(),
  subscription: null,

  initialize: async () => { 
    set({ isLoading: true })
    console.log('🔍 initialize: Initializing auth subscription')
    
    const state = get()
    if (state.isInitialized){
        console.log('🔍 initialize: Already initialized, skipping')
        return state.subscription
    }

    const supabase = getSupabaseBrowserClient()
    
    // First, check if there's already a session (from cookies/localStorage)
    console.log('🔍 initialize: Checking for existing session')
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
        console.error('❌ initialize: Error getting session:', sessionError)
    }

    // Only sign in anonymously if there's no existing session
    if (!existingSession) {
        console.log('🔍 initialize: No existing session, signing in anonymously')
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
            console.error('❌ initialize: Error signing in anonymously:', error)
            set({ isLoading: false, isInitialized: true })
            return null
        }
        console.log('✅ initialize: Signed in anonymously')
    } else {
        console.log('✅ initialize: Found existing session, user:', existingSession.user.id)
    }

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 authStateChange:', event, session?.user?.id)

        if (event === 'INITIAL_SESSION') {
            set({ session: session, isLoading: false, isInitialized: true, lastUpdateTime: Date.now() })
        } else if (event === 'SIGNED_IN') {
            set({ session: session, isLoading: false, lastUpdateTime: Date.now() })
        } else if (event === 'SIGNED_OUT') {
            set({ session: null, isLoading: false, lastUpdateTime: Date.now() })
        } else if (event === 'TOKEN_REFRESHED') {
            set({ session: session, lastUpdateTime: Date.now() })
        } else if (event === 'USER_UPDATED') {
            set({ session: session, lastUpdateTime: Date.now() })
        }
      }
    )

    console.log('🔍 initialize: Auth subscription initialized')
    set({ subscription, isInitialized: true, isLoading: false })
    return subscription
  },
  
  setSession: (session) => set({ session, lastUpdateTime: Date.now() }),
  
  // Add this method to manually refresh session state
  refresh: async () => {
    console.log('🔄 refresh: Manually refreshing session')
    const supabase = getSupabaseBrowserClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
        console.error('❌ refresh: Error getting session:', error)
        return
    }
    
    console.log('✅ refresh: Updated session:', session?.user?.id)
    set({ session, lastUpdateTime: Date.now() })
  },
  
  ensureUser: async () => {
    const state = get()
    if (state.session) {
      console.log('🔍 ensureUser: User already exists, skipping')
      return
    }

    try {
      console.log('👤 ensureUser: Creating anonymous user...')
      const supabase = getSupabaseBrowserClient()
      
      // Check for existing session first
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        console.log('✅ ensureUser: Found existing session')
        set({ 
          session: existingSession, 
          isLoading: false,
          lastUpdateTime: Date.now()
        })
        return
      }
      
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (!error && data.session) {
        console.log('✅ ensureUser: Anonymous user created:', data.session.user.id)
        set({ 
          session: data.session, 
          isLoading: false,
          lastUpdateTime: Date.now()
        })
      }
    } catch (error) {
      console.error('❌ ensureUser: Error creating anonymous user:', error)
      set({ 
        isLoading: false,
        lastUpdateTime: Date.now()
      })
    }
  },
  
  clearAnonymousUserId: () => {
    set({ anonymousUserIdBeforeLogin: null, lastUpdateTime: Date.now() })
  },

  setSubscription: (subscription) => set({ subscription })
}))

// Hook to manually trigger session refresh (use after server actions)
export const useRefreshSession = () => {
  return useSessionStore((state) => state.refresh)
}

// TanStack Start specific: Hook to initialize session on client mount
export const useInitializeSession = () => {
  const initialize = useSessionStore(state => state.initialize)
  const isInitialized = useSessionStore(state => state.isInitialized)
  
  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])
}

export const useIsReady = () => {
    return useSessionStore((state) => 
      state.isInitialized && !state.isLoading && !!state.session
    )
}
  
export const useUserId = () => {
    return useSessionStore((state) => state.session?.user?.id || null)
}
  
export const useIsAnonymous = () => {
    return useSessionStore((state) => state.session?.user?.is_anonymous || false)
}