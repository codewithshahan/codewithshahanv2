"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useScroll } from "@/contexts/ScrollContext";

interface ScrollIndicatorProps {
  sections?: string[];
}

export const ScrollIndicator = ({ sections = [] }: ScrollIndicatorProps) => {
  const { currentSection, setSections } = useScroll();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Dynamic colors based on section
  const getSectionColor = (section: string) => {
    const colors = {
      hero: isDark ? "#60A5FA" : "#2563EB", // Blue
      "featured-articles": isDark ? "#34D399" : "#059669", // Green
      categories: isDark ? "#F472B6" : "#DB2777", // Pink
      "ai-insight": isDark ? "#A78BFA" : "#7C3AED", // Purple
      newsletter: isDark ? "#FBBF24" : "#D97706", // Yellow
      products: isDark ? "#F87171" : "#DC2626", // Red
      // Add more section colors as needed
      "store-products": isDark ? "#F87171" : "#DC2626", // Red
      "store-categories": isDark ? "#F472B6" : "#DB2777", // Pink
      "author-bio": isDark ? "#60A5FA" : "#2563EB", // Blue
      "author-articles": isDark ? "#34D399" : "#059669", // Green
      "article-content": isDark ? "#A78BFA" : "#7C3AED", // Purple
      "article-comments": isDark ? "#FBBF24" : "#D97706", // Yellow
    };
    return (
      colors[section as keyof typeof colors] || (isDark ? "#FFFFFF" : "#000000")
    );
  };

  useEffect(() => {
    if (sections.length > 0) {
      setSections(sections);
    }
  }, [sections, setSections]);

  return (
    <motion.div
      className="flex items-center gap-2 p-1.5 backdrop-blur-md bg-background/40 rounded-full border border-border/30 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {sections.map((section) => (
        <motion.button
          key={section}
          className="relative"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          aria-label={`Scroll to ${section}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                currentSection === section ? "scale-125" : "scale-100"
              }`}
              style={{
                backgroundColor:
                  currentSection === section
                    ? getSectionColor(section)
                    : isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
              }}
              whileHover={{
                backgroundColor: getSectionColor(section),
                scale: 1.2,
              }}
              animate={{
                scale: currentSection === section ? 1.25 : 1,
                backgroundColor:
                  currentSection === section
                    ? getSectionColor(section)
                    : isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
              }}
            />
          </AnimatePresence>

          {/* Glow effect for active section */}
          {currentSection === section && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: getSectionColor(section),
                filter: "blur(8px)",
                opacity: 0.5,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
};
