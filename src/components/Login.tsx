import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@/hooks/useMutation'
import { loginFn } from '@/routes/_authed'
import { signupFn } from '@/routes/signup'
import { Auth } from '@/components/Auth'
import { useRefreshSession, useSessionStore } from '@/stores/sessionStore'
import { useQueryClient } from '@tanstack/react-query'
import { mergeAnonymousCart } from '@/utils/cartApi'
import { CartWithItems } from '@/types/cart'

export function Login() {
  const router = useRouter()
  const refreshSession = useRefreshSession()
  const queryClient = useQueryClient()
  const { session: currentSession } = useSessionStore()

  const handleSuccessfulAuth = async () => {
    console.log('✅ Login: Auth successful')
    
    // Check if we need to merge carts
    const anonymousUserId = currentSession?.user?.is_anonymous ? currentSession.user.id : null
    
    if (anonymousUserId) {
      console.log('🔀 Login: Detected anonymous user, attempting cart merge')
      try {
        // Get the anonymous user's cart data from cache before we lose access
        const anonymousCartData = queryClient.getQueryData<CartWithItems>(['cart', anonymousUserId])
        
        if (anonymousCartData && anonymousCartData.items.length > 0) {
          console.log('📦 Login: Found anonymous cart with items:', anonymousCartData.items.length)
          
          // Merge the carts on the backend with the actual cart data
          await mergeAnonymousCart({ 
            data: {   
              cartItems: anonymousCartData.items 
            } 
          })
          console.log('✅ Login: Cart merge successful')
        } else {
          console.log('📭 Login: No items in anonymous cart, skipping merge')
        }
        
        // Clear the old anonymous cart from cache
        queryClient.removeQueries({ queryKey: ['cart', anonymousUserId] })
      } catch (error) {
        console.error('❌ Login: Cart merge failed:', error)
        // Continue with login even if merge fails
      }
    }
    
    // Refresh session and invalidate router
    await refreshSession()
    await router.invalidate()
    
    // Navigate to home
    router.navigate({ to: '/' })
  }

  const loginMutation = useMutation({
    fn: loginFn,
    onSuccess: async (ctx) => {
      if (!ctx.data?.error) {
        await handleSuccessfulAuth()
      }
    },
  })

  const signupMutation = useMutation({
    fn: useServerFn(signupFn),
    onSuccess: async () => {
      await handleSuccessfulAuth()
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