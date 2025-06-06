import * as React from "react"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/themeStore"
import { PixelBorder } from "./pixel-border"
import { cva, type VariantProps } from "class-variance-authority"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-transparent text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/70",
        outline: "border-input bg-background",
        secondary: "bg-secondary text-secondary-foreground border-secondary",
        ghost: "border-transparent bg-transparent shadow-none",
        filled: "border-transparent bg-accent text-accent-foreground",
      },
      size: {
        sm: "h-8 px-2 py-1 text-xs",
        default: "h-9 px-3 py-1 text-sm",
        lg: "h-10 px-4 py-2 text-base",
        xl: "h-12 px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", size = "default", ...props }, ref) => {
    const { currentTheme, isPixelTheme } = useThemeStore()
    const inputTheme = currentTheme.components.input

    // For modern themes or if no border config, use cva variants
    if (!isPixelTheme || !inputTheme?.border) {
      return (
        <input
          type={type}
          className={cn(inputVariants({ variant, size }), className)}
          ref={ref}
          {...props}
        />
      )
    }

    // For pixel themes, get theme-specific classes
    const baseClasses = inputTheme.base
    const variantKey = variant || 'default'
    const sizeKey = size || 'default'
    const variantClasses = inputTheme.variants?.[variantKey] || inputTheme.variants?.default || ''
    const sizeClasses = inputTheme.sizes?.[sizeKey] || inputTheme.sizes?.default || ''
    const border = inputTheme.border
    
    // Extract background color from variant classes or use default
    const bgColorMatch = variantClasses.match(/bg-\[([^\]]+)\]/);
    const backgroundColor = bgColorMatch ? bgColorMatch[1] : inputTheme.backgroundColor || '#ffffff';

    return (
      <div className="relative inline-block w-full">
        <PixelBorder
          size={border.size}
          cutCorners={border.cutCorners}
          backgroundColor={backgroundColor}
          className="w-full"
        >
          <input
            type={type}
            className={cn(
              // Reset all styling
              "w-full border-0 outline-0 bg-transparent",
              "focus:outline-none focus:ring-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Apply theme classes
              baseClasses,
              variantClasses,
              sizeClasses,
              // Extract only text and placeholder colors
              variantClasses.match(/text-[\w\[\]#-]+/g)?.join(' ') || 'text-current',
              variantClasses.match(/placeholder:text-[\w\[\]#/-]+/g)?.join(' ') || '',
              className
            )}
            ref={ref}
            style={{
              background: 'transparent !important',
              backgroundColor: 'transparent !important',
              boxShadow: 'none !important',
            }}
            {...props}
          />
        </PixelBorder>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }