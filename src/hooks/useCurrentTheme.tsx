import { useThemeStore } from "@/stores/themeStore";

export function useCurrentTheme() {
    const { currentTheme, isPixelTheme } = useThemeStore();
    return { currentTheme, isPixelTheme };
  }