import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => (
  // Mock ScrollBar: Native scrollbars are usually fine for MVP, or we rely on 'overflow-auto' above.
  // This component acts as a no-op or simple spacer if needed, but ScrollArea handles overflow.
  null
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
