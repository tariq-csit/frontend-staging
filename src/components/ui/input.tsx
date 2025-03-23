import * as React from "react"

import { cn } from "@/lib/utils"

// @ts-ignore
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
          "flex h-10 rounded-md border border-input bg-inherit px-4 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
