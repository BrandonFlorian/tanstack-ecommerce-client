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
import { AuthDebugger } from '@/components/AuthDebugger'
import appCss from '@/styles/app.css?url'
import { seo } from '@/utils/seo'
import { getValidatedServerSession } from '@/utils/supabase'
import { createServerFn } from '@tanstack/react-start'
import { useInitializeSession } from '@/stores/sessionStore'
import { LogoutButton } from '@/components/LogoutButton'
import { useCartAfterLogin } from '@/hooks/useCart'

export const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  // Use validated session for initial page load
  const { session, isValid } = await getValidatedServerSession()

  if (!isValid || !session?.user?.email) {
    return null
  }

  return {
    email: session.user.email,
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
  beforeLoad: async () => {
    const user = await fetchUser()
    return { user }
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
  useInitializeSession()
  useCartAfterLogin()

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
            to="/orders"
            activeProps={{
              className: 'font-bold',
            }}
          >
            Orders
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
                <LogoutButton />
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
        {/* <AuthDebugger /> */}
        <TanStackRouterDevtools position="bottom-right" />
        <ReactQueryDevtools buttonPosition="bottom-left" />
        <Scripts />
      </body>
    </html>
  )
}