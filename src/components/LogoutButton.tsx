import { useRouter } from '@tanstack/react-router'
import { useMutation } from '@/hooks/useMutation'
import { logoutFn } from '@/routes/_authed'
import { useRefreshSession } from '@/stores/sessionStore'
import { Button } from './ui/button'

export function LogoutButton() {
  const router = useRouter()
  const refreshSession = useRefreshSession()

  const handleSuccessfulLogout = async () => {

    console.log('✅ Logout: Logout successful, redirecting...')
    
    // Invalidate router to refresh user context
    await refreshSession()
    await router.invalidate()
    
    // Navigate to home - merge will happen automatically via global effects
    router.navigate({ to: '/' })
  }

  const logoutMutation = useMutation({
    fn: logoutFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await handleSuccessfulLogout()
      }
    },
  })

  return (
    <Button onClick={() => logoutMutation.mutate()}>Logout</Button>
    
  )
}