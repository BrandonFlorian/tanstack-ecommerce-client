import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@/hooks/useMutation'
import { loginFn } from '@/routes/_authed'
import { signupFn } from '@/routes/signup'
import { Auth } from '@/components/Auth'
import { useAuthStore } from '@/stores/authStore'
import { useEffect } from 'react'
import { mergeAnonymousCart } from '@/utils/cartApi'
import { useQueryClient } from '@tanstack/react-query'

export function Login() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { anonymousUserId, trackAnonymousUser } = useAuthStore()
  
  // Track anonymous user before login
  useEffect(() => {
    const session = useAuthStore.getState().session
    if (session?.user?.id && session.user.is_anonymous) {
      trackAnonymousUser(session.user.id)
    }
  }, [trackAnonymousUser])

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        console.log('Login successful')
        
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Merge cart if we had an anonymous user
        if (anonymousUserId) {
          try {
            console.log('Merging cart from anonymous user:', anonymousUserId)
            const mergedCart = await mergeAnonymousCart({ 
              data: { anonymousUserId } 
            })
            
            if (mergedCart) {
              // Update cart cache with merged data
              const currentSession = useAuthStore.getState().session
              if (currentSession?.user?.id) {
                queryClient.setQueryData(['cart', currentSession.user.id], mergedCart)
              }
            }
            
            // Clear the tracked anonymous user ID
            trackAnonymousUser(null)
          } catch (error) {
            console.error('Failed to merge cart:', error)
          }
        }

        await router.invalidate()
        router.navigate({ to: '/' })
      }
    },
  })

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
    onSuccess: async () => {
      // Similar cart merge logic for signup
      if (anonymousUserId) {
        try {
          await mergeAnonymousCart({ data: { anonymousUserId } })
          trackAnonymousUser(null)
        } catch (error) {
          console.error('Failed to merge cart:', error)
        }
      }
    }
  })

  return (
    <Auth
      actionText="Login"
      status={loginMutation.status}
      onSubmit={(e) => {
        const formData = new FormData(e.target as HTMLFormElement)

        loginMutation.mutate({
          data: {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
          },
        })
      }}
      afterSubmit={
        loginMutation.data ? (
          <>
            <div className="text-red-400">{loginMutation.data.message}</div>
            {loginMutation.data.error &&
            loginMutation.data.message === 'Invalid login credentials' ? (
              <div>
                <button
                  className="text-blue-500"
                  onClick={(e) => {
                    const formData = new FormData(
                      (e.target as HTMLButtonElement).form!,
                    )

                    signupMutation.mutate({
                      data: {
                        email: formData.get('email') as string,
                        password: formData.get('password') as string,
                      },
                    })
                  }}
                  type="button"
                >
                  Sign up instead?
                </button>
              </div>
            ) : null}
          </>
        ) : null
      }
    />
  )
}