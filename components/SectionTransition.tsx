"use client";

import React, { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type AnimationDirection = "up" | "down" | "left" | "right" | "none";
type AnimationDistance = "subtle" | "medium" | "large";

interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: AnimationDirection;
  distance?: AnimationDistance;
  once?: boolean;
  threshold?: number;
  scale?: boolean;
  blur?: boolean;
  stagger?: boolean;
  staggerChildren?: number;
  staggerDirection?: "forward" | "reverse";
  elementType?: keyof JSX.IntrinsicElements;
}

/**
 * SectionTransition - A component that adds Apple-style smooth transitions when scrolling between sections
 *
 * This component creates subtle parallax and fade effects for content sections
 * giving the page a premium, fluid feel inspired by Apple's website transitions.
 */
export default function SectionTransition({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = "medium",
  once = true,
  threshold = 0.1,
  scale = false,
  blur = false,
  stagger = false,
  staggerChildren = 0.05,
  staggerDirection = "forward",
  elementType = "div",
}: SectionTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
  });

  // Map distance values to actual pixels for translation
  const distanceMap = {
    subtle: 15,
    medium: 30,
    large: 60,
  };

  const getTranslateValue = (): [number, number] => {
    const pixelValue = distanceMap[distance];
    switch (direction) {
      case "up":
        return [0, pixelValue];
      case "down":
        return [0, -pixelValue];
      case "left":
        return [pixelValue, 0];
      case "right":
        return [-pixelValue, 0];
      default:
        return [0, 0];
    }
  };

  // Define animation variants
  const containerVariants = {
    hidden: {
      opacity: 0,
      x: getTranslateValue()[0],
      y: getTranslateValue()[1],
      scale: scale ? 0.95 : 1,
      filter: blur ? "blur(10px)" : "blur(0px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration,
        delay,
        ease: [0.2, 0.65, 0.3, 0.9], // Apple-like spring easing
        when: "beforeChildren",
        staggerChildren: stagger ? staggerChildren : 0,
        staggerDirection: staggerDirection === "forward" ? 1 : -1,
      },
    },
  };

  // Child animation variant for staggered animations
  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: scale ? 0.95 : 1,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: duration * 0.8,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  const MotionComponent = motion[elementType as keyof typeof motion];

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      {stagger
        ? React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return (
                <motion.div
                  key={index}
                  variants={childVariants}
                  transition={{
                    delay: index * staggerChildren,
                  }}
                >
                  {child}
                </motion.div>
              );
            }
            return child;
          })
        : children}
    </motion.div>
  );
}

// Export a higher-order component for custom animations
export function withSectionTransition<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  transitionProps: Omit<SectionTransitionProps, "children">
) {
  return function WithTransition(props: P) {
    return (
      <SectionTransition {...transitionProps}>
        <WrappedComponent {...props} />
      </SectionTransition>
    );
  };
}

/**
 * ParallaxSection - A component that adds parallax scrolling effects
 * with variable intensities for different elements, creating depth
 */
interface ParallaxSectionProps {
  children: React.ReactNode;
  intensity?: number; // 0-1, default 0.5
  className?: string;
}

export function ParallaxSection({
  children,
  intensity = 0.5,
  className = "",
}: ParallaxSectionProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 300 * intensity]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/**
 * RevealText - A text revealing animation component in the style of Apple reveals
 * Words appear sequentially with subtle scaling and opacity transitions
 */
interface RevealTextProps {
  text: string;
  className?: string;
  highlightWords?: string[];
  highlightClassName?: string;
  delay?: number;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  className = "",
  highlightWords = [],
  highlightClassName = "text-primary",
  delay = 0,
}) => {
  const words = text.split(" ");

  // Create a map of highlighted words
  const highlightMap = new Set(
    highlightWords.map((word) => word.toLowerCase())
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex flex-wrap gap-x-2">
        {words.map((word, i) => {
          const isHighlighted = highlightMap.has(word.toLowerCase());
          const wordDelay = delay + i * 0.05;

          return (
            <motion.span
              key={i}
              className={`inline-block ${
                isHighlighted ? highlightClassName : ""
              }`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
                delay: wordDelay,
              }}
            >
              {word}
              {i < words.length - 1 ? "" : ""}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};
