"use client";

import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";

interface DynamicWeightProps {
  text: string;
  className?: string;
  minWeight?: number;
  maxWeight?: number;
  radius?: number;
}

export function DynamicWeight({
  text,
  className = "",
  minWeight = 400,
  maxWeight = 800,
  radius = 200,
}: DynamicWeightProps) {
  const mouseX = useMotionValue(Infinity);
  const mouseY = useMotionValue(Infinity);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeave = () => {
      mouseX.set(Infinity);
      mouseY.set(Infinity);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY]);

  return (
    <div className={`flex flex-wrap justify-center ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") {
          return (
            <span key={index} className="inline-block w-[0.25em]">
              &nbsp;
            </span>
          );
        }
        return (
          <DynamicLetter
            key={index}
            char={char}
            mouseX={mouseX}
            mouseY={mouseY}
            minWeight={minWeight}
            maxWeight={maxWeight}
            radius={radius}
          />
        );
      })}
    </div>
  );
}

function DynamicLetter({
  char,
  mouseX,
  mouseY,
  minWeight,
  maxWeight,
  radius,
}: {
  char: string;
  mouseX: any;
  mouseY: any;
  minWeight: number;
  maxWeight: number;
  radius: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const distance = useMotionValue(radius);

  useEffect(() => {
    const updateDistance = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const elX = rect.left + rect.width / 2;
      const elY = rect.top + rect.height / 2;

      const mX = mouseX.get();
      const mY = mouseY.get();

      if (mX === Infinity || mY === Infinity) {
        distance.set(radius);
        return;
      }

      const dist = Math.sqrt((mX - elX) ** 2 + (mY - elY) ** 2);
      distance.set(dist);
    };

    const unsubscribeX = mouseX.on("change", updateDistance);
    const unsubscribeY = mouseY.on("change", updateDistance);

    return () => {
      unsubscribeX();
      unsubscribeY();
    };
  }, [mouseX, mouseY, distance, radius]);

  const rawWeight = useTransform(
    distance,
    [0, radius],
    [maxWeight, minWeight]
  );

  const smoothWeight = useSpring(rawWeight, { stiffness: 150, damping: 20 });
  const fontVariationSettings = useMotionTemplate`"wght" ${smoothWeight}`;

  return (
    <motion.span
      ref={ref}
      style={{
        fontWeight: smoothWeight,
        fontVariationSettings,
        display: "inline-block",
      }}
    >
      {char}
    </motion.span>
  );
}
