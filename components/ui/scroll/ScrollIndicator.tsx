"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ScrollIndicatorProps {
  sections?: string[];
  color?: string;
}

// Navigation items with their paths and colors
const navigationItems = [
  { path: "/", title: "Home", color: "#34c759" },
  { path: "/article", title: "Articles", color: "#007aff" },
  { path: "/store", title: "Store", color: "#ff9500" },
  { path: "/category", title: "Categories", color: "#ff3b30" },
  { path: "/author", title: "Author", color: "#af52de" },
  { path: "/contact", title: "Contact", color: "#ff2d55" },
];

export function ScrollIndicator({
  sections = [],
  color,
}: ScrollIndicatorProps) {
  const { scrollYProgress } = useScroll();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [currentSection, setCurrentSection] = useState(0);

  // Smooth spring animation for scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform progress to percentage
  const progress = useTransform(smoothProgress, [0, 1], [0, 100]);

  // Update current section based on scroll position
  useEffect(() => {
    const unsubscribe = progress.onChange((value) => {
      const sectionSize = 100 / (sections.length || navigationItems.length);
      const newSection = Math.floor(value / sectionSize);
      setCurrentSection(newSection);
    });

    return () => unsubscribe();
  }, [progress, sections.length]);

  // Calculate dot state with color transitions
  const getDotState = (index: number) => {
    const totalSections = sections.length || navigationItems.length;
    const sectionProgress = progress.get();
    const sectionSize = 100 / totalSections;
    const sectionProgressNormalized =
      (sectionProgress % sectionSize) / sectionSize;

    const isActive = index <= currentSection;
    const isCurrent = index === currentSection;
    const isNext = index === currentSection + 1;
    const isPrev = index === currentSection - 1;

    const navItem = navigationItems[index];
    const currentColor = navigationItems[currentSection]?.color;
    const nextColor = navigationItems[currentSection + 1]?.color;
    const prevColor = navigationItems[currentSection - 1]?.color;

    let dotColor = navItem?.color || "currentColor";
    let scale = 1;
    let opacity = 0.3;
    let glow = "none";

    if (isCurrent) {
      // Current dot: Blend between current and next color
      const blend = sectionProgressNormalized;
      dotColor = `color-mix(in srgb, ${currentColor} ${(1 - blend) * 100}%, ${
        nextColor || currentColor
      } ${blend * 100}%)`;
      scale = 1.3;
      opacity = 1;
      glow = `0 0 8px ${currentColor}80`;
    } else if (isNext) {
      // Next dot: Fade in next color
      dotColor = nextColor || currentColor;
      scale = 1.1 + sectionProgressNormalized * 0.2;
      opacity = 0.7 + sectionProgressNormalized * 0.3;
      glow = `0 0 4px ${nextColor}40`;
    } else if (isPrev) {
      // Previous dot: Fade out previous color
      dotColor = prevColor || currentColor;
      scale = 1.1 + (1 - sectionProgressNormalized) * 0.2;
      opacity = 0.7 + (1 - sectionProgressNormalized) * 0.3;
      glow = `0 0 4px ${prevColor}40`;
    } else if (isActive) {
      // Active but not current: Use section's own color
      dotColor = navItem?.color;
      scale = 1.1;
      opacity = 0.5;
    }

    return { color: dotColor, scale, opacity, glow };
  };

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: sections.length || navigationItems.length }).map(
        (_, index) => {
          const { color, scale, opacity, glow } = getDotState(index);

          return (
            <motion.button
              key={index}
              onClick={() => {
                const totalHeight =
                  document.documentElement.scrollHeight - window.innerHeight;
                const targetScroll =
                  (totalHeight * index) /
                  (sections.length || navigationItems.length);
                window.scrollTo({
                  top: targetScroll,
                  behavior: "smooth",
                });
              }}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                "hover:scale-110 active:scale-95",
                "backdrop-blur-sm"
              )}
              style={{
                backgroundColor: color,
                transform: `scale(${scale})`,
                opacity,
                boxShadow: glow,
              }}
              whileHover={{
                scale: 1.2,
                boxShadow: `0 0 12px ${color}80`,
              }}
              whileTap={{ scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            />
          );
        }
      )}
    </div>
  );
}
