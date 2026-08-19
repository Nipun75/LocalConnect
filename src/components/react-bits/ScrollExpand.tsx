import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollExpandProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export function ScrollExpand({ children, className, containerClassName }: ScrollExpandProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.5, 1]);

  if (shouldReduceMotion) {
    return <div className={cn("w-full", containerClassName)}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={cn("w-full overflow-hidden flex justify-center py-12", containerClassName)}>
      <motion.div 
        style={{ scale, opacity }}
        className={cn("w-full h-full origin-center will-change-transform", className)}
      >
        {children}
      </motion.div>
    </div>
  );
}
