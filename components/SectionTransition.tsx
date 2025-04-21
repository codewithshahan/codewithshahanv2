import React, { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

/**
 * SectionTransition - A component that adds Apple-style smooth transitions when scrolling between sections
 *
 * This component creates subtle parallax and fade effects for content sections
 * giving the page a premium, fluid feel inspired by Apple's website transitions.
 */
const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  className = "",
  index = 0,
}) => {
  // Calculate staggered transition delays based on index
  const baseDelay = 0.1 + index * 0.05;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1], // Custom Apple-like ease curve
        delay: baseDelay,
      }}
    >
      {/* Subtle gradient backdrop for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.01] to-transparent opacity-50 pointer-events-none" />

      {/* Main content with slight parallax */}
      <motion.div
        initial={{ scale: 0.98 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
          delay: baseDelay + 0.1,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default SectionTransition;

/**
 * ParallaxSection - A component that adds parallax scrolling effects
 * with variable intensities for different elements, creating depth
 */
interface ParallaxSectionProps {
  children: ReactNode;
  intensity?: number; // 0-1, default 0.5
  className?: string;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  intensity = 0.5,
  className = "",
}) => {
  // Calculate parallax effect based on scroll position
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100 * intensity]);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
};

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
