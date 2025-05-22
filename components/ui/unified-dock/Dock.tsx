"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDock } from "./DockContext";
import { cn } from "@/lib/utils";

/**
 * Dock props interface
 */
interface DockProps {
  /** Dock children (typically DockItem and DockDivider components) */
  children: React.ReactNode;

  /** Custom class name */
  className?: string;

  /** Background color/style (overrides default) */
  background?: string;

  /** Custom padding */
  padding?: string;

  /** Custom position override */
  position?: "bottom" | "top" | "left" | "right";

  /** Whether the dock should auto-hide */
  autoHide?: boolean;

  /** Delay before showing dock (ms) */
  autoShowDelay?: number;

  /** Custom border radius */
  borderRadius?: string;

  /** Enable/disable backdrop blur */
  blurBackground?: boolean;

  /** Add a border */
  bordered?: boolean;

  /** Shadow style */
  shadow?: "none" | "sm" | "md" | "lg" | "xl";

  /** Initial animation */
  initialAnimation?: "fade" | "slide" | "scale" | "none";

  /** Accessibility description */
  ariaLabel?: string;

  /** Semantic HTML element to use */
  semanticElement?: "nav" | "div" | "aside" | "footer";
}

/**
 * Dock component - MacOS-style dock with magnification effect
 */
const Dock: React.FC<DockProps> = ({
  children,
  className,
  background,
  padding = "px-2 py-2",
  position: positionProp,
  autoHide = false,
  autoShowDelay = 300,
  borderRadius = "rounded-2xl",
  blurBackground = true,
  bordered = false,
  shadow = "lg",
  initialAnimation = "scale",
  ariaLabel = "Application Dock",
  semanticElement = "div",
}) => {
  // Get context
  const {
    position: contextPosition,
    dockSize,
    dockRef,
    magnificationEnabled,
    enableEffects,
    isDark,
  } = useDock();

  // State for auto-hide behavior
  const [isVisible, setIsVisible] = useState(!autoHide);
  const [isInitiallyRendered, setIsInitiallyRendered] = useState(false);

  // Timeout ref for auto-hide delay
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use position from props if provided, otherwise use context
  const position = positionProp || contextPosition;

  // Set position in context if provided in props
  useEffect(() => {
    if (positionProp && positionProp !== contextPosition) {
      // Just update local position instead
      // setPosition(positionProp); - Remove this as it's not in the context
    }
  }, [positionProp, contextPosition]);

  // Track if the dock is horizontal or vertical
  const isHorizontal = position === "bottom" || position === "top";

  // Handle mouse enter/leave for auto-hide
  const handleMouseEnter = () => {
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
      autoHideTimeoutRef.current = null;
    }

    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (autoHide) {
      autoHideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, autoShowDelay);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  // Initial render animation
  useEffect(() => {
    // Small delay for initial render animation
    const timer = setTimeout(() => {
      setIsInitiallyRendered(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Calculate shadow class based on prop
  const shadowClass = (() => {
    switch (shadow) {
      case "none":
        return "";
      case "sm":
        return "shadow-sm";
      case "md":
        return "shadow-md";
      case "lg":
        return "shadow-lg";
      case "xl":
        return "shadow-xl";
      default:
        return "shadow-lg";
    }
  })();

  // Determine position classes
  const positionClasses = (() => {
    switch (position) {
      case "bottom":
        return "bottom-3 left-1/2 -translate-x-1/2";
      case "top":
        return "top-3 left-1/2 -translate-x-1/2";
      case "left":
        return "left-3 top-1/2 -translate-y-1/2";
      case "right":
        return "right-3 top-1/2 -translate-y-1/2";
      default:
        return "bottom-3 left-1/2 -translate-x-1/2";
    }
  })();

  // Initial animation variants based on position
  const initialAnimVariants = (() => {
    if (initialAnimation === "none") {
      return {};
    }

    // Base animation for different types
    const animations = {
      fade: { opacity: 0 },
      scale: { opacity: 0, scale: 0.8 },
      slide: {
        opacity: 0,
        y: position === "top" ? -20 : position === "bottom" ? 20 : 0,
        x: position === "left" ? -20 : position === "right" ? 20 : 0,
      },
    };

    return animations[initialAnimation];
  })();

  // Background style with blur effect
  const backgroundStyle =
    background || (isDark ? "bg-zinc-900/50" : "bg-white/50");

  // Blur class based on prop
  const blurClass = blurBackground ? "backdrop-blur-xl" : "";

  // Border class based on prop
  const borderClass = bordered
    ? isDark
      ? "border border-zinc-700/50"
      : "border border-zinc-200/50"
    : "";

  // Render the appropriate semantic element
  const renderDock = () => {
    const dockContent = (
      <div
        className={cn(
          "flex overflow-hidden",
          isHorizontal ? "flex-row" : "flex-col",
          padding,
          backgroundStyle,
          shadowClass,
          borderRadius,
          blurClass,
          borderClass
        )}
      >
        {children}
      </div>
    );

    // Common props for motion components
    const motionProps = {
      ref: dockRef,
      role: semanticElement === "nav" ? "navigation" : undefined,
      "aria-label": ariaLabel,
      className: cn("fixed z-50", positionClasses, className),
      initial: isInitiallyRendered ? initialAnimVariants : false,
      animate: {
        opacity: 1,
        scale: 1,
        x: position === "left" ? -20 : position === "right" ? 20 : "-50%",
        y: position === "top" ? -20 : position === "bottom" ? 20 : "-50%",
      },
      exit: autoHide ? { opacity: 0, scale: 0.9 } : undefined,
      transition: { type: "spring", stiffness: 300, damping: 25 },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    // Render the appropriate semantic element
    switch (semanticElement) {
      case "nav":
        return <motion.nav {...motionProps}>{dockContent}</motion.nav>;
      case "aside":
        return <motion.aside {...motionProps}>{dockContent}</motion.aside>;
      case "footer":
        return <motion.footer {...motionProps}>{dockContent}</motion.footer>;
      default:
        return <motion.div {...motionProps}>{dockContent}</motion.div>;
    }
  };

  return (
    <AnimatePresence>
      {(isVisible || !autoHide) && renderDock()}
    </AnimatePresence>
  );
};

export default Dock;
