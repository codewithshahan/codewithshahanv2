"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

interface ScrollbarProps {
  className?: string;
}

const Scrollbar = ({ className = "" }: ScrollbarProps) => {
  const { scrollYProgress } = useScroll();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Smooth spring animation for the scrollbar
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform progress to height and opacity
  const height = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // Enhanced hover effect with spring animation
  const scale = useSpring(1, {
    stiffness: 500,
    damping: 30,
  });

  useEffect(() => {
    if (isHovered || isDragging) {
      scale.set(1.2);
    } else {
      scale.set(1);
    }
  }, [isHovered, isDragging, scale]);

  // Handle drag events
  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.style.cursor = "default";
  };

  return (
    <motion.div
      className={`fixed right-0 top-0 w-1.5 h-full z-50 pointer-events-none ${className}`}
      style={{
        opacity: isHovered || isDragging ? 1 : 0.5,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Track */}
      <div
        className={`absolute inset-0 rounded-full ${
          isDark ? "bg-white/10" : "bg-black/5"
        }`}
      />

      {/* Thumb */}
      <motion.div
        className={`absolute right-0 w-full rounded-full ${
          isDark
            ? "bg-white/30 hover:bg-white/40"
            : "bg-black/20 hover:bg-black/30"
        } backdrop-blur-sm`}
        style={{
          height,
          opacity,
          scale,
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: isDark
              ? "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)"
              : "radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 70%)",
            opacity: isHovered || isDragging ? 0.5 : 0,
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0))"
              : "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0))",
            opacity: isHovered || isDragging ? 0.5 : 0,
          }}
          animate={{
            y: ["0%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </motion.div>

      {/* Scroll progress indicator */}
      <motion.div
        className={`absolute top-0 right-0 w-1 h-1 rounded-full ${
          isDark ? "bg-white/50" : "bg-black/30"
        }`}
        style={{
          y: useTransform(smoothProgress, [0, 1], [0, window.innerHeight]),
        }}
      />
    </motion.div>
  );
};

export default Scrollbar;
