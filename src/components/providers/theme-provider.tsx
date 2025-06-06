import * as React from "react";
import { useThemeStore } from "@/stores/themeStore";
import { type Theme } from "@/lib/themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  serverTheme: Theme;
}

export function ThemeProvider({ children, serverTheme }: ThemeProviderProps) {
  const { setHydrated, currentTheme } = useThemeStore();
  
  React.useEffect(() => {
    // Mark as hydrated without applying any theme changes
    setHydrated();
  }, [setHydrated]);
  
  // Use server theme until hydrated, then use client theme
  const activeTheme = useThemeStore((state) => 
    state.isHydrated ? state.currentTheme : serverTheme
  );
  
  return <>{children}</>;
}