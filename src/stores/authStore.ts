import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { getSupabaseBrowserClient } from '@/utils/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  isLoading: boolean
  isReady: boolean
  anonymousUserId: string | null
  creatingAnonymous: boolean
  
  // Actions
  setSession: (session: Session | null) => void
  ensureUser: () => Promise<void>
  trackAnonymousUser: (userId: string | null) => void
  handleAuthChange: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    session: null,
    isLoading: true,
    isReady: false,
    anonymousUserId: null,
    creatingAnonymous: false,

    setSession: (session) => {
      set({ 
        session, 
        isLoading: false,
        isReady: !!session?.user?.id 
      })
    },

    ensureUser: async () => {
      const state = get()
      
      // Already ready or creating
      if (state.isReady || state.creatingAnonymous) {
        return
      }

      // Has session, mark as ready
      if (state.session?.user?.id) {
        set({ isReady: true, isLoading: false })
        return
      }

      // No session and not loading - create anonymous user
      if (!state.isLoading) {
        set({ creatingAnonymous: true })
        
        try {
          const supabase = getSupabaseBrowserClient()
          const { data, error } = await supabase.auth.signInAnonymously()
          
          if (error) {
            console.error('Failed to create anonymous user:', error)
          } else if (data.session) {
            set({ 
              session: data.session,
              isReady: true,
              isLoading: false
            })
          }
        } finally {
          set({ creatingAnonymous: false })
        }
      }
    },

    trackAnonymousUser: (userId) => {
      set({ anonymousUserId: userId })
    },

    handleAuthChange: (session) => {
      const prevSession = get().session
      
      // Track anonymous user before it changes
      if (prevSession?.user?.is_anonymous && !session?.user?.is_anonymous) {
        set({ anonymousUserId: prevSession.user.id })
      }
      
      set({ 
        session,
        isLoading: false,
        isReady: !!session?.user?.id
      })
    }
  }))
)

// Initialize auth state
if (typeof window !== 'undefined') {
  const supabase = getSupabaseBrowserClient()
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session)
  })
  
  // Subscribe to auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().handleAuthChange(session)
  })
}