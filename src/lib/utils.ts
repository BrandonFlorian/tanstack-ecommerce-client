import { Theme } from "@/types/theme";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { defaultTheme } from "./themes/defaultTheme";
import { themes } from "./themes";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getThemeById(id: string): Theme {
  return themes.find(theme => theme.id === id) || defaultTheme;
}