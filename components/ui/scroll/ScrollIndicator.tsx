"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

interface ScrollIndicatorProps {
  sections: string[];
}

export const ScrollIndicator = ({ sections }: ScrollIndicatorProps) => {
  const [activeSection, setActiveSection] = useState<string>("");
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
    };
    return (
      colors[section as keyof typeof colors] || (isDark ? "#FFFFFF" : "#000000")
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
    };
  }, [sections]);

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
          onClick={() => {
            const element = document.getElementById(section);
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="relative"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          aria-label={`Scroll to ${section}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeSection === section ? "scale-125" : "scale-100"
              }`}
              style={{
                backgroundColor:
                  activeSection === section
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
                scale: activeSection === section ? 1.25 : 1,
                backgroundColor:
                  activeSection === section
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
          {activeSection === section && (
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
