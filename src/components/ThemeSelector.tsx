import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import React from "react";
import { useServerFn } from '@tanstack/react-start';
import { setServerTheme } from '@/lib/themes/server';

export function ThemeSelector() {
  const { currentTheme, setTheme, isHydrated } = useThemeStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const setServerThemeFn = useServerFn(setServerTheme);
  
  const themes = [
    { id: 'default', name: 'Default' },
    { id: 'nes', name: 'NES Classic' },
    { id: 'snes', name: 'SNES Style' },
  ];

  const handleThemeChange = async (themeId: string) => {
    if (themeId === currentTheme.id) return;
    
    setIsLoading(true);
    try {
      // Set theme on server first
      await setServerThemeFn({ data: themeId });
      // Then update client state
      setTheme(themeId);
      // Force reload to ensure proper theme application
      window.location.reload();
    } catch (error) {
      console.error('Failed to set theme:', error);
      setIsLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Theme:</span>
        <div className="px-2 py-1 text-xs rounded border">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm font-medium">Theme:</span>
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => handleThemeChange(theme.id)}
          disabled={isLoading}
          className={cn(
            "px-2 py-1 text-xs rounded border transition-colors disabled:opacity-50",
            currentTheme.id === theme.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-border hover:bg-accent"
          )}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}