"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render component after hydration to avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted/20" aria-hidden="true" />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-background/90 text-foreground backdrop-blur-sm transition-all hover:ring hover:ring-border hover:ring-offset-1"
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {resolvedTheme === "dark" ? (
          <ThemeIcon key="dark-icon" iconType="sun" />
        ) : (
          <ThemeIcon key="light-icon" iconType="moon" />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

type IconType = "sun" | "moon";

// Animated icon component
function ThemeIcon({ iconType }: { iconType: IconType }) {
  // Animation variants
  const variants = {
    initial: { opacity: 0, rotate: -30, scale: 0.5 },
    animate: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 30, scale: 0.5 },
  };

  return (
    <motion.div
      key={iconType}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
      }}
      className="absolute"
    >
      {iconType === "sun" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[18px] w-[18px]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-[18px] w-[18px]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </motion.div>
  );
}
