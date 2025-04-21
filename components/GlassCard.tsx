"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion, useAnimation, useScroll } from "framer-motion";
import GlassCardContent from "./GlassCard/GlassCardContent";
import GlassShimmerEffect from "./GlassCard/GlassShimmerEffect";
import GlassHighlightEffect from "./GlassCard/GlassHighlightEffect";
import {
  GlassEffectProvider,
  useGlassEffect,
} from "./GlassCard/GlassEffectProvider";
import GlassCardText from "./GlassCard/GlassCardText";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  enableScrollAway?: boolean;
  scrollThreshold?: number;
  scrollAwayOffset?: number;
  mobileResponsive?: boolean;
  variant?: "default" | "compact" | "subtle";
  isInput?: boolean;
  intensity?: number;
  textOptimizationLevel?: "standard" | "high" | "maximum";
}

// Inner component that uses the context
const GlassCardInner: React.FC<
  Omit<GlassCardProps, "intensity" | "textOptimizationLevel">
> = ({
  children,
  className = "",
  enableScrollAway = false,
  scrollThreshold = 200,
  scrollAwayOffset = 50,
  mobileResponsive = true,
  variant = "default",
  isInput = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const controls = useAnimation();
  const { scrollY } = useScroll();
  const [isAutoAnimating, setIsAutoAnimating] = useState(false);

  // Use the glass effect context with access to textOptimizationLevel
  const {
    rotateX,
    rotateY,
    scale,
    isInteracting,
    setRotateX,
    setRotateY,
    setScale,
    setIsInteracting,
    intensity,
    textOptimizationLevel,
  } = useGlassEffect();

  // Handle scroll effect if enabled
  useEffect(() => {
    if (enableScrollAway) {
      const unsubscribe = scrollY.onChange((value) => {
        if (value > scrollThreshold) {
          controls.start({
            opacity: [1, 0.8, 0],
            y: [0, -10, -scrollAwayOffset],
            scale: [1, 0.98, 0.95],
            filter: ["blur(0px)", "blur(2px)"],
            transition: {
              duration: 0.6,
              ease: "easeOut",
              opacity: { duration: 0.6 },
              scale: { duration: 0.7 },
              y: { duration: 0.5 },
              filter: { duration: 0.4 },
            },
          });
        } else {
          controls.start({
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
              duration: 0.5,
              ease: "easeOut",
            },
          });
        }
      });

      return () => unsubscribe();
    }
  }, [enableScrollAway, controls, scrollY, scrollThreshold, scrollAwayOffset]);

  // Automatic animation effect that runs periodically when not hovered
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;

    const runAutoAnimation = () => {
      if (!isHovered && !isAutoAnimating && !isInteracting && mounted) {
        setIsAutoAnimating(true);

        // Animate to random position with attention-grabbing effect
        const animateRandom = async () => {
          // Enhanced professional pulse highlight effect
          if (mounted) {
            controls.start({
              scale: [1, 0.97, 1.03, 0.99, 1.01, 1],
              boxShadow: [
                "0 0 0 0px rgba(99, 102, 241, 0)",
                "0 0 0 2px rgba(99, 102, 241, 0.3)",
                "0 0 20px 5px rgba(99, 102, 241, 0.35)",
                "0 0 12px 3px rgba(99, 102, 241, 0.25)",
                "0 0 5px 1px rgba(99, 102, 241, 0.15)",
                "0 0 0 0px rgba(99, 102, 241, 0)",
              ],
              transition: {
                duration: 1.5,
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                ease: "easeInOut",
              },
            });
          }

          // Wait for the initial animation to complete
          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!mounted) return;

          // Generate random positions for the animation
          const randomX = Math.random() * 0.4 - 0.2;
          const randomY = Math.random() * 0.4 - 0.2;

          setMousePosition({ x: 0.5 + randomX, y: 0.5 + randomY });

          // More gentle motion for better elastic feel
          const elasticRotateX = -randomY * 15 * intensity;
          const elasticRotateY = randomX * 15 * intensity;
          const elasticScale =
            1 + Math.abs(randomX * randomY) * 0.04 * intensity;

          setRotateX(elasticRotateX);
          setRotateY(elasticRotateY);
          setScale(elasticScale);

          // Hold this position briefly
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (!mounted) return;

          // Return to neutral with elastic bounce
          if (mounted) {
            await controls.start({
              rotateX: 0,
              rotateY: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 150,
                damping: 15,
                duration: 1.2,
              },
            });
          }

          if (mounted) {
            setRotateX(0);
            setRotateY(0);
            setScale(1);
            setIsAutoAnimating(false);
          }
        };

        animateRandom();
      }
    };

    // Trigger animation after a delay for the first time unless it's an input card
    if (!isInput) {
      const initialTimeout = setTimeout(() => {
        runAutoAnimation();
      }, 1000);
    }

    // Run the automatic animation exactly every 20 seconds for all cards
    interval = setInterval(() => {
      runAutoAnimation();
    }, 20000); // Exactly 20 seconds for all cards

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [
    isHovered,
    isAutoAnimating,
    controls,
    isInput,
    isInteracting,
    intensity,
    setRotateX,
    setRotateY,
    setScale,
  ]);

  // Listen for focus events on input fields
  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    // Find all input elements inside the card
    const inputElements = card.querySelectorAll("input, textarea, select");

    const handleFocus = () => {
      setIsInteracting(true);
      setIsAutoAnimating(false);
      setRotateX(0);
      setRotateY(0);
      setScale(1);
    };

    const handleBlur = () => {
      setTimeout(() => {
        setIsInteracting(false);
      }, 200); // Small delay to ensure animations don't start immediately after blur
    };

    // Add event listeners to all input elements
    inputElements.forEach((input) => {
      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);
    });

    // Cleanup
    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      });
    };
  }, [isInput, setIsInteracting, setRotateX, setRotateY, setScale]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isAutoAnimating || isInteracting) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();

      // Get relative mouse position within the card (0-1)
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;

      // Calculate mouse position relative to card center
      const centerX = relX - 0.5;
      const centerY = relY - 0.5;

      // Enhanced elastic 3D effect with more pronounced movement
      const distanceFromCenter = Math.sqrt(
        centerX * centerX + centerY * centerY
      );
      const elasticFactor = Math.min(distanceFromCenter * 2.2, 1.4); // Enhanced for more visible effect

      // More dramatic curve with better elasticity
      const edgeIntensity = Math.pow(elasticFactor, 1.5);

      // More pronounced rotation for better 3D effect but with reduced intensity for text clarity
      const rotateX = -centerY * 10 * intensity * edgeIntensity; // Reduced from 14 to 10
      const rotateY = centerX * 10 * intensity * edgeIntensity; // Reduced from 14 to 10

      // Update mouse position for shine effect
      setMousePosition({ x: relX, y: relY });
      setRotateX(rotateX);
      setRotateY(rotateY);
      setScale(1 + edgeIntensity * 0.05 * intensity); // Enhanced scale for better elasticity
    },
    [
      isHovered,
      isAutoAnimating,
      isInteracting,
      intensity,
      setRotateX,
      setRotateY,
      setScale,
    ]
  );

  const handleMouseEnter = () => {
    if (isInteracting) return;
    setIsHovered(true);
    setIsAutoAnimating(false); // Stop auto animation when user interacts
  };

  const handleMouseLeave = () => {
    if (isInteracting) return;
    setIsHovered(false);
    // Enhanced spring animation with more elastic bounce
    controls.start({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 0.9,
        velocity: 2.5,
      },
    });
    setRotateX(0);
    setRotateY(0);
    setScale(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card group ${className} ${
        variant === "compact" ? "p-4" : "p-6"
      } ${!mobileResponsive ? "max-w-full" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={controls}
      initial={{ opacity: 1, y: 0 }}
      style={{
        transform: isInteracting
          ? "none"
          : `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`, // Increased perspective for less distortion
        position: "relative",
        overflow: "hidden",
        borderColor:
          (isHovered || isAutoAnimating) && !isInteracting
            ? `rgba(99, 102, 241, ${
                0.3 + Math.abs(rotateX) * 0.005 + Math.abs(rotateY) * 0.005
              })`
            : "rgba(255, 255, 255, 0.1)",
        isolation: "isolate",
        transformStyle: isInteracting ? "flat" : "preserve-3d",
        transformOrigin: "center center",
        backfaceVisibility: "hidden",
        transition: "border-color 0.3s ease, transform 0.3s ease",
      }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 20,
        mass: 1,
        velocity: 2,
      }}
      whileHover={{
        boxShadow:
          "0 15px 30px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(99, 102, 241, 0.2) inset",
      }}
    >
      {/* All animation layers */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        {/* Use extracted components for effects */}
        <GlassShimmerEffect
          rotateX={rotateX}
          rotateY={rotateY}
          isHovered={isHovered}
          isAutoAnimating={isAutoAnimating}
          isInteracting={isInteracting}
        />
        <GlassHighlightEffect
          mousePosition={mousePosition}
          rotateX={rotateX}
          rotateY={rotateY}
          isHovered={isHovered}
          isAutoAnimating={isAutoAnimating}
          isInteracting={isInteracting}
        />

        {/* Primary gentle shimmer */}
        <motion.div
          className="absolute top-0 left-[-100%] h-full w-[60%] bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-[-20deg]"
          animate={{
            left: ["-100%", "200%"],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 17, // Reduced frequency to match 20s interval
          }}
          style={{
            filter: "blur(12px)",
            transformStyle: "preserve-3d",
            transform: `perspective(1000px) rotateY(${rotateY * 0.2}deg)`,
          }}
        />

        {/* Secondary subtle shimmer */}
        <motion.div
          className="absolute top-0 left-[-100%] h-full w-[20%] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-15deg]"
          animate={{
            left: ["-100%", "200%"],
          }}
          transition={{
            duration: 2.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 17.5, // Reduced frequency to match 20s interval
            delay: 0.5,
          }}
          style={{
            filter: "blur(8px)",
            transformStyle: "preserve-3d",
            transform: `perspective(1000px) rotateY(${rotateY * 0.1}deg)`,
          }}
        />

        {/* Apple-style crisp border highlight */}
        {(isHovered || isAutoAnimating) && !isInteracting && (
          <motion.div
            className="absolute -inset-0.5 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            style={{
              borderRadius: "inherit",
              background: "transparent",
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: `rgba(99, 102, 241, ${
                0.4 + Math.abs(rotateX) * 0.005 + Math.abs(rotateY) * 0.005
              })`,
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${
                rotateX * 1.1
              }deg) rotateY(${rotateY * 1.1}deg) scale(${scale * 1.01})`,
              boxShadow: `0 0 12px -1px rgba(99, 102, 241, ${
                0.2 + Math.abs(rotateX) * 0.015 + Math.abs(rotateY) * 0.015
              })`,
              filter: `blur(${
                Math.abs(rotateX) * 0.03 + Math.abs(rotateY) * 0.03 + 0.2
              }px)`,
            }}
          />
        )}

        {/* Ultra premium Apple-style ambient glow */}
        {(isHovered || isAutoAnimating) && !isInteracting && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isAutoAnimating ? [0.4, 0.9, 0.6, 0.4] : [0.4, 0.7, 0.4],
              boxShadow: isAutoAnimating
                ? [
                    "inset 0 0 15px 2px rgba(99, 102, 241, 0.2)",
                    "inset 0 0 35px 8px rgba(99, 102, 241, 0.4)",
                    "inset 0 0 25px 5px rgba(99, 102, 241, 0.3)",
                    "inset 0 0 15px 2px rgba(99, 102, 241, 0.2)",
                  ]
                : [
                    "inset 0 0 15px 2px rgba(99, 102, 241, 0.2)",
                    "inset 0 0 25px 5px rgba(99, 102, 241, 0.3)",
                    "inset 0 0 15px 2px rgba(99, 102, 241, 0.2)",
                  ],
            }}
            transition={{
              repeat: isAutoAnimating ? 0 : Infinity,
              duration: isAutoAnimating ? 1.5 : 2.5,
              ease: "easeInOut",
              times: isAutoAnimating ? [0, 0.3, 0.7, 1] : undefined,
            }}
            style={{
              backgroundImage: `radial-gradient(circle at ${
                mousePosition.x * 100
              }% ${mousePosition.y * 100}%, rgba(99, 102, 241, ${
                isAutoAnimating ? 0.25 : 0.1
              }) 0%, transparent 70%)`,
              transformStyle: "preserve-3d",
              transform: `perspective(1000px) rotateX(${
                rotateX * 0.6
              }deg) rotateY(${rotateY * 0.6}deg)`,
            }}
          />
        )}

        {/* Premium multi-layer ripple effects - created through overlapping waves */}
        {isAutoAnimating && !isInteracting && (
          <>
            {/* Primary ripple - fastest and most prominent */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: [0, 0.8, 0.3, 0],
                scale: [0.95, 1.05, 1.15, 1.25],
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                times: [0, 0.3, 0.7, 1],
                delay: 0.05,
              }}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.1) 25%, transparent 60%)`,
                transformStyle: "preserve-3d",
                filter: "blur(8px)",
                borderRadius: "inherit",
              }}
            />

            {/* Secondary ripple - medium speed */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0, 0.7, 0.2, 0],
                scale: [0.9, 1.1, 1.2, 1.35],
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                times: [0, 0.3, 0.7, 1],
                delay: 0.15,
              }}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.08) 20%, transparent 55%)`,
                transformStyle: "preserve-3d",
                filter: "blur(12px)",
                borderRadius: "inherit",
              }}
            />

            {/* Tertiary ripple - slowest and largest */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{
                opacity: [0, 0.5, 0.15, 0],
                scale: [0.85, 1.15, 1.3, 1.45],
              }}
              transition={{
                duration: 1.8,
                ease: "easeOut",
                times: [0, 0.3, 0.7, 1],
                delay: 0.25,
              }}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.05) 25%, transparent 60%)`,
                transformStyle: "preserve-3d",
                filter: "blur(16px)",
                borderRadius: "inherit",
              }}
            />

            {/* Apple-style subtle color spread effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.9, 1.2, 1.4],
              }}
              transition={{
                duration: 1.6,
                ease: "easeOut",
                times: [0, 0.4, 1],
              }}
              style={{
                background:
                  "radial-gradient(circle at center, rgba(79, 70, 229, 0.1) 0%, rgba(147, 51, 234, 0.08) 30%, transparent 70%)",
                filter: "blur(18px)",
                transformStyle: "preserve-3d",
                borderRadius: "inherit",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}

        {/* Glowing border outline during pulse animation - Apple edge precision */}
        {isAutoAnimating && !isInteracting && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden z-10"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.9, 0.4, 0],
              boxShadow: [
                "0 0 0 1px rgba(99, 102, 241, 0)",
                "0 0 0 2px rgba(99, 102, 241, 0.6)",
                "0 0 0 1px rgba(99, 102, 241, 0.3)",
                "0 0 0 1px rgba(99, 102, 241, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              times: [0, 0.3, 0.7, 1],
            }}
          />
        )}
      </div>

      {/* Use the GlassCardContent component with text optimization level */}
      <GlassCardContent
        rotateX={rotateX}
        rotateY={rotateY}
        scale={scale}
        isInteracting={isInteracting}
      >
        {children}
      </GlassCardContent>
    </motion.div>
  );
};

// Main component that wraps the inner component with the provider
const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 0.7, // Reduced from 1.0 to 0.7 for better text clarity
  textOptimizationLevel = "high",
  ...props
}) => {
  return (
    <GlassEffectProvider
      intensity={intensity}
      textOptimizationLevel={textOptimizationLevel}
    >
      <GlassCardInner {...props}>{children}</GlassCardInner>
    </GlassEffectProvider>
  );
};

// Export GlassCardText as a named export for convenience
export { GlassCardText };
export default GlassCard;
