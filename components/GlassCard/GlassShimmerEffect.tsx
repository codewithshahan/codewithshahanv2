"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassShimmerEffectProps {
  rotateX: number;
  rotateY: number;
  isHovered: boolean;
  isAutoAnimating: boolean;
  isInteracting: boolean;
}

const GlassShimmerEffect: React.FC<GlassShimmerEffectProps> = ({
  rotateX,
  rotateY,
  isHovered,
  isAutoAnimating,
  isInteracting,
}) => {
  if (isInteracting) {
    return null;
  }

  // Only show shimmer effects when card is not hovered or during auto-animation
  const shouldShowShimmer = !isHovered || isAutoAnimating;

  return (
    <>
      {shouldShowShimmer && (
        <>
          {/* Primary gentle shimmer */}
          <motion.div
            className="absolute top-0 left-[-100%] h-full w-[60%] bg-gradient-to-r from-transparent via-indigo-100/[.06] to-transparent skew-x-[-20deg]"
            animate={{
              left: ["-100%", "200%"],
            }}
            transition={{
              duration: isAutoAnimating ? 2.5 : 3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: isAutoAnimating ? 7 : 17,
            }}
            style={{
              filter: `blur(${12 + Math.abs(rotateX) * 0.5}px)`,
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${
                rotateX * 0.1
              }deg) rotateY(${rotateY * 0.2}deg)`,
              opacity: 0.7 + Math.abs(rotateY) * 0.01,
            }}
          />

          {/* Secondary subtle shimmer */}
          <motion.div
            className="absolute top-0 left-[-100%] h-full w-[20%] bg-gradient-to-r from-transparent via-white/[.04] to-transparent skew-x-[-15deg]"
            animate={{
              left: ["-100%", "200%"],
            }}
            transition={{
              duration: isAutoAnimating ? 2 : 2.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: isAutoAnimating ? 7.5 : 17.5,
              delay: 0.5,
            }}
            style={{
              filter: `blur(${8 + Math.abs(rotateY) * 0.3}px)`,
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${
                rotateX * 0.05
              }deg) rotateY(${rotateY * 0.1}deg)`,
              opacity: 0.6 + Math.abs(rotateX) * 0.01,
            }}
          />
        </>
      )}
    </>
  );
};

export default GlassShimmerEffect;
