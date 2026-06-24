import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // bg-white/dark:bg-[rgba] and text-gray-900/dark:text-gray-100 are hardcoded
        // (not CSS-variable driven). Global CSS in index.css pins -webkit-text-fill-color
        // with !important for both light and dark mode to defeat Android Force Dark Mode.
        "h-8 w-full min-w-0 rounded-lg border border-input bg-white px-2.5 py-1 text-base text-gray-900 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/8 dark:text-gray-100 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { Input }
