import { createServerFn } from '@tanstack/react-start'
import { parseCookies, setCookie } from '@tanstack/react-start/server'
import { themes, defaultTheme, type Theme } from '@/lib/themes'

// Server function to get the current theme
export const getServerTheme = createServerFn({ method: 'GET' })
  .handler(async () => {
    const cookies = parseCookies()
    const themeId = cookies['theme-preference'] || 'default' // Default to 'default' theme
    
    const theme = themes.find(t => t.id === themeId) || defaultTheme
    return theme
  })

// Server function to set the theme preference
export const setServerTheme = createServerFn({ method: 'POST' })
  .validator((themeId: string) => themeId)
  .handler(async ({ data: themeId }) => {
    const theme = themes.find(t => t.id === themeId) || defaultTheme
    
    // Set cookie that expires in 1 year
    setCookie('theme-preference', themeId, {
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return theme
  })

  export function generateThemeStyles(theme: Theme): string {
    return Object.entries(theme.cssVars)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
  }
  