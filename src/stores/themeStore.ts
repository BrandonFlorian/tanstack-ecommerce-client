import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themes, defaultTheme, type Theme } from '@/lib/themes';

interface ThemeStore {
  currentTheme: Theme;
  isPixelTheme: boolean;
  isHydrated: boolean;
  setTheme: (themeId: string) => void;
  setHydrated: () => void;
}

// Helper to get theme from cookie
const getThemeFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const match = document.cookie.match(/theme-preference=([^;]+)/);
  return match ? match[1] : null;
}

// Helper to get initial theme
const getInitialTheme = (): Theme => {
  // First check cookie (for SSR consistency)
  const cookieTheme = getThemeFromCookie();
  if (cookieTheme) {
    const theme = themes.find(t => t.id === cookieTheme);
    if (theme) return theme;
  }
  
  // Then check localStorage (for client-side persistence)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('theme-storage');
      if (stored) {
        const parsed = JSON.parse(stored);
        const themeId = parsed.state?.themeId;
        if (themeId) {
          const theme = themes.find(t => t.id === themeId);
          if (theme) return theme;
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }
  
  // Default to the actual default theme for new users
  return defaultTheme;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => {
      const initialTheme = getInitialTheme();
      
      return {
        currentTheme: initialTheme,
        isPixelTheme: initialTheme.type === 'pixel',
        isHydrated: false,
        
        setTheme: (themeId: string) => {
          const theme = themes.find(t => t.id === themeId) || defaultTheme;
          set({ 
            currentTheme: theme,
            isPixelTheme: theme.type === 'pixel'
          });
          
          // Set cookie for server-side persistence
          document.cookie = `theme-preference=${themeId}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;
        },
        
        setHydrated: () => {
          set({ isHydrated: true });
        },
      }
    },
    {
      name: 'theme-storage',
      partialize: (state) => ({ 
        themeId: state.currentTheme.id 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const persistedId = (state as any).themeId;
          if (persistedId) {
            const theme = themes.find(t => t.id === persistedId) || defaultTheme;
            state!.currentTheme = theme;
            state!.isPixelTheme = theme.type === 'pixel';
          }
        }
      },
    }
  )
);