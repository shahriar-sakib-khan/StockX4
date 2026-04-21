import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base Layout & Touch Ergonomics
          "flex h-12 md:h-11 w-full px-4 py-2",
          // Typography (16px prevents iOS auto-zoom)
          "text-base md:text-sm",
          // Colors & Borders
          "bg-background border border-border rounded-xl",
          // Transitions
          "transition-all duration-200",
          // File input styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholders
          "placeholder:text-muted-foreground/70",
          // Premium Focus State (Soft Glow)
          "focus-visible:outline-none focus-visible:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/10",
          // Disabled State
          "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 disabled:text-muted-foreground",
          className
        )}
        ref={ref}
        onWheel={(e) => {
          // Prevents accidental scrolling on number inputs
          if (type === 'number') {
            (e.target as HTMLElement).blur();
          }
        }}
        onFocus={(e) => {
          // Auto-select text on focus for faster editing
          e.target.select();
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }