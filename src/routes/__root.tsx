import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { DefaultCatchBoundary } from '@/components/DefaultCatchBoundary'
import { NotFound } from '@/components/NotFound'
import { CartIcon } from '@/components/CartIcon'
import appCss from '@/styles/app.css?url'
import { seo } from '@/utils/seo'
import { getSupabaseServerClient } from '@/utils/supabase'
import { createServerFn } from '@tanstack/react-start'

export const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await getSupabaseServerClient()
  const { data, error: _error } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return null
  }

  return {
    email: data.user.email,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const user = await fetchUser()

    // Handle logout cache clearing
    if (typeof window !== 'undefined') {
      const handleLogout = () => {
        console.log('Handling logout, clearing cart cache')
        context.queryClient.removeQueries({ queryKey: ['cart'] })
        context.queryClient.invalidateQueries({ queryKey: ['cart'] })
      }
      
      window.addEventListener('user-logout', handleLogout)
    }

    return {
      user,
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()

  return (
     <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="p-2 flex gap-2 text-lg border-b">
          <Link
            to="/"
            activeProps={{
              className: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          
          <Link
            to="/products"
            activeProps={{
              className: 'font-bold',
            }}
          >
            Products
          </Link>
          
          <Link
            to="/deferred"
            activeProps={{
              className: 'font-bold',
            }}
          >
            Deferred
          </Link>
          
          <Link
            // @ts-expect-error
            to="/this-route-does-not-exist"
            activeProps={{
              className: 'font-bold',
            }}
          >
            This Route Does Not Exist
          </Link>
          
          <div className="ml-auto flex items-center gap-4">
            {/* Cart Icon - shows for all users */}
            <CartIcon />
            
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Link 
                  to="/profile"
                  activeProps={{ className: 'font-bold' }}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Profile
                </Link>
                <Link 
                  to="/logout"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Logout
                </Link>
              </>
            ) : (
              <Link 
                to="/login"
                className="text-sm hover:text-primary transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
        <hr />
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}