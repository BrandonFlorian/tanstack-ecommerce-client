import * as React from "react"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/themeStore"
import { PixelBorder } from "./pixel-border"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        primary: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "bg-background border-2",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "border-transparent shadow-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const { currentTheme, isPixelTheme } = useThemeStore()
    const cardTheme = currentTheme.components.card
    
    // For modern themes or if no border config, use cva variants
    if (!isPixelTheme || !cardTheme?.border) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant }), className)}
          {...props}
        />
      )
    }
    
    // For pixel themes
    const baseClasses = cardTheme.base
    const variantKey = variant || 'default'
    const variantClasses = cardTheme.variants?.[variantKey] || cardTheme.variants?.default || ''
    const border = cardTheme.border
    
    // Extract background color
    const bgColorMatch = variantClasses.match(/bg-\[([^\]]+)\]/);
    const backgroundColor = bgColorMatch ? bgColorMatch[1] : '#ffffff';
    
    // Apply flex and height classes to the PixelBorder wrapper
    return (
      <PixelBorder
        ref={ref}
        size={border.size}
        cutCorners={border.cutCorners}
        backgroundColor={backgroundColor}
        className={cn("flex flex-col h-full", className)} // Add flex and h-full here
      >
        <div className={cn(
          "flex flex-col gap-6 py-6 h-full", // Ensure inner div also has flex-col and h-full
          baseClasses,
          variantClasses,
          // Extract text color
          variantClasses.match(/text-[\w\[\]#-]+/g)?.join(' ') || 'text-current'
        )}>
          {props.children}
        </div>
      </PixelBorder>
    )
  }
)
Card.displayName = "Card"

// Keep all the sub-components exactly as they are...
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("leading-none font-semibold", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
      className
    )}
    {...props}
  />
))
CardAction.displayName = "CardAction"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-6 flex-1", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }