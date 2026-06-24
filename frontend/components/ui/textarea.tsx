import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // bg-white/dark:bg-[rgba] hardcoded — same reason as Input.
        // Global CSS pins -webkit-text-fill-color for both light and dark mode.
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-white px-2.5 py-2 text-base text-gray-900 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-white/8 dark:text-gray-100 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      style={style}
      {...props}
    />
  )
}

export { Textarea }
