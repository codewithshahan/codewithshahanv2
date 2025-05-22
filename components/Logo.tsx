"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  MotionConfig,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useTheme } from "next-themes";

type LogoVariant = "default" | "compact" | "minimal";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  href?: string;
  withText?: boolean;
}

export default function Logo({
  variant = "default",
  className,
  href = "/",
  withText = true,
}: LogoProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isTablet = useMediaQuery("(max-width: 768px)");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Motion values for 3D effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform mouse position into rotation values
  const rotateX = useTransform(y, [-20, 20], [8, -8]);
  const rotateY = useTransform(x, [-20, 20], [-8, 8]);

  // Add spring physics for smooth animation
  const springConfig = { damping: 20, stiffness: 300, mass: 0.8 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const scale = useSpring(1, { stiffness: 400, damping: 25 });

  // Handle hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle mouse move for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  // Reset position on mouse leave
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    scale.set(1);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.05);
  };

  // Base styles for logo container
  const containerStyles = cn(
    "relative z-0 flex items-center gap-2.5 select-none",
    variant === "compact" ? "text-xs" : "text-sm",
    variant === "minimal" ? "w-9 h-9" : "",
    className
  );

  // Only render client-side to avoid hydration mismatch
  if (!isMounted) return null;

  return (
    <MotionConfig transition={{ type: "spring", bounce: 0.2 }}>
      <Link
        href={href}
        className={containerStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="relative"
          onMouseMove={handleMouseMove}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            perspective: 1000,
            scale,
          }}
        >
          {/* Logo Icon */}
          <motion.div
            className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-[20%]",
              variant === "minimal" ? "w-9 h-9" : "w-12 h-12"
            )}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Image
              src="/icons/logo/icon.svg"
              alt="CodewithShahan Logo"
              width={variant === "minimal" ? 36 : 48}
              height={variant === "minimal" ? 36 : 48}
              className="object-contain"
              priority
            />

            {/* Shine effect */}
            <motion.span
              className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent"
              initial={{ opacity: 0, rotateZ: -20, scale: 1.2 }}
              animate={{
                opacity: isHovered ? [0, 0.5, 0] : 0,
                left: isHovered ? ["-100%", "100%"] : "-100%",
              }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                repeat: isHovered ? Infinity : 0,
                repeatDelay: 2,
              }}
            />
          </motion.div>
        </motion.div>

        {/* Logo Text */}
        {withText && variant !== "minimal" && (
          <motion.div
            className="flex flex-col"
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <motion.span
              className="font-semibold tracking-tight text-foreground"
              style={{ fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              CodewithShahan
            </motion.span>
            {variant === "default" && !isTablet && (
              <motion.span
                className="text-xs text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                transition={{ delay: 0.2 }}
                style={{ letterSpacing: "0.01em" }}
              >
                Web Development & AI
              </motion.span>
            )}
          </motion.div>
        )}

        {/* Orbital particles (only visible on hover) */}
        <AnimatePresence>
          {isHovered && variant !== "minimal" && (
            <motion.div
              className="absolute left-0 top-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-1 h-1 rounded-full bg-${
                    isDark ? "blue" : "blue"
                  }-${isDark ? "400" : "500"}`}
                  initial={{
                    x: 6,
                    y: 6,
                    opacity: 0.6,
                    scale: 0.5,
                  }}
                  animate={{
                    x: [6, 6 + Math.cos((Math.PI * 2 * i) / 3) * 15],
                    y: [6, 6 + Math.sin((Math.PI * 2 * i) / 3) * 15],
                    opacity: [0.6, 0],
                    scale: [0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    ease: "easeOut",
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </MotionConfig>
  );
}
