import { useRef } from 'react';
import { motion, useReducedMotion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MaskedHeadingProps {
  text: string;
  className?: string;
  element?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

export function MaskedHeading({ text, className, element = 'h1' }: MaskedHeadingProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  const MotionTag = motion[element as keyof typeof motion] as React.ElementType;

  if (shouldReduceMotion) {
    return (
      <MotionTag className={className}>
        {text}
      </MotionTag>
    );
  }

  // Split into words for staggered reveal
  const words = text.split(" ");

  return (
    <MotionTag ref={ref} className={cn("flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block pb-1">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 2 }}
            animate={isInView ? { y: 0, rotate: 0 } : { y: "110%", rotate: 2 }}
            transition={{
              duration: 0.6,
              ease: [0.1, 0.9, 0.2, 1], // motion.easing.entrance
              delay: i * 0.05
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
