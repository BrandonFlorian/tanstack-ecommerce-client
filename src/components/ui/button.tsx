import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/themeStore";
import { PixelBorder } from "./pixel-border";

export const buttonVariants = cva(
  "inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-500 text-white hover:bg-green-600",
        warning: "bg-yellow-500 text-black hover:bg-yellow-600",
        error: "bg-red-500 text-white hover:bg-red-600",
        disabled: "bg-gray-300 text-gray-500 cursor-not-allowed",
      },
      size: {
        icon: "h-9 w-9",
        xs: "h-7 px-2 rounded-md",
        sm: "h-8 px-3 rounded-md",
        md: "h-9 px-4 rounded-md",
        lg: "h-10 px-6 rounded-md",
        xl: "h-12 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'warning' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    asChild = false, 
    children, 
    ...props 
  }, ref) => {
    const { currentTheme, isPixelTheme } = useThemeStore();
    const [isPressed, setIsPressed] = React.useState(false);
    
    const Comp = asChild ? Slot : "button";
    const buttonTheme = currentTheme.components.button;

    // Event handlers for pixel theme press effect
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true);
      props.onMouseDown?.(e);
    };
    
    const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      props.onMouseUp?.(e);
    };
    
    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(false);
      props.onMouseLeave?.(e);
    };

    // Get theme-specific classes
    const baseClasses = buttonTheme.base;
    const variantClasses = buttonTheme.variants[variant] || buttonTheme.variants.default;
    const sizeClasses = buttonTheme.sizes[size] || buttonTheme.sizes.default;

    const buttonClasses = cn(
      baseClasses,
      variantClasses,
      sizeClasses,
      className
    );

    // For modern themes, render normally
    if (!isPixelTheme) {
      return (
        <Comp
          className={buttonClasses}
          ref={ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    // For pixel themes, wrap with PixelBorder
    const border = buttonTheme.border;
    const shadows = buttonTheme.shadows;
    
    if (!border) {
      return (
        <Comp
          className={buttonClasses}
          ref={ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    const shadowColor = shadows?.[variant] || shadows?.default;
    
    // Extract background color from variantClasses
    const bgColorMatch = variantClasses.match(/bg-\[([^\]]+)\]/);
    const backgroundColor = bgColorMatch ? bgColorMatch[1] : '#bdc3c7';

    console.log('Button render:', { variant, backgroundColor, shadowColor }); // Debug

    return (
      <PixelBorder
        size={border.size}
        cutCorners={border.cutCorners}
        pressed={isPressed}
        shadowColor={shadowColor}
        backgroundColor={backgroundColor}
        className={className}
      >
        <Comp
          className={cn(
            // COMPLETELY reset all styling - no backgrounds, borders, padding
            "appearance-none border-0 outline-0 m-0 p-0",
            "bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent",
            "w-full h-full min-h-0 min-w-0",
            "flex items-center justify-center",
            "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            // Only keep text styling
            variantClasses.match(/text-[\w\[\]#-]+/g)?.join(' ') || 'text-current',
            sizeClasses.match(/text-[\w-]+/g)?.join(' ') || '',
            buttonTheme.base.includes('font-pixel') ? 'font-pixel' : ''
          )}
          ref={ref}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{
            // Force override any inherited styles
            background: 'transparent !important',
            backgroundColor: 'transparent !important',
            border: 'none !important',
            boxShadow: 'none !important',
          }}
          {...props}
        >
          {children}
        </Comp>
      </PixelBorder>
    );
  }
);

Button.displayName = "Button";

export { Button };