import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // bg-white + text-gray-900 are INTENTIONALLY hardcoded here (not CSS-variable
        // driven). On old Android WebViews with "Force Dark Mode", bg-transparent
        // inherits a forced dark background and CSS-variable-based text colours get
        // inverted to white, making typed text invisible. Explicit values bypass that.
        "h-8 w-full min-w-0 rounded-lg border border-input bg-white px-2.5 py-1 text-base text-gray-900 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:text-gray-100 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={{ color: '#111111', WebkitTextFillColor: '#111111', ...style }}
      {...props}
    />
  )
}

export { Input }
