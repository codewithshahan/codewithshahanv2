"use client";

import React from "react";
import { motion } from "framer-motion";
import { useDock } from "./DockContext";
import { cn } from "@/lib/utils";

/**
 * DockDivider props interface
 */
interface DockDividerProps {
  /** Custom class name */
  className?: string;

  /** Divider color */
  color?: string;

  /** Divider thickness */
  thickness?: number;

  /** Divider length as a percentage (0-100) */
  length?: number;

  /** Animation delay for entrance animation */
  animationDelay?: number;
}

/**
 * DockDivider component - Visual separator for items in the dock
 */
const DockDivider: React.FC<DockDividerProps> = ({
  className,
  color,
  thickness = 1,
  length = 50,
  animationDelay = 0,
}) => {
  // Get context
  const { position, dockSize, enableEffects, isDark } = useDock();

  // Calculate if this is a horizontal or vertical dock
  const isHorizontal = position === "bottom" || position === "top";

  // Calculate divider styles based on position
  const dividerStyles = (): React.CSSProperties => {
    // Base styles
    const baseStyle: React.CSSProperties = {
      backgroundColor:
        color || (isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)"),
    };

    // Position-specific styles
    if (isHorizontal) {
      return {
        ...baseStyle,
        width: thickness,
        height: `${length}%`,
        margin: `0 ${dockSize * 0.25}px`,
      };
    } else {
      return {
        ...baseStyle,
        height: thickness,
        width: `${length}%`,
        margin: `${dockSize * 0.25}px 0`,
      };
    }
  };

  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      style={{
        width: isHorizontal ? "auto" : dockSize,
        height: isHorizontal ? dockSize : "auto",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.3,
        delay: animationDelay,
      }}
    >
      <div className="rounded-full" style={dividerStyles()} />
    </motion.div>
  );
};

export default DockDivider;
