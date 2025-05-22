"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  blur?: "none" | "subtle" | "medium" | "heavy";
  opacity?: "none" | "subtle" | "medium" | "heavy";
  border?: boolean;
  borderColor?: string;
  hoverEffect?: boolean;
  clickEffect?: boolean;
  darkMode?: boolean;
  lightMode?: boolean;
  animate?: boolean;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

export function GlassPanel({
  children,
  className,
  blur = "medium",
  opacity = "medium",
  border = true,
  borderColor,
  hoverEffect = false,
  clickEffect = false,
  darkMode = true,
  lightMode = true,
  animate = false,
  rounded = "lg",
}: GlassPanelProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Only render for appropriate theme mode
  if ((isDark && !darkMode) || (!isDark && !lightMode)) {
    return <div className={className}>{children}</div>;
  }

  // Map blur values to CSS
  const blurMap = {
    none: "",
    subtle: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-xl",
  };

  // Map opacity values to background opacity
  const getOpacityClass = () => {
    const prefix = isDark ? "bg-white" : "bg-black";
    const opacityValues = {
      none: `${prefix}/0`,
      subtle: `${prefix}/${isDark ? "5" : "5"}`,
      medium: `${prefix}/${isDark ? "10" : "10"}`,
      heavy: `${prefix}/${isDark ? "15" : "15"}`,
    };
    return opacityValues[opacity];
  };

  // Border color based on theme
  const getBorderColor = () => {
    if (borderColor) return borderColor;
    return isDark ? "border-white/10" : "border-black/10";
  };

  // Rounded corners
  const getRoundedClass = () => {
    if (rounded === "none") return "";
    return `rounded-${rounded}`;
  };

  const variants = {
    initial: {
      opacity: 0.9,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
    hover: {
      scale: hoverEffect ? 1.02 : 1,
      boxShadow: hoverEffect
        ? isDark
          ? "0 10px 30px -10px rgba(0, 0, 0, 0.3)"
          : "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
        : "",
      transition: {
        duration: 0.2,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
    tap: {
      scale: clickEffect ? 0.98 : 1,
      transition: {
        duration: 0.1,
        ease: [0.2, 0.65, 0.3, 0.9],
      },
    },
  };

  return (
    <motion.div
      className={cn(
        getRoundedClass(),
        blurMap[blur],
        getOpacityClass(),
        border && "border",
        border && getBorderColor(),
        "transition-all duration-200",
        className
      )}
      initial={animate ? "initial" : undefined}
      animate={animate ? "animate" : undefined}
      whileHover="hover"
      whileTap="tap"
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

// Preset glass components for common uses
export function NavbarGlass({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, "blur" | "opacity">) {
  return (
    <GlassPanel
      className={cn("px-4 py-3", className)}
      blur="medium"
      opacity="subtle"
      hoverEffect={false}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

export function CardGlass({
  children,
  className,
  ...props
}: Omit<GlassPanelProps, "rounded">) {
  return (
    <GlassPanel
      className={cn("p-4", className)}
      rounded="xl"
      hoverEffect={true}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

export function ButtonGlass({
  children,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <GlassPanel
      className={cn("px-4 py-2 cursor-pointer", className)}
      rounded="full"
      blur="subtle"
      opacity="medium"
      hoverEffect={true}
      clickEffect={true}
      {...props}
    >
      {children}
    </GlassPanel>
  );
}

export function SidebarGlass({
  children,
  className,
  ...props
}: GlassPanelProps) {
  return (
    <GlassPanel
      className={cn("h-full", className)}
      rounded="none"
      blur="medium"
      opacity="subtle"
      {...props}
    >
      {children}
    </GlassPanel>
  );
}
