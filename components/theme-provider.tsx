"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Premium Apple-style theme provider with sophisticated transitions between color modes
 * Implements a subtle crossfade and zoom effect similar to macOS theme transitions
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [previousTheme, setPreviousTheme] = React.useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = React.useState<string | null>(null);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Handle hydration
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track theme changes for animation purposes
  React.useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "class" &&
            document.documentElement.classList.contains("dark") !==
              (currentTheme === "dark")
          ) {
            setPreviousTheme(currentTheme);
            setCurrentTheme(
              document.documentElement.classList.contains("dark")
                ? "dark"
                : "light"
            );
          }
        });
      });

      observer.observe(document.documentElement, { attributes: true });
      setCurrentTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );

      return () => observer.disconnect();
    }
  }, [isMounted, currentTheme]);

  return (
    <NextThemesProvider {...props}>
      <MotionConfig reducedMotion={isReducedMotion ? "user" : "never"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isMounted ? `mounted-${currentTheme}` : "loading"}
            initial={{ opacity: 0, scale: isReducedMotion ? 1 : 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: isReducedMotion ? 1 : 1.02,
              filter: "blur(4px)",
            }}
            transition={{
              duration: isReducedMotion ? 0.1 : 0.4,
              ease: [0.22, 1, 0.36, 1],
              scale: {
                type: "spring",
                damping: 20,
                stiffness: 300,
              },
            }}
            className="contents"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </MotionConfig>
    </NextThemesProvider>
  );
}
