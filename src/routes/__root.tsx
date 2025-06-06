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
import { AuthDebugger } from '@/components/AuthDebugger'
import appCss from '@/styles/app.css?url'
import { seo } from '@/utils/seo'
import { getValidatedServerSession } from '@/utils/supabase'
import { createServerFn } from '@tanstack/react-start'
import { useInitializeSession } from '@/stores/sessionStore'
import { useCartAfterLogin } from '@/hooks/useCart'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { getServerTheme, generateThemeStyles } from '@/lib/themes/server'
import { useThemeStore } from '@/stores/themeStore'

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
    const [user, serverTheme] = await Promise.all([
      fetchUser(),
      getServerTheme()
    ])
    
    return { user, serverTheme }
  },
  errorComponent: (props) => {
    const { serverTheme } = Route.useRouteContext()
    return (
      <RootDocument serverTheme={serverTheme}>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const { serverTheme } = Route.useRouteContext()
  
  return (
    <RootDocument serverTheme={serverTheme}>
      <Outlet /> 
    </RootDocument>
  )
}

function RootDocument({ 
  children, 
  serverTheme 
}: { 
  children: React.ReactNode
  serverTheme?: any
}) {
  const { user, serverTheme: contextTheme } = Route.useRouteContext()
  const theme = serverTheme || contextTheme
  const { currentTheme, isHydrated } = useThemeStore()
  
  // Use client theme after hydration
  const activeTheme = isHydrated ? currentTheme : theme
  
  useInitializeSession()
  useCartAfterLogin()

  return (
    <html>
      <head>
        <HeadContent />
        {/* Apply theme styles only once */}
        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${generateThemeStyles(activeTheme)} }`
          }}
        />
      </head>
      <body>
        <ThemeProvider serverTheme={theme}>
          <Navbar user={user} />
          <hr />
          {children}
          <Toaster />
          <TanStackRouterDevtools position="bottom-right" />
          <ReactQueryDevtools buttonPosition="bottom-left" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}