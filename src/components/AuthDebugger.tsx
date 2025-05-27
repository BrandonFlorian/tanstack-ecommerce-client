import React, { useState, useEffect } from 'react'
import { useSessionStore, useIsReady, useUserId } from '@/stores/sessionStore'

export function AuthDebugger() {
  const authState = useSessionStore()
  const isReady = useIsReady()
  const userId = useUserId()
  const [isClient, setIsClient] = useState(false)

  // Ensure we only render on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Manual state check
  const checkState = () => {
    const state = useSessionStore.getState()
    console.log('🔍 MANUAL STATE CHECK:', {
      userId: state.session?.user?.id,
      isAnonymous: state.session?.user?.is_anonymous,
      email: state.session?.user?.email,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      lastUpdateTime: new Date(state.lastUpdateTime).toISOString(),
      anonymousUserIdBeforeLogin: state.anonymousUserIdBeforeLogin
    })
  }

  // Force a manual auth check
  const forceAuthCheck = async () => {
    console.log('🔄 Forcing auth check...')
    const { getSupabaseBrowserClient } = await import('@/utils/supabase')
    const supabase = getSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔄 Current Supabase session:', {
      userId: session?.user?.id,
      isAnonymous: session?.user?.is_anonymous,
      email: session?.user?.email
    })
    
    // Manually call setSession to test if it works
    useSessionStore.getState().setSession(session)
  }

  if (process.env.NODE_ENV !== 'development' || !isClient) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/95 text-white p-4 rounded-lg text-xs font-mono max-w-sm space-y-1 border border-gray-600 z-50">
      <div className="font-bold mb-2 text-yellow-400">
        Auth Debug (Diagnostic)
      </div>
      
      <div className="flex gap-1 mb-2">
        <button 
          onClick={checkState}
          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
        >
          Check State
        </button>
        <button 
          onClick={forceAuthCheck}
          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
        >
          Force Check
        </button>
      </div>
      
      <div className="text-green-400">Auth State:</div>
      <div>User ID: <span className="text-cyan-300">{authState.session?.user?.id || 'none'}</span></div>
      <div>Email: <span className="text-cyan-300">{authState.session?.user?.email || 'none'}</span></div>
      <div>Anonymous: <span className={authState.session?.user?.is_anonymous ? 'text-red-300' : 'text-green-300'}>
        {authState.session?.user?.is_anonymous ? 'yes' : 'no'}
      </span></div>
      <div>Loading: <span className={authState.isLoading ? 'text-red-300' : 'text-green-300'}>
        {authState.isLoading ? 'yes' : 'no'}
      </span></div>
      <div>Initialized: <span className={authState.isInitialized ? 'text-green-300' : 'text-red-300'}>
        {authState.isInitialized ? 'yes' : 'no'}
      </span></div>
      
      <div className="text-blue-400 mt-2">Computed:</div>
      <div>Is Ready: <span className={isReady ? 'text-green-300' : 'text-red-300'}>
        {isReady ? 'yes' : 'no'}
      </span></div>
      <div>User ID: <span className="text-cyan-300">{userId || 'none'}</span></div>
      
      <div className="text-purple-400 mt-2">Merge:</div>
      <div>Anon ID: <span className="text-cyan-300">
        {authState.anonymousUserIdBeforeLogin || 'none'}
      </span></div>
      
      <div className="text-yellow-400 mt-2">Timing:</div>
      <div className="text-xs">
        Last Update: {isClient ? new Date(authState.lastUpdateTime).toLocaleTimeString() : 'Loading...'}
      </div>
    </div>
  )
}