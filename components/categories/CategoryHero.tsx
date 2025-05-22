"use client";

import React, { useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  MotionValue,
} from "framer-motion";
import {
  Sparkles,
  Code2,
  Palette,
  Cpu,
  BookOpen,
  Layers,
  Rocket,
  Lightbulb,
  Blocks,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Image from "next/image";

interface CategoryHeroProps {
  name: string;
  itemCount: number;
  isLoading?: boolean;
  icon?: any;
  color?: string;
  description?: string;
}

// Get an icon component based on category name
const getCategoryIcon = (name: string) => {
  const iconMap: Record<string, any> = {
    "clean-code": Code2,
    design: Palette,
    "ai-ml": Cpu,
    ai: Cpu,
    "web-dev": Layers,
    devops: Rocket,
    tutorials: BookOpen,
    tips: Lightbulb,
    architecture: Blocks,
    default: Sparkles,
  };

  // Convert to slug format for matching
  const slug = name?.toLowerCase().replace(/\s+/g, "-");

  // Return matching icon or default
  return iconMap[slug] || iconMap.default;
};

// Create 3D floating particles
const Particles = ({
  count = 20,
  color = "#ffffff",
}: {
  count?: number;
  color?: string;
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: color,
            opacity: 0.2,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut",
          }}
        />
      ))}
    </>
  );
};

export const CategoryHero: React.FC<CategoryHeroProps> = ({
  name,
  itemCount,
  isLoading = false,
  icon: providedIcon,
  color = "#007AFF",
  description,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Motion values for parallax and mouse interaction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const controls = useAnimation();

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isReducedMotion) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = clientX - left;
    const y = clientY - top;

    mouseX.set(x / width - 0.5); // -0.5 to 0.5
    mouseY.set(y / height - 0.5); // -0.5 to 0.5
  };

  // Format category name for display
  const displayName = name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Calculate derived values for motion
  const titleX = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const titleY = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const iconX = useTransform(mouseX, [-0.5, 0.5], [20, -20]);
  const iconY = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const bgX = useTransform(mouseX, [-0.5, 0.5], [50, -50]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], [30, -30]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  // Get the icon to display
  const Icon = providedIcon || getCategoryIcon(name);

  // Extract color components for gradients
  const baseColor = color || "#007AFF";
  const darkerColor = baseColor + "CC"; // 80% opacity
  const lighterColor = baseColor + "33"; // 20% opacity

  // Animate in on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
      },
    });
  }, [controls]);

  return (
    <motion.section
      className="relative py-16 sm:py-20 md:py-28 px-4 overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={controls}
      onMouseMove={handleMouseMove}
    >
      {/* 3D background with parallax effect */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{
          x: isReducedMotion ? 0 : bgX,
          y: isReducedMotion ? 0 : bgY,
        }}
      >
        {/* Base gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />

        {/* Animated radial bloom */}
        <motion.div
          className={cn(
            "absolute inset-0 opacity-40",
            isDark ? "mix-blend-screen" : "mix-blend-multiply"
          )}
          animate={{
            background: [
              `radial-gradient(circle at 50% 40%, ${baseColor}22 0%, transparent 60%)`,
              `radial-gradient(circle at 50% 40%, ${baseColor}44 0%, transparent 65%)`,
              `radial-gradient(circle at 50% 40%, ${baseColor}22 0%, transparent 60%)`,
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main color accent */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${baseColor}33 0%, transparent 70%)`,
          }}
        />

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-1 overflow-hidden">
        <Particles count={isMobile ? 10 : 30} color={baseColor} />
      </div>

      {/* Content container with 3D transform */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto text-center"
        style={{
          rotateX: isReducedMotion ? 0 : rotateX,
          rotateY: isReducedMotion ? 0 : rotateY,
          perspective: 1000,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Category icon with 3D float effect */}
        <motion.div
          className="mb-8 inline-block"
          style={{
            x: isReducedMotion ? 0 : iconX,
            y: isReducedMotion ? 0 : iconY,
            z: 50,
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1,
          }}
        >
          <div
            className={cn(
              "relative w-20 h-20 md:w-24 md:h-24 rounded-[28px] flex items-center justify-center",
              isDark
                ? "shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]"
                : "shadow-[0_15px_40px_-15px_rgba(0,0,0,0.3)]"
            )}
            style={{
              background: `linear-gradient(135deg, ${baseColor}, ${darkerColor})`,
            }}
          >
            {/* Icon glow effect */}
            <div
              className="absolute inset-0 rounded-[28px] blur-xl opacity-30"
              style={{ background: baseColor }}
            />

            {/* Top glass highlight */}
            <div className="absolute inset-x-4 top-0 h-1/3 bg-white/20 rounded-t-2xl blur-sm" />

            {/* Icon */}
            {typeof Icon === "function" ? (
              <Icon
                size={isMobile ? 32 : 40}
                className="text-white relative z-10"
              />
            ) : (
              <div className="text-white text-4xl md:text-5xl font-bold relative z-10">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Shadow under icon */}
          <div
            className="mt-3 w-16 h-2 mx-auto rounded-full opacity-30 blur-md"
            style={{ background: baseColor }}
          />
        </motion.div>

        {/* Category title with 3D effect */}
        <motion.div
          style={{
            x: isReducedMotion ? 0 : titleX,
            y: isReducedMotion ? 0 : titleY,
            z: 30,
          }}
        >
          <motion.h1
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {displayName}

            {/* Text gradient highlight */}
            <span
              className="absolute inset-0 bg-clip-text text-transparent opacity-80"
              style={{
                backgroundImage: `linear-gradient(135deg, ${baseColor}CC, ${baseColor}00)`,
                backgroundSize: "300% 300%",
                backgroundPosition: "left center",
                WebkitBackgroundClip: "text",
              }}
            >
              {displayName}
            </span>
          </motion.h1>

          {/* Category stats with shimmer animation */}
          <motion.div
            className={cn(
              "text-lg",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {isLoading ? (
              <div className="h-6 w-44 bg-gray-700/20 rounded-full animate-pulse mx-auto" />
            ) : (
              <p>
                <span className="font-semibold" style={{ color: baseColor }}>
                  {itemCount}
                </span>{" "}
                {itemCount === 1 ? "Article" : "Articles"} Available
              </p>
            )}
          </motion.div>

          {/* Description with gentle fade-in */}
          {description && (
            <motion.p
              className={cn(
                "mt-6 max-w-2xl mx-auto",
                isDark ? "text-gray-400" : "text-gray-600"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {description}
            </motion.p>
          )}
        </motion.div>

        {/* Decorative accent line with color */}
        <motion.div
          className="mt-10 h-px w-32 mx-auto"
          style={{
            background: `linear-gradient(to right, transparent, ${baseColor}55, transparent)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </motion.div>
    </motion.section>
  );
};
