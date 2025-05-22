"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glassEffect?: boolean;
  hoverEffect?: "tilt" | "scale" | "glow" | "none";
  borderEffect?: boolean;
  animateOnScroll?: boolean;
}

export function AnimatedContainer({
  children,
  className,
  glassEffect = false,
  hoverEffect = "tilt",
  borderEffect = false,
  animateOnScroll = false,
  ...props
}: AnimatedContainerProps) {
  // Mouse position for hover animations
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Reference to the container element
  const containerRef = useRef<HTMLDivElement>(null);

  // Used for glow effect positioning
  const [hovered, setHovered] = useState(false);

  // Smooth springs for tilt effect
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [5, -5]), {
    stiffness: 150,
    damping: 20,
  });

  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-5, 5]), {
    stiffness: 150,
    damping: 20,
  });

  // Handle mouse move for tilt and glow effects
  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current || hoverEffect === "none") return;

    const rect = containerRef.current.getBoundingClientRect();

    // Calculate mouse position relative to container (0-1)
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  // Scroll animation variants
  const scrollVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Hover animation variants
  const hoverVariants = {
    scale: {
      rest: { scale: 1 },
      hover: {
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      },
    },
    border: {
      rest: { borderColor: "rgba(255, 255, 255, 0.1)" },
      hover: {
        borderColor: "rgba(255, 255, 255, 0.3)",
        transition: { duration: 0.3 },
      },
    },
  };

  // Determine which variants to use based on the hoverEffect
  const activeVariants =
    hoverEffect === "scale" ? hoverVariants.scale : undefined;

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        glassEffect &&
          "backdrop-blur-md border border-white/10 bg-white/5 dark:bg-black/5",
        borderEffect && "border border-white/10 dark:border-white/5",
        className
      )}
      initial={animateOnScroll ? "hidden" : "visible"}
      whileInView={animateOnScroll ? "visible" : undefined}
      viewport={animateOnScroll ? { once: true, margin: "-10%" } : undefined}
      variants={animateOnScroll ? scrollVariants : activeVariants}
      animate={
        hoverEffect === "scale" ? (hovered ? "hover" : "rest") : undefined
      }
      style={
        hoverEffect === "tilt"
          ? {
              rotateX: rotateX,
              rotateY: rotateY,
              transformStyle: "preserve-3d",
              perspective: 1000,
            }
          : undefined
      }
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
      {...props}
    >
      {/* Border animation */}
      {borderEffect && (
        <motion.div
          className="absolute inset-0 rounded-2xl border border-white/10 dark:border-white/5"
          variants={hoverVariants.border}
          animate={hovered ? "hover" : "rest"}
        />
      )}

      {/* Glow effect */}
      {hoverEffect === "glow" && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition duration-300"
          style={{
            background: `radial-gradient(circle at ${mouseX.get() * 100}% ${
              mouseY.get() * 100
            }%, rgba(255, 255, 255, 0.15), transparent 40%)`,
          }}
          animate={{ opacity: hovered ? 1 : 0 }}
        />
      )}

      {/* Content - respect 3D transform */}
      <div
        className={cn(
          "relative z-10 h-full w-full",
          hoverEffect === "tilt" && "transform-style-preserve-3d"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
