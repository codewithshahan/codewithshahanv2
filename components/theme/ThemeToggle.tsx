"use client";

import { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useMediaQuery from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Premium macOS-inspired theme toggle with fluid 3D animations
 * Mimics Apple's design language with spring physics and subtle effects
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDark = resolvedTheme === "dark";

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  // Handle theme toggle with haptic feedback if available
  const toggleTheme = () => {
    // Optional haptic feedback
    if (window.navigator && "vibrate" in window.navigator) {
      window.navigator.vibrate(3);
    }

    // Toggle theme
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);

    // Announce to screen readers
    const message = `Theme changed to ${newTheme} mode`;
    if (buttonRef.current) {
      buttonRef.current.setAttribute("aria-label", message);
    }
  };

  if (!mounted) {
    return <div className="w-9 h-9" />; // Prevents layout shift
  }

  // Apple-style spring physics
  const springTransition = {
    type: "spring",
    stiffness: 700,
    damping: 30,
    mass: 0.5,
  };

  return (
    <motion.button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden",
        "backdrop-blur-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1",
        isDark
          ? "bg-gray-800/90 border border-white/5"
          : "bg-white/90 border border-black/5"
      )}
      whileTap={{ scale: 0.92 }}
      transition={springTransition}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      role="switch"
      aria-checked={isDark}
    >
      {/* 3D icon container with rotation */}
      <motion.div
        initial={false}
        animate={{
          rotateZ: isDark ? 180 : 0,
          scale: 1,
        }}
        transition={{
          ...springTransition,
          duration: 0.5,
        }}
        style={{
          willChange: "transform",
          transformStyle: "preserve-3d",
          zIndex: 2,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isDark ? "moon" : "sun"}
            initial={{
              opacity: 0,
              y: isDark ? -20 : 20,
              rotateX: isDark ? -80 : 80,
            }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{
              opacity: 0,
              y: isDark ? 20 : -20,
              rotateX: isDark ? 80 : -80,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <MoonIcon
                size={16}
                className="text-blue-300"
                style={{
                  filter: "drop-shadow(0 0 2px rgba(147, 197, 253, 0.5))",
                }}
                aria-hidden="true"
              />
            ) : (
              <SunIcon
                size={16}
                className="text-amber-400"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(251, 191, 36, 0.6))",
                }}
                aria-hidden="true"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Glass overlay for depth */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

      {/* Breathing glow effect - only rendered if not reduced motion */}
      {!isReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-full opacity-0"
          animate={{
            opacity: [0, 0.2, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          style={{
            background: isDark
              ? "radial-gradient(circle at center, rgba(147, 197, 253, 0.3) 0%, transparent 70%)"
              : "radial-gradient(circle at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
            willChange: "opacity, transform",
          }}
        />
      )}

      {/* Top highlight for realistic lighting */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-full" />
    </motion.button>
  );
}
