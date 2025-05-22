"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { motion, useSpring, AnimatePresence, MotionStyle } from "framer-motion";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Core dock position types
 */
export type DockPosition = "bottom" | "top" | "left" | "right";

/**
 * Common props for all dock components
 */
export interface DockCoreProps {
  /** Children to render inside the dock */
  children: ReactNode;

  /** Position of the dock on the screen */
  position?: DockPosition;

  /** Whether the dock should auto-hide after inactivity */
  autoHide?: boolean;

  /** Delay in ms before auto-hiding (if autoHide is true) */
  autoHideDelay?: number;

  /** Custom class names for the dock container */
  className?: string;

  /** Custom styling for the dock */
  style?: React.CSSProperties;

  /** Whether to use 3D effects and animations (false for users with reduced motion preferences) */
  enableEffects?: boolean;

  /** Z-index for the dock */
  zIndex?: number;

  /** Handler for mouse movement over the dock */
  onMouseMove?: (e: React.MouseEvent) => void;
}

/**
 * DockCore Component
 *
 * A foundation component for creating macOS-style docks with consistent
 * animation, positioning, and behaviors.
 */
export const DockCore: React.FC<DockCoreProps> = ({
  children,
  position = "bottom",
  autoHide = false,
  autoHideDelay = 3000,
  className = "",
  style = {},
  enableEffects = true,
  zIndex = 50,
  onMouseMove,
}) => {
  // Theme and responsive hooks
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const shouldReduceMotion = isReducedMotion || !enableEffects;

  // Component state
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Refs for tracking activity and timeouts
  const dockRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation springs with natural physics
  const dockYSpring = useSpring(0, {
    stiffness: 300,
    damping: 30,
    mass: 1,
  });

  const dockScaleSpring = useSpring(1, {
    stiffness: 400,
    damping: 25,
  });

  // Handle component mount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  // Handle auto-hide behavior
  useEffect(() => {
    if (!autoHide || shouldReduceMotion) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      setIsVisible(true);

      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }

      autoHideTimeoutRef.current = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivityRef.current;
        if (inactiveTime >= autoHideDelay) {
          setIsVisible(false);
        }
      }, autoHideDelay);
    };

    // Set up event listeners to track user activity
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    // Initialize auto-hide
    handleActivity();

    // Cleanup listeners
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);

      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [autoHide, autoHideDelay, shouldReduceMotion]);

  // Handle dock hover start
  const handleDockHoverStart = useCallback(() => {
    if (shouldReduceMotion) return;
    dockYSpring.set(position === "bottom" ? -5 : position === "top" ? 5 : 0);
    dockScaleSpring.set(1.02);
  }, [dockYSpring, dockScaleSpring, position, shouldReduceMotion]);

  // Handle dock hover end
  const handleDockHoverEnd = useCallback(() => {
    if (shouldReduceMotion) return;
    dockYSpring.set(0);
    dockScaleSpring.set(1);
  }, [dockYSpring, dockScaleSpring, shouldReduceMotion]);

  // Get dock position styles
  const getDockPositionStyles = (): MotionStyle => {
    const baseStyles: MotionStyle = {
      position: "fixed",
      zIndex,
      background: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.6)",
      backdropFilter: "blur(8px)",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(0, 0, 0, 0.1)",
      boxShadow: isDark
        ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
        : "0 10px 30px -10px rgba(0, 0, 0, 0.25)",
      padding: "12px",
      transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? "auto" : "none",
    };

    // Position-specific styles
    if (position === "bottom") {
      return {
        ...baseStyles,
        left: "50%",
        bottom: isVisible ? "20px" : "0px",
        transform: "translateX(-50%)",
        borderRadius: "12px",
        flexDirection: "row",
      };
    } else if (position === "top") {
      return {
        ...baseStyles,
        left: "50%",
        top: isVisible ? "20px" : "0px",
        transform: "translateX(-50%)",
        borderRadius: "12px",
        flexDirection: "row",
      };
    } else if (position === "left") {
      return {
        ...baseStyles,
        left: isVisible ? "20px" : "0px",
        top: "50%",
        transform: "translateY(-50%)",
        borderRadius: "12px",
        flexDirection: "column",
      };
    } else if (position === "right") {
      return {
        ...baseStyles,
        right: isVisible ? "20px" : "0px",
        top: "50%",
        transform: "translateY(-50%)",
        borderRadius: "12px",
        flexDirection: "column",
      };
    }

    return baseStyles;
  };

  // Don't render until component is mounted (prevent hydration issues)
  if (!isMounted) return null;

  return (
    <motion.div
      ref={dockRef}
      className={cn("flex items-center justify-center", className)}
      style={{
        ...getDockPositionStyles(),
        ...style,
        y: dockYSpring,
        scale: dockScaleSpring,
      }}
      onMouseEnter={handleDockHoverStart}
      onMouseLeave={handleDockHoverEnd}
      onMouseMove={onMouseMove}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 25,
      }}
    >
      {/* Frosted glass effect overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/10 to-white/5 pointer-events-none" />

      {/* Container for children */}
      <div
        className={cn(
          "relative flex",
          position === "left" || position === "right" ? "flex-col" : "flex-row",
          "items-center gap-2"
        )}
      >
        {children}
      </div>

      {/* Subtle shelf reflection */}
      <div className="absolute left-5 right-5 h-[1px] bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Dock 3D effects */}
      <div className="absolute inset-x-0 h-1/2 bottom-0 bg-gradient-to-t from-black/5 to-transparent rounded-b-xl pointer-events-none" />
      <div className="absolute inset-x-0 h-1/3 top-0 bg-gradient-to-b from-white/10 to-transparent rounded-t-xl pointer-events-none" />
    </motion.div>
  );
};

export default DockCore;
