
import { create } from 'zustand'
import { getSupabaseBrowserClient } from '@/utils/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  anonymousUserIdBeforeLogin: string | null
  lastUpdateTime: number
  
  // Actions
  initialize: () => Promise<void>
  setSession: (session: Session | null) => void
  ensureUser: () => Promise<void>
  clearAnonymousUserId: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  isLoading: true,
  isInitialized: false,
  anonymousUserIdBeforeLogin: null,
  lastUpdateTime: Date.now(),

  initialize: async () => {
    const state = get()
    if (state.isInitialized) return

    console.log('🚀 Auth Store: Starting initialization...')

    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      console.log('🚀 Auth Store: Initial session found:', {
        userId: session?.user?.id,
        isAnonymous: session?.user?.is_anonymous,
        email: session?.user?.email
      })
      
      set({ 
        session, 
        isLoading: false,
        isInitialized: true,
        lastUpdateTime: Date.now()
      })

      if (!session) {
        await get().ensureUser()
      }
    } catch (error) {
      console.error('❌ Auth initialization failed:', error)
      set({ 
        isLoading: false, 
        isInitialized: true,
        lastUpdateTime: Date.now()
      })
    }
  },

  setSession: (session) => {
    const currentSession = get().session
    
    console.log('📞 setSession CALLED with:', {
      newUserId: session?.user?.id,
      newIsAnonymous: session?.user?.is_anonymous,
      newEmail: session?.user?.email,
      currentUserId: currentSession?.user?.id,
      currentIsAnonymous: currentSession?.user?.is_anonymous,
      timestamp: new Date().toISOString()
    })
    
    // Track anonymous user ID before login for cart merging
    let anonymousUserIdBeforeLogin = get().anonymousUserIdBeforeLogin
    
    if (currentSession?.user?.is_anonymous && 
        session && 
        !session.user.is_anonymous && 
        currentSession.user.id !== session.user.id) {
      anonymousUserIdBeforeLogin = currentSession.user.id
      console.log('🎯 Tracking anonymous user before login:', anonymousUserIdBeforeLogin)
    }
    
    // If logging out (going from authenticated to null), clear the anonymous user tracking
    if (currentSession && !currentSession.user.is_anonymous && !session) {
      anonymousUserIdBeforeLogin = null
      console.log('🗑️ Clearing anonymous user tracking on logout')
    }
    
    // Update state with explicit object creation to trigger reactivity
    const newState = {
      session, 
      isLoading: false,
      anonymousUserIdBeforeLogin,
      lastUpdateTime: Date.now()
    }
    
    set(newState)
    
    console.log('✅ setSession COMPLETED - new state:', {
      userId: session?.user?.id,
      isAnonymous: session?.user?.is_anonymous,
      email: session?.user?.email,
      anonymousUserIdBeforeLogin,
      updateTime: new Date().toISOString()
    })
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
    console.log('🗑️ clearAnonymousUserId: Clearing tracked ID')
    set({ 
      anonymousUserIdBeforeLogin: null,
      lastUpdateTime: Date.now()
    })
  }
}))

// Enhanced auth listener setup with better synchronization
if (typeof window !== 'undefined') {
  console.log('🔧 Setting up Supabase auth listener...')
  
  const supabase = getSupabaseBrowserClient()
  let listenerInitialized = false
  
  // Initialize auth store
  useAuthStore.getState().initialize()
  
  // Setup auth state change listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('🔊 SUPABASE AUTH EVENT:', {
      event,
      userId: session?.user?.id,
      isAnonymous: session?.user?.is_anonymous,
      email: session?.user?.email,
      timestamp: new Date().toISOString()
    })
    
    // Get current store state before update
    const beforeState = useAuthStore.getState()
    console.log('🔊 Store state BEFORE setSession:', {
      currentUserId: beforeState.session?.user?.id,
      currentIsAnonymous: beforeState.session?.user?.is_anonymous
    })
    
    // Update auth state
    useAuthStore.getState().setSession(session)
    
    // Verify state was updated
    const afterState = useAuthStore.getState()
    console.log('🔊 Store state AFTER setSession:', {
      newUserId: afterState.session?.user?.id,
      newIsAnonymous: afterState.session?.user?.is_anonymous,
      stateChanged: beforeState.session?.user?.id !== afterState.session?.user?.id
    })
    
    // Handle cart merging after login
    if (event === 'SIGNED_IN' && 
        !session?.user?.is_anonymous && 
        afterState.anonymousUserIdBeforeLogin) {
      
      console.log('🔀 Login detected, triggering cart merge:', {
        fromUserId: afterState.anonymousUserIdBeforeLogin,
        toUserId: session?.user?.id
      })
      
      // Trigger cart merge via React Query invalidation
      // This will be handled by the cart hooks
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:cart-merge-needed', {
          detail: {
            anonymousUserId: afterState.anonymousUserIdBeforeLogin,
            newUserId: session?.user?.id
          }
        }))
      }
    }
    
    // Handle logout
    if (event === 'SIGNED_OUT') {
      console.log('👋 Logout detected, cleaning up state')
      useAuthStore.getState().clearAnonymousUserId()
      
      // Dispatch logout event for cart cleanup
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:logged-out'))
      }
    }
  })
  
  console.log('✅ Auth listener setup complete')
  
  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      subscription?.unsubscribe()
    })
  }
}

// Enhanced computed selectors with better memoization
export const useIsReady = () => {
  return useAuthStore((state) => 
    state.isInitialized && !state.isLoading && !!state.session
  )
}

export const useUserId = () => {
  return useAuthStore((state) => state.session?.user?.id || null)
}

export const useIsAnonymous = () => {
  return useAuthStore((state) => state.session?.user?.is_anonymous || false)
}