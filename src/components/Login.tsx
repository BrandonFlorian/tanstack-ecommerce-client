import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useMutation } from '@/hooks/useMutation'
import { loginFn } from '@/routes/_authed'
import { signupFn } from '@/routes/signup'
import { Auth } from '@/components/Auth'
import { useRefreshSession } from '@/stores/sessionStore'

export function Login() {
  const router = useRouter()
  const refreshSession = useRefreshSession()

  const handleSuccessfulAuth = async () => {

    console.log('✅ Login: Auth successful, redirecting...')
    
    // Invalidate router to refresh user context
    await refreshSession()
    await router.invalidate()
    
    // Navigate to home - merge will happen automatically via global effects
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