import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getSupabaseServerClient } from '@/utils/supabase'

const logoutFn = createServerFn().handler(async () => {
  console.log('Logging out')
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
  console.log('Created anonymous user after logout:', anonData.user?.id)

  if (anonError) {
    console.error('Failed to create anonymous user after logout:', anonError)
  }

  throw redirect({
    href: '/',
    replace: true,
  }
)
})

export const Route = createFileRoute('/logout')({
  preload: false,
  loader: async ({ context }) => {
    // Clear cart data using React Query's built-in mechanisms
    context.queryClient.removeQueries({ queryKey: ['cart'] })
    return logoutFn()
  }
})