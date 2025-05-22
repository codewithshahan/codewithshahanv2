"use client";

import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Interface for the DockPreview component
 */
export interface DockPreviewProps {
  /** Whether the preview should be visible */
  isVisible: boolean;

  /** Title for the preview window */
  title: string;

  /** Primary color accent for the window */
  color?: string;

  /** Content to render inside the preview */
  children: ReactNode;

  /** Position of the preview window relative to the dock item */
  position?: "top" | "bottom" | "left" | "right";

  /** X position on screen (if custom positioning is needed) */
  x?: number;

  /** Y position on screen (if custom positioning is needed) */
  y?: number;

  /** Width of the preview window */
  width?: number;

  /** Maximum height of the preview window */
  maxHeight?: number;

  /** Offset from the dock item */
  offset?: number;

  /** Footer component to render at the bottom of the preview */
  footer?: ReactNode;

  /** Whether to show window control buttons */
  showControls?: boolean;

  /** Custom CSS class */
  className?: string;
}

/**
 * DockPreview Component
 *
 * A floating preview window for dock items that mimics macOS application previews
 */
export const DockPreview: React.FC<DockPreviewProps> = ({
  isVisible,
  title,
  color = "#007AFF",
  children,
  position = "bottom",
  x,
  y,
  width = 350,
  maxHeight = 400,
  offset = 14,
  footer,
  showControls = true,
  className,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Calculate preview position based on dock position
  const getPreviewStyle = () => {
    const baseStyle = {
      width: width,
      maxHeight: maxHeight,
    };

    // If custom positioning is provided, use that
    if (x !== undefined && y !== undefined) {
      return {
        ...baseStyle,
        position: "fixed" as const,
        left: x,
        top: y,
      };
    }

    // Otherwise position relative to the dock's position
    switch (position) {
      case "top":
        return {
          ...baseStyle,
          position: "absolute" as const,
          bottom: `calc(100% + ${offset}px)`,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          ...baseStyle,
          position: "absolute" as const,
          top: `calc(100% + ${offset}px)`,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          ...baseStyle,
          position: "absolute" as const,
          right: `calc(100% + ${offset}px)`,
          top: "50%",
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          ...baseStyle,
          position: "absolute" as const,
          left: `calc(100% + ${offset}px)`,
          top: "50%",
          transform: "translateY(-50%)",
        };
      default:
        return baseStyle;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "rounded-xl overflow-hidden z-50",
            isDark
              ? "bg-gray-900/80 border border-gray-800/80 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
              : "bg-white/85 border border-gray-300/30 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.5)]",
            className
          )}
          style={getPreviewStyle()}
          initial={{
            opacity: 0,
            scale: 0.95,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: position === "top" ? 10 : position === "bottom" ? -10 : 0,
            x: position === "left" ? 10 : position === "right" ? -10 : 0,
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            damping: 25,
            stiffness: 300,
          }}
        >
          {/* Frosted glass effect overlay */}
          <div className="absolute inset-0 backdrop-blur-xl pointer-events-none" />

          {/* Window title bar */}
          <div
            className="relative p-3 border-b flex items-center justify-between"
            style={{
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
              background: `linear-gradient(to right, ${color}30, ${color}10)`,
            }}
          >
            {/* Window controls */}
            {showControls && (
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500 hover:brightness-110 transition-all" />
                <div className="w-3 h-3 rounded-full bg-yellow-500 hover:brightness-110 transition-all" />
                <div className="w-3 h-3 rounded-full bg-green-500 hover:brightness-110 transition-all" />
              </div>
            )}

            {/* Window title */}
            <h3
              className={cn(
                "flex-1 text-center text-sm font-medium",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              {title}
            </h3>

            {/* Color dot (if no window controls) */}
            {!showControls && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
          </div>

          {/* Content area */}
          <div className="relative max-h-[400px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-500/30 scrollbar-track-gray-300/10">
            {children}
          </div>

          {/* Footer (if provided) */}
          {footer && (
            <div
              className="border-t py-2 px-3"
              style={{
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "rgba(0, 0, 0, 0.1)",
              }}
            >
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DockPreview;
