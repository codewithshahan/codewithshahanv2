"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { motion, AnimatePresence } from "framer-motion";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState<string>("light");

  // Handle theme change
  const handleThemeChange = React.useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 100); // Super fast transition
  }, []);

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = document.documentElement.classList.contains("dark");
          setCurrentTheme(isDark ? "dark" : "light");
          handleThemeChange();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [handleThemeChange]);

  return (
    <div className="theme-transition relative">
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.1, // Super fast
              ease: "linear",
            }}
            className="fixed inset-0 z-[2147483647] pointer-events-none"
            style={{
              background:
                currentTheme === "dark"
                  ? "rgba(0, 0, 0, 0.1)"
                  : "rgba(255, 255, 255, 0.1)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Premium Apple-style theme provider with sophisticated transitions between color modes
 * Implements a subtle crossfade and zoom effect similar to macOS theme transitions
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Add smooth transition styles
  React.useEffect(() => {
    if (mounted) {
      const style = document.createElement("style");
      style.textContent = `
        :root {
          color-scheme: light dark;
        }
        * {
          transition: background-color 0.1s linear,
                      color 0.1s linear,
                      border-color 0.1s linear,
                      box-shadow 0.1s linear !important;
        }
        .theme-transition {
          transition: all 0.1s linear;
        }
        .theme-transition * {
          transition: all 0.1s linear;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  );
}
