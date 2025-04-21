"use client";

import React, { ReactNode, CSSProperties } from "react";
import { useGlassEffect } from "./GlassEffectProvider";

interface GlassCardContentProps {
  children: ReactNode;
  rotateX: number;
  rotateY: number;
  scale: number;
  isInteracting: boolean;
}

const GlassCardContent: React.FC<GlassCardContentProps> = ({
  children,
  rotateX,
  rotateY,
  scale,
  isInteracting,
}) => {
  // Get textOptimizationLevel from context
  const { textOptimizationLevel } = useGlassEffect();

  // Counter-rotation to completely neutralize parent rotations
  // This is key to keeping text sharp - we completely counteract the rotation
  const counterRotateX = -rotateX;
  const counterRotateY = -rotateY;
  const counterScale = scale !== 0 ? 1 / scale : 1;

  // Apply different styles based on optimization level
  const getOptimizationStyles = (): CSSProperties => {
    switch (textOptimizationLevel) {
      case "maximum":
        return {
          // Maximum text clarity but minimal animation effect
          transform: "none",
          transformStyle: "flat" as const,
          backfaceVisibility: "hidden" as const,
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased" as const,
          MozOsxFontSmoothing: "grayscale" as const,
          textRendering: "optimizeLegibility" as const,
          filter: "none",
          contain: "content",
        };
      case "high":
        return {
          // Balance between text clarity and animation effect
          transform: isInteracting ? "none" : `translateZ(4px)`,
          transformStyle: "flat" as const,
          backfaceVisibility: "hidden" as const,
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased" as const,
          MozOsxFontSmoothing: "grayscale" as const,
          willChange: "transform",
          WebkitTransform: "translateZ(0)",
          contain: "content",
        };
      default: // "standard"
        return {
          // Standard optimization
          transform: isInteracting
            ? "none"
            : `perspective(1000px) translateZ(${
                Math.abs(rotateX) * 0.15 + Math.abs(rotateY) * 0.15 + 4
              }px)`,
          transformStyle: "preserve-3d" as const,
          backfaceVisibility: "hidden" as const,
          WebkitBackfaceVisibility: "hidden",
          willChange: "transform",
        };
    }
  };

  // Apply different inner styles based on optimization level
  const getInnerOptimizationStyles = (): CSSProperties => {
    switch (textOptimizationLevel) {
      case "maximum":
        return {
          // Maximum text clarity with no counter-rotation
          transform: "none",
          textRendering: "optimizeLegibility" as const,
          WebkitFontSmoothing: "antialiased" as const,
          MozOsxFontSmoothing: "grayscale" as const,
        };
      case "high":
        return {
          // Balance with partial counter-rotation
          transform: isInteracting
            ? "none"
            : `rotateX(${counterRotateX / 2}deg) rotateY(${
                counterRotateY / 2
              }deg) scale(${counterScale === 1 ? 1 : (counterScale + 1) / 2})`,
          transformOrigin: "center center",
          backfaceVisibility: "hidden" as const,
          WebkitBackfaceVisibility: "hidden",
          textRendering: "optimizeLegibility" as const,
          WebkitFontSmoothing: "antialiased" as const,
          MozOsxFontSmoothing: "grayscale" as const,
          transformStyle: "flat" as const,
        };
      default: // "standard"
        return {
          // Standard with full counter-rotation
          transform: isInteracting
            ? "none"
            : `rotateX(${counterRotateX}deg) rotateY(${counterRotateY}deg) scale(${counterScale})`,
          transformOrigin: "center center",
          backfaceVisibility: "hidden" as const,
          WebkitBackfaceVisibility: "hidden",
          textRendering: "optimizeLegibility" as const,
          WebkitFontSmoothing: "antialiased" as const,
          MozOsxFontSmoothing: "grayscale" as const,
        };
    }
  };

  return (
    <div className="relative z-20" style={getOptimizationStyles()}>
      {/* Content container with counter-rotation based on optimization level */}
      <div style={getInnerOptimizationStyles()}>{children}</div>
    </div>
  );
};

export default GlassCardContent;
