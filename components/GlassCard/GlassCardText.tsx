"use client";

import React, { ReactNode } from "react";

interface GlassCardTextProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * GlassCardText ensures text remains crisp during animations inside GlassCard
 * by applying specialized rendering optimizations specific to text content.
 */
const GlassCardText: React.FC<GlassCardTextProps> = ({
  children,
  className = "",
  as: Component = "div",
}) => {
  return (
    <Component
      className={`glass-card-text ${className}`}
      style={{
        // Ensure text is rendered at exact pixel boundaries
        transform: "translateZ(0)",
        // Force subpixel antialiasing rendering for text
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        // Position in a new stacking context for better rendering
        position: "relative",
        // Prevent text from becoming blurry during animations
        willChange: "contents",
        // Prevent scaling issues with transform
        backfaceVisibility: "hidden",
        // Apply containment for performance optimization
        contain: "content",
        // Set explicit padding to avoid subpixel artifacts at edges
        padding: "0.1px",
        // Set specific line height to avoid rounding issues
        lineHeight: "1.5",
        // Additional fixes for text sharpness
        filter: "none",
        WebkitFilter: "none",
      }}
    >
      {children}
    </Component>
  );
};

export default GlassCardText;
