import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface NeonGlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const NeonGlowButton = forwardRef<HTMLButtonElement, NeonGlowButtonProps>(
  ({ children, className, type = "button", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "relative flex items-center justify-center font-semibold transition-all duration-300",
          "rounded-full px-8 bg-neutral-950 text-white border-2 border-[#0047FF] hover:bg-[#0047FF]/10",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047FF] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-1 drop-shadow-sm pointer-events-none">
          {children}
        </span>
      </button>
    );
  }
);

NeonGlowButton.displayName = "NeonGlowButton";
