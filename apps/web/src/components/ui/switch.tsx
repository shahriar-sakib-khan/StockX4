import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (onCheckedChange) {
              onCheckedChange(e.target.checked);
          }
          if (onChange) {
              onChange(e);
          }
      };

    return (
      <input
        type="checkbox"
        className={cn(
          "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input appearance-none bg-input checked:bg-primary relative",
          className
        )}
         onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
// Note: Styling a checkbox to look exactly like a Switch with pure CSS/Tailwind (including the thumb) usually requires :before/:after or a wrapper.
// A simple checkbox is a fallback.
// Enhanced version with simplified structure:

const SimpleSwitch = React.forwardRef<HTMLButtonElement, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & { checked?: boolean, onCheckedChange?: (checked: boolean) => void }>(
    ({ className, checked, onCheckedChange, ...props }, ref) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                checked ? "bg-primary" : "bg-input",
                className
            )}
            ref={ref}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )}
            />
        </button>
    )
)
SimpleSwitch.displayName = "Switch"

export { SimpleSwitch as Switch }
