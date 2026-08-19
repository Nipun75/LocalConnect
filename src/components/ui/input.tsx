import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-12 w-full rounded-xs border border-border-interactive bg-surface px-4 py-2 text-body-large ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-soft focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground md:text-body",
        className
      )}
      {...props}
    />
  )
}

export { Input }
