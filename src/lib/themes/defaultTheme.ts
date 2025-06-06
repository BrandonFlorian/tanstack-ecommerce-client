import { Theme } from '@/types/theme';

export const defaultTheme: Theme = {
  id: 'default',
  name: 'Default',
  type: 'modern',
  cssVars: {
    '--background': '#ffffff',
    '--foreground': '#0f172a',
    '--primary': '#0f172a',
    '--primary-foreground': '#f8fafc',
    '--destructive': '#ef4444',
    '--destructive-foreground': '#ffffff',
    '--success': '#22c55e',
    '--success-foreground': '#ffffff',
    '--warning': '#eab308',
    '--warning-foreground': '#0f172a',
    '--secondary': '#f1f5f9',
    '--secondary-foreground': '#0f172a',
    '--accent': '#f1f5f9',
    '--accent-foreground': '#0f172a',
    '--border': '#e2e8f0',
    '--input': '#e2e8f0',
    '--ring': '#94a3b8',
    '--radius': '0.5rem',
  },
  components: {
    button: {
      base: 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      variants: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow',
        success: 'bg-success text-success-foreground hover:bg-success/90 shadow',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      sizes: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-9 px-4 py-2',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
    },
    input: {
      base: 'flex w-full rounded-md border bg-transparent shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
    },
    card: {
      base: 'flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
    },
    select: {
      base: 'flex w-full rounded-md border bg-transparent shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
    },
  },
};