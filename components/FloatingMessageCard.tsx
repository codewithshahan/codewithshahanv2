"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigationStore } from "@/store/navigationStore";

interface FloatingMessageCardProps {
  title: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
  orbPosition?: {
    x: number;
    y: number;
  };
  width: number;
  isRandomMessage?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  onButtonClick?: () => void;
  onCardHoverStart?: () => void;
  onCardHoverEnd?: () => void;
  isSpinResult?: boolean;
  isTopPositioned?: boolean;
}

export const FloatingMessageCard = ({
  title,
  description = "",
  position,
  orbPosition,
  width,
  isRandomMessage = false,
  primaryColor = "#4080ff",
  secondaryColor = "#2563eb",
  onButtonClick,
  onCardHoverStart,
  onCardHoverEnd,
  isSpinResult = false,
  isTopPositioned = false,
}: FloatingMessageCardProps) => {
  // Local hover state for micro-interactions
  const [isHovered, setIsHovered] = useState(false);

  // Ref to track hover timeout for more stable hover behavior
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Calculate connection indicator positions
  const positions = useMemo(() => {
    const indicator = {
      x: width / 2,
      y: isTopPositioned ? 0 : "100%",
    };

    return { indicator };
  }, [width, isTopPositioned]);

  // Handle hover events with delay to make it more stable
  const handleHoverStart = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setIsHovered(true);
    if (onCardHoverStart) onCardHoverStart();
  };

  const handleHoverEnd = () => {
    // When user hovers out, we set a timeout before actually ending the hover state
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    hoverTimeoutRef.current = setTimeout(
      () => {
        setIsHovered(false);
        if (onCardHoverEnd) onCardHoverEnd();
      },
      isSpinResult ? 1000 : 3000
    ); // Shorter timeout (1s) for spin result, longer (3s) for regular cards
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Set dynamic exit animations based on position
  const exitAnimation = isTopPositioned
    ? {
        opacity: 0,
        y: -20,
        scale: 0.9,
        filter: "blur(8px)",
        rotateX: 30,
      }
    : {
        opacity: 0,
        y: 20,
        scale: 0.9,
        filter: "blur(8px)",
        rotateX: -30,
      };

  // Card variant animations
  const cardVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      x: position.x,
      y: position.y + (isTopPositioned ? -10 : 10),
      filter: "blur(8px)",
      rotateX: isTopPositioned ? 30 : -30,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: position.x,
      y: position.y,
      filter: "blur(0px)",
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
        duration: 0.4,
      },
    },
    exit: exitAnimation,
  };

  // Card content animations for staggered effect
  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.3,
      },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  // Button animations
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2,
        duration: 0.3,
        type: "spring",
        stiffness: 300,
      },
    },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
    hover: {
      scale: 1.05,
      boxShadow: isSpinResult
        ? `0 4px 12px rgba(52,199,89,0.3), 0 0 0 1px rgba(52,199,89,0.8)`
        : `0 5px 15px rgba(0,0,0,0.2), 0 0 0 2px ${primaryColor}aa`,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  };

  // Add indicator variants definition
  const indicatorVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.15,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Enhanced connection line animation with multiple segments for more dynamic look
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.9,
      transition: { delay: 0.05, duration: 0.4, ease: "easeOut" },
    },
    exit: { pathLength: 0, opacity: 0, transition: { duration: 0.3 } },
  };

  // Generate dynamic path for connection line with curves
  const generateConnectionPath = () => {
    if (!orbPosition) return "";

    // Calculate control points for bezier curve
    const dx = position.x + width / 2 - orbPosition.x;
    const dy = position.y + (isTopPositioned ? 5 : -5) - orbPosition.y;

    // Create curve intensity based on distance
    const curveIntensity = Math.min(Math.abs(dx) * 0.4, 40);

    // Generate path with quadratic bezier curve for more elegant connection
    return `M ${orbPosition.x} ${orbPosition.y} 
            Q ${orbPosition.x + dx * 0.5} ${
      orbPosition.y + (isTopPositioned ? -curveIntensity : curveIntensity)
    }, 
            ${position.x + width / 2} ${
      position.y + (isTopPositioned ? 5 : -5)
    }`;
  };

  // Determine text for the button and card
  const buttonText = isSpinResult ? "Browse" : "View Category";
  const cardTitle = isSpinResult ? `You Win: ${title}!` : title;
  const cardDescription = isSpinResult
    ? `Amazing! You've discovered the ${title.toLowerCase()} category treasure.`
    : description || `View all ${title.toLowerCase()} category products...`;

  // Enhanced shimmer effect for winner
  const shimmerStyle = isSpinResult
    ? {
        background: `linear-gradient(
          135deg, 
          rgba(250,250,250,0.95) 0%, 
          rgba(240,240,240,0.9) 50%,
          rgba(250,250,250,0.95) 100%
        )`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow:
          "0 10px 25px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.4)",
        borderRadius: "16px",
      }
    : {};

  // Responsive width adjustment for mobile
  const responsiveWidth =
    typeof window !== "undefined" && window.innerWidth < 480
      ? Math.min(width, window.innerWidth * 0.85)
      : width;

  // Handle button click with navigation animation
  const handleButtonClick = () => {
    if (onButtonClick) {
      if (isSpinResult) {
        // For winning cards, start the navigation animation
        const { startNavigation } = useNavigationStore.getState();
        // Construct a category URL based on the title
        const categorySlug = title.toLowerCase().replace(/\s+/g, "-");
        startNavigation(`/store/category/${categorySlug}`);
      }

      // Call the provided click handler
      onButtonClick();
    }
  };

  return (
    <>
      {/* Enhanced connection line to orb if position is provided */}
      {orbPosition && (
        <svg
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          {/* Main connecting line */}
          <motion.path
            d={generateConnectionPath()}
            stroke={isSpinResult ? "rgba(52,199,89,0.4)" : primaryColor}
            strokeWidth={isSpinResult ? 1 : 2}
            strokeDasharray={isSpinResult ? "2 2" : "6 4"}
            fill="none"
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              filter: isSpinResult
                ? "none"
                : `drop-shadow(0 0 3px ${primaryColor})`,
            }}
          />

          {/* Adding subtle glow effect to the line */}
          {isSpinResult ? (
            <motion.path
              d={generateConnectionPath()}
              stroke={`rgba(52,199,89,0.15)`}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                filter: "blur(2px)",
              }}
            />
          ) : (
            <motion.path
              d={generateConnectionPath()}
              stroke={primaryColor}
              strokeWidth={6}
              strokeOpacity={0.3}
              strokeLinecap="round"
              fill="none"
              variants={lineVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                filter: `blur(3px)`,
              }}
            />
          )}

          {/* Animated particles flowing along the path */}
          {Array.from({ length: isSpinResult ? 2 : 3 }).map((_, i) => {
            const delay = i * 0.5;
            const duration = isSpinResult ? 2 + i * 0.3 : 1.5 + i * 0.2;
            const size = isSpinResult ? 1.5 + (i % 2) : 2 + Math.random();

            return (
              <motion.circle
                key={`flow-particle-${i}`}
                r={size}
                fill={isSpinResult ? "rgba(var(--primary), 0.6)" : "#fff"}
                opacity={0}
                style={{
                  filter: isSpinResult
                    ? "none"
                    : `drop-shadow(0 0 2px ${primaryColor})`,
                }}
                animate={{
                  opacity: isSpinResult ? [0, 0.4, 0] : [0, 0.8, 0],
                }}
                transition={{
                  duration: duration,
                  times: [0, 0.5, 1],
                  repeat: Infinity,
                  delay: delay,
                }}
              >
                {/* Use SVG animation with animateMotion instead of offsetDistance */}
                <animateMotion
                  path={generateConnectionPath()}
                  dur={`${duration}s`}
                  begin={`${delay}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                />
              </motion.circle>
            );
          })}
        </svg>
      )}

      {/* Card */}
      <motion.div
        className="absolute pointer-events-auto z-20"
        style={{
          width: responsiveWidth,
          perspective: 1000,
          filter: isSpinResult
            ? `drop-shadow(0 0 20px rgba(0,0,0,0.06))`
            : `drop-shadow(0 5px 15px rgba(0,0,0,0.1))`,
        }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
      >
        <motion.div
          className={`rounded-xl overflow-hidden backdrop-blur-md ${
            isSpinResult ? "dark:bg-black/90" : ""
          }`}
          style={{
            background: isSpinResult
              ? `linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,248,250,0.96))`
              : `linear-gradient(165deg, rgba(250,250,250,0.9), rgba(240,240,240,0.85))`,
            border: isSpinResult
              ? `1px solid rgba(255,255,255,0.8)`
              : "1px solid rgba(255,255,255,0.4)",
            boxShadow: isSpinResult
              ? `0 10px 25px rgba(0,0,0,0.08), 0 2px 5px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(255,255,255,0.7)`
              : "0 10px 15px -5px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.7), inset 0 0 20px rgba(255,255,255,0.5)",
            transformStyle: "preserve-3d",
            ...shimmerStyle,
          }}
          animate={
            isSpinResult
              ? {
                  scale: [1, 1.02, 1],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                }
              : {}
          }
        >
          {/* Card content */}
          <div className={`p-3 relative ${isSpinResult ? "pt-5" : ""}`}>
            {/* Special message tag for random appearance */}
            {isRandomMessage && !isSpinResult && (
              <motion.div
                className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-medium py-1 px-2.5 rounded-lg shadow-md z-20"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 15 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                New
              </motion.div>
            )}

            {/* Winner badge for spin result */}
            {isSpinResult && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 bg-gradient-to-br from-[#34c759] to-[#30af50] text-white text-xs font-medium py-1 px-3 rounded-full shadow-sm z-20"
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -2, 0],
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  Winner
                </motion.div>

                {/* Subtle success icon */}
                <motion.div
                  className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                >
                  <motion.div
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[#34c759]/10"
                    animate={{
                      scale: [1, 1.05, 1],
                      backgroundColor: [
                        "rgba(52,199,89,0.08)",
                        "rgba(52,199,89,0.12)",
                        "rgba(52,199,89,0.08)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <motion.path
                        d="M5 13l4 4L19 7"
                        stroke="#34c759"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </>
            )}

            {/* Card title with celebration animation for winner */}
            <motion.h3
              className={`font-bold mb-2 ${isSpinResult ? "text-center" : ""}`}
              style={{
                color: isSpinResult ? "#111827" : "#1A202C",
                textShadow: isSpinResult ? "none" : "none",
                fontSize: isSpinResult
                  ? typeof window !== "undefined" && window.innerWidth < 480
                    ? "1rem"
                    : "1.1rem"
                  : "0.875rem",
                textAlign: isSpinResult ? "center" : "left",
                letterSpacing: isSpinResult ? "-0.01em" : "normal",
                fontWeight: isSpinResult ? "600" : "bold",
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={
                isSpinResult
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 1,
                      y: 0,
                    }
              }
              transition={{
                delay: 0.1,
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              {isSpinResult && (
                <motion.span className="relative inline-block">
                  {cardTitle}
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/30 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2,
                      ease: "easeOut",
                    }}
                  />
                </motion.span>
              )}
              {!isSpinResult && cardTitle}
            </motion.h3>

            {/* Card description */}
            <motion.p
              className="text-xs mb-3"
              style={{
                color: isSpinResult ? "#4B5563" : "#4A5568",
                textShadow: isSpinResult ? "none" : "none",
                fontSize: isSpinResult
                  ? typeof window !== "undefined" && window.innerWidth < 480
                    ? "0.75rem"
                    : "0.8rem"
                  : "0.75rem",
                textAlign: isSpinResult ? "center" : "left",
                fontWeight: isSpinResult ? "normal" : "normal",
                lineHeight: "1.4",
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {cardDescription}
            </motion.p>

            {/* Action button */}
            {isSpinResult ? (
              <motion.button
                className="w-full text-sm font-medium py-2.5 rounded-full flex items-center justify-center"
                style={{
                  background: "#34c759",
                  color: "white",
                  border: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  fontWeight: 500,
                  fontSize:
                    typeof window !== "undefined" && window.innerWidth < 480
                      ? "0.8rem"
                      : "0.875rem",
                }}
                onClick={handleButtonClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, y: 5 }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                <svg
                  className="w-3.5 h-3.5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                {buttonText}
              </motion.button>
            ) : (
              <motion.button
                className="w-full text-xs font-medium py-2 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  color: "white",
                  boxShadow: "0 3px 10px -3px rgba(0,0,0,0.2)",
                }}
                onClick={handleButtonClick}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {buttonText}
              </motion.button>
            )}
          </div>

          {/* Decorative elements for winner card */}
          {isSpinResult && (
            <>
              {/* Subtle background pulse */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, rgba(52,199,89,0.04) 0%, rgba(52,199,89,0.01) 70%, transparent 100%)`,
                  borderRadius: "16px",
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Subtle dot grid pattern */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `radial-gradient(rgba(52,199,89,0.3) 1px, transparent 1px)`,
                    backgroundSize: "16px 16px",
                  }}
                />
              </div>

              {/* Minimal animated accent lines */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={`accent-line-${i}`}
                    className="absolute rounded-full bg-[#34c759]/10"
                    style={{
                      height: 1.5,
                      width: 40 + i * 15,
                      bottom: 12 + i * 6,
                      right: 12,
                      transformOrigin: "right center",
                    }}
                    animate={{
                      scaleX: [1, 0.7, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2 + i * 0.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Minimal animated particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute rounded-full bg-[#34c759]/30"
                    style={{
                      width: 3 + (i % 3),
                      height: 3 + (i % 3),
                      top: `${20 + i * 10}%`,
                      left: `${10 + ((i * 15) % 80)}%`,
                    }}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                      duration: 3 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Connection indicator - fixed to work without relying on undefined positions */}
          {orbPosition && (
            <motion.circle
              cx={positions.indicator.x}
              cy={positions.indicator.y}
              r={isSpinResult ? 4 : 5}
              fill={isSpinResult ? "#34c759" : primaryColor}
              variants={indicatorVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                filter: isSpinResult
                  ? "drop-shadow(0 0 2px rgba(52,199,89,0.8))"
                  : `drop-shadow(0 0 3px ${primaryColor})`,
              }}
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
};
