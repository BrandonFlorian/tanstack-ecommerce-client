import { createFileRoute, Outlet } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Login } from '@/components/Login'
import { getSupabaseServerClient } from '@/utils/supabase'

export const loginFn = createServerFn({ method: 'POST' })
  .validator((d: { email: string; password: string }) => d)
  .handler(async ({ data }) => {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      return {
        error: true,
        message: error.message,
      }
    }
    
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: true, message: error.message }
    }

    // Immediately create anonymous user for seamless experience
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
    if (anonError) {
      console.error('Failed to create anonymous user after logout:', anonError)
    }

  })
  

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <Login />
    }

    throw error
  },
  component: () => <Outlet />,
})