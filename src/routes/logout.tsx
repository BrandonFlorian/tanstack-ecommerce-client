import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/utils/supabase'

const logoutFn = createServerFn().handler(async () => {
  const supabase = await getSupabaseServerClient()
  
  // Sign out current user
  const { error } = await supabase.auth.signOut()
  if (error) {
    return {
      error: true,
      message: error.message,
    }
  }

  // Immediately create anonymous user for seamless experience
  const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
  
  if (anonError) {
    console.error('Failed to create anonymous user after logout:', anonError)
  } else {
    console.log('Created anonymous user after logout:', anonData.user?.id)
  }

  throw redirect({
    href: '/',
  })
})

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: async ({ context }) => {
    // Clear cart data on client side
    if (typeof window !== 'undefined') {
      console.log('Logout: Clearing cart data')
      context.queryClient.cancelQueries({ queryKey: ['cart'] })
      context.queryClient.removeQueries({ queryKey: ['cart'] })
    }
    
    return logoutFn()
  }
})