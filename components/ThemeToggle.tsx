"use client";

import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const ThemeToggle: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDark = resolvedTheme === "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme toggle with haptic feedback if available
  const toggleTheme = () => {
    // Optional haptic feedback (if supported)
    if (window.navigator && "vibrate" in window.navigator) {
      window.navigator.vibrate(3);
    }

    // Toggle theme with visual feedback
    const currentTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(currentTheme);

    // Announce to screen readers
    const message = `Theme changed to ${currentTheme} mode`;
    if (buttonRef.current) {
      buttonRef.current.setAttribute("aria-label", message);
    }
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 flex items-center justify-center opacity-0">
        <SunIcon size={18} />
      </div>
    );
  }

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
        "relative w-full h-full rounded-lg flex items-center justify-center overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
      whileTap={{ scale: 0.9 }}
      transition={springTransition}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      role="switch"
      aria-checked={isDark}
    >
      {/* Animated icon container */}
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
                size={18}
                className="text-blue-300"
                style={{
                  filter: "drop-shadow(0 0 2px rgba(147, 197, 253, 0.5))",
                }}
                aria-hidden="true"
              />
            ) : (
              <SunIcon
                size={18}
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

      {/* Glass overlay */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

      {/* Glow effect - only rendered if not reduced motion */}
      {!isReducedMotion && (
        <motion.div
          className="absolute inset-0 rounded-lg opacity-0"
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

      {/* Reflection highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-lg" />
    </motion.button>
  );
};

export default ThemeToggle;
