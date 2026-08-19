import React, { forwardRef, useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ShinyButton = forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, type = "button", disabled, ...props }, ref) => {
    const [reduceMotion, setReduceMotion] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const motionProps = props as HTMLMotionProps<"button">;

    // The dark navy to electric blue gradient
    const gradientGlow = "conic-gradient(from 0deg, #001A3D 0%, #001A3D 40%, #0047FF 48%, #2F6BFF 50%, #0047FF 52%, #001A3D 60%, #001A3D 100%)";

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        whileHover={!disabled && !reduceMotion ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !reduceMotion ? { scale: 0.98 } : undefined}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "relative flex items-center justify-center font-semibold transition-all duration-500",
          "rounded-full overflow-hidden p-[2px]", // 2px border thickness
          "bg-neutral-800", // Default dark/neutral border
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047FF] focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          (reduceMotion || disabled) && "border-[2px] border-neutral-800 p-0",
          className
        )}
        {...motionProps}
      >
        {/* Synchronized Glow and Border Wrappers */}
        {!reduceMotion && !disabled && (
          <>
            {/* The soft, atmospheric glow that travels with the gradient */}
            <motion.div
              className="absolute inset-[-100%] z-0 pointer-events-none transition-opacity duration-700 blur-md opacity-60"
              style={{
                opacity: isHovered ? 0.7 : 0,
                background: gradientGlow,
              }}
              animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 6, // Slow 6s loop
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* The sharp animated border layer */}
            <motion.div
              className="absolute inset-[-100%] z-0 pointer-events-none transition-opacity duration-700"
              style={{
                opacity: isHovered ? 1 : 0,
                background: gradientGlow,
              }}
              animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 6, // Slow 6s loop (must exactly match glow duration)
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </>
        )}

        {/* Button Interior */}
        <div className="relative z-10 flex items-center justify-center w-full h-full bg-neutral-950 rounded-full px-8 text-white transition-colors duration-300">
          <span className="flex items-center gap-1 drop-shadow-sm pointer-events-none">
            {children}
          </span>
        </div>
      </motion.button>
    );
  }
);

ShinyButton.displayName = "ShinyButton";
