import * as React from "react";
import { cn } from "@/lib/utils";

export interface PixelBorderProps {
  children: React.ReactNode;
  size?: number;
  cutCorners?: boolean;
  pressed?: boolean;
  className?: string;
  shadowColor?: string;
  backgroundColor?: string;
}

export const PixelBorder = React.forwardRef<HTMLDivElement, PixelBorderProps>(
  ({ children, size = 4, cutCorners = true, pressed = false, className, shadowColor, backgroundColor }, ref) => {
     
    return (
      <div
        ref={ref}
        className={cn("relative inline-block", className)}
        style={{
          // Ensure no background bleeding
          background: 'transparent',
          pointerEvents: 'none',
        }}
      >
        {/* Main button area */}
        <div
          className="relative"
          style={{
            border: `${size}px solid black`,
            backgroundColor: backgroundColor || '#bdc3c7',
            minHeight: '32px',
            minWidth: '60px',
            // Force no other backgrounds
            backgroundImage: 'none',
            backgroundClip: 'padding-box',
            pointerEvents: 'auto',
          }}
        >
          {/* Cut corners */}
          {cutCorners && (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: -size,
                  left: -size,
                  width: size,
                  height: size,
                  backgroundColor: 'var(--background)',
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -size,
                  right: -size,
                  width: size,
                  height: size,
                  backgroundColor: 'var(--background)',
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -size,
                  left: -size,
                  width: size,
                  height: size,
                  backgroundColor: 'var(--background)',
                  zIndex: 10,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -size,
                  right: -size,
                  width: size,
                  height: size,
                  backgroundColor: 'var(--background)',
                  zIndex: 10,
                }}
              />
            </>
          )}
          
          {/* Shadow overlays - these should be the ONLY overlays */}
          {shadowColor && (
            <>
              {/* Normal state shadows (bottom-right) */}
              {!pressed && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      bottom: 0,
                      width: size,
                      backgroundColor: shadowColor,
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: size,
                      backgroundColor: shadowColor,
                      zIndex: 1,
                    }}
                  />
                </>
              )}
              
              {/* Pressed state shadows (top-left) */}
              {pressed && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: size,
                      backgroundColor: shadowColor,
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: size,
                      backgroundColor: shadowColor,
                      zIndex: 1,
                    }}
                  />
                </>
              )}
            </>
          )}
          
          {/* Content - should have NO background */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${size}px`,
              transform: pressed ? 'translate(1px, 1px)' : 'none',
              transition: 'transform 0.1s ease',
              // FORCE no backgrounds
              background: 'transparent !important',
              backgroundColor: 'transparent !important',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);

PixelBorder.displayName = "PixelBorder";