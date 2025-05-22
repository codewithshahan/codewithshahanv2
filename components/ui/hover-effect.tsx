"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface HoverEffectProps {
  children: React.ReactNode;
  className?: string;
  type?: "scale" | "glow" | "lift" | "tilt" | "highlight" | "border" | "all";
  intensity?: "subtle" | "medium" | "strong";
  color?: string;
  disabled?: boolean;
  onClick?: () => void;
  animateOnClick?: boolean;
  variant?: "gloss" | "flat" | "glass" | "text" | "highlight";
  rounded?: boolean;
}

export default function HoverEffect({
  children,
  className,
  type = "scale",
  intensity = "medium",
  color,
  disabled = false,
  onClick,
  animateOnClick = true,
  variant = "flat",
  rounded = true,
}: HoverEffectProps) {
  const [isHovering, setIsHovering] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const ref = useRef<HTMLDivElement>(null);

  // Calculate intensity values based on preference
  const getScaleValue = () => {
    if (type !== "scale" && type !== "all") return 1;
    const scaleMap = {
      subtle: 1.02,
      medium: 1.05,
      strong: 1.1,
    };
    return scaleMap[intensity];
  };

  const getLiftValue = () => {
    if (type !== "lift" && type !== "all") return 0;
    const liftMap = {
      subtle: -2,
      medium: -5,
      strong: -10,
    };
    return liftMap[intensity];
  };

  const getGlowColor = () => {
    if (color) return color;
    return isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)";
  };

  const getGlowOpacity = () => {
    if (type !== "glow" && type !== "all") return 0;
    const opacityMap = {
      subtle: 0.3,
      medium: 0.6,
      strong: 0.9,
    };
    return opacityMap[intensity];
  };

  const getTiltIntensity = () => {
    if (type !== "tilt" && type !== "all") return 0;
    const tiltMap = {
      subtle: 2,
      medium: 5,
      strong: 10,
    };
    return tiltMap[intensity];
  };

  const getBorderColor = () => {
    if (color) return color;
    return isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
  };

  const getBorderOpacity = () => {
    if (type !== "border" && type !== "all") return 0;
    const opacityMap = {
      subtle: 0.2,
      medium: 0.3,
      strong: 0.5,
    };
    return opacityMap[intensity];
  };

  const getHighlightOpacity = () => {
    if (type !== "highlight" && type !== "all") return 0;
    const opacityMap = {
      subtle: 0.03,
      medium: 0.07,
      strong: 0.12,
    };
    return opacityMap[intensity];
  };

  // Compute variant-specific styles
  const getVariantClasses = () => {
    if (variant === "glass") {
      return cn(
        "backdrop-blur-md",
        isDark ? "bg-white/5" : "bg-black/5",
        rounded && "rounded-xl",
        "border",
        isDark ? "border-white/10" : "border-black/10"
      );
    }

    if (variant === "gloss") {
      return cn(
        "before:absolute before:inset-0 before:z-0 before:opacity-0 hover:before:opacity-20",
        "before:bg-gradient-to-b",
        isDark
          ? "before:from-white/10 before:to-transparent"
          : "before:from-white/80 before:to-white/40",
        "before:transition-opacity before:duration-300",
        rounded && "rounded-xl before:rounded-xl"
      );
    }

    if (variant === "text") {
      return "relative overflow-visible";
    }

    if (variant === "highlight") {
      return cn(
        rounded && "rounded-xl",
        "transition-colors duration-300",
        isDark ? "bg-white/0 hover:bg-white/5" : "bg-black/0 hover:bg-black/5"
      );
    }

    return cn(rounded && "rounded-xl");
  };

  // Define animation variants
  const containerVariants = {
    initial: {
      scale: 1,
      y: 0,
      boxShadow: `0 0 0 0px ${getGlowColor()}`,
      borderColor: "rgba(0,0,0,0)",
    },
    hover: {
      scale: getScaleValue(),
      y: getLiftValue(),
      boxShadow: `0 0 ${
        intensity === "strong" ? 25 : intensity === "medium" ? 15 : 10
      }px ${getGlowOpacity()}px ${getGlowColor()}`,
      borderColor: `rgba(${getBorderColor()}, ${getBorderOpacity()})`,
    },
    tap: animateOnClick
      ? {
          scale: 0.98,
          boxShadow: `0 0 0 0px ${getGlowColor()}`,
        }
      : {},
  };

  // Mouse tracking for tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((type !== "tilt" && type !== "all") || !ref.current) return;

    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate rotation values
    const xPercent = x / rect.width;
    const yPercent = y / rect.height;
    const rotateX = (0.5 - yPercent) * getTiltIntensity();
    const rotateY = (xPercent - 0.5) * getTiltIntensity();

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (ref.current) {
      ref.current.style.transform = "";
    }
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative transition-all duration-300 ease-out",
        getVariantClasses(),
        className
      )}
      initial="initial"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled || !onClick ? undefined : "tap"}
      variants={containerVariants}
      onMouseEnter={() => setIsHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: onClick && !disabled ? "pointer" : "default",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </motion.div>
  );
}

// Preset components for common use cases
export function ScaleOnHover({
  children,
  className,
  ...props
}: Omit<HoverEffectProps, "type">) {
  return (
    <HoverEffect className={className} type="scale" {...props}>
      {children}
    </HoverEffect>
  );
}

export function GlowOnHover({
  children,
  className,
  ...props
}: Omit<HoverEffectProps, "type">) {
  return (
    <HoverEffect className={className} type="glow" {...props}>
      {children}
    </HoverEffect>
  );
}

export function TiltOnHover({
  children,
  className,
  ...props
}: Omit<HoverEffectProps, "type">) {
  return (
    <HoverEffect className={className} type="tilt" {...props}>
      {children}
    </HoverEffect>
  );
}

export function PremiumCard({
  children,
  className,
  ...props
}: Omit<HoverEffectProps, "type" | "variant">) {
  return (
    <HoverEffect
      className={cn("p-4", className)}
      type="all"
      variant="glass"
      intensity="medium"
      {...props}
    >
      {children}
    </HoverEffect>
  );
}

export function ClickableButton({
  children,
  className,
  ...props
}: Omit<HoverEffectProps, "type" | "animateOnClick" | "variant">) {
  return (
    <HoverEffect
      className={cn("px-4 py-2 text-center", className)}
      type="all"
      variant="glass"
      animateOnClick={true}
      {...props}
    >
      {children}
    </HoverEffect>
  );
}
