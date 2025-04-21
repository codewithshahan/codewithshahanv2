"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

interface CategoryItem {
  name: string;
  slug: string;
  color?: string;
}

interface SpinningCategoryWheelProps {
  categories: CategoryItem[];
  wheelSize?: number;
  initialSpeed?: number;
}

export const SpinningCategoryWheel = ({
  categories,
  wheelSize = 480, // Default size for desktop
  initialSpeed = 0.3,
}: SpinningCategoryWheelProps) => {
  const router = useRouter();
  const controls = useAnimation();
  const wheelControls = useAnimation();
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const [isWheelHovered, setIsWheelHovered] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinDirection, setSpinDirection] = useState(1); // 1 for clockwise, -1 for counter-clockwise
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [showLandingHighlight, setShowLandingHighlight] = useState(false);
  const [isFloatingCardHovered, setIsFloatingCardHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Determine current device type on mount and resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewportSize({ width, height });
      setIsMobile(width < 768);
    };

    // Set initial values
    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Dynamically adjust wheel size based on viewport
  const responsiveWheelSize = useMemo(() => {
    if (viewportSize.width === 0) return wheelSize; // Default on first render

    // Scale wheel based on screen size
    if (viewportSize.width < 480) {
      return Math.min(viewportSize.width * 0.9, 340); // Mobile (90% of screen width, max 340px)
    } else if (viewportSize.width < 768) {
      return Math.min(viewportSize.width * 0.8, 420); // Small tablet
    } else if (viewportSize.width < 1024) {
      return Math.min(viewportSize.width * 0.6, 480); // Large tablet
    } else {
      return wheelSize; // Desktop (use prop value)
    }
  }, [viewportSize, wheelSize]);

  // Audio ref
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      spinSoundRef.current = new Audio("/sounds/revolver-spin.mp3");
      if (spinSoundRef.current) spinSoundRef.current.volume = 0.4;
    }
  }, []);

  // Play sound
  const playSpinSound = () => {
    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play().catch(() => {});
    }
  };

  // Dynamic speed control with smooth transitions
  const baseSpeed = useMotionValue(0); // Set initial speed to 0 (no automatic spinning)
  const springSpeed = useSpring(baseSpeed, {
    damping: 30,
    stiffness: 70,
    mass: 2,
  });
  const rotation = useMotionValue(0);

  // 3D perspective values
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const wheelPerspective = useMotionValue(1000);
  const wheelRotateX = useMotionValue(0);
  const wheelRotateY = useMotionValue(0);

  // Reactive values for 3D effects
  const wheelTransform = useTransform(
    [wheelRotateX, wheelRotateY, wheelPerspective],
    ([rx, ry, p]) => `perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg)`
  );

  // Wheel container ref for mouse position calculations
  const wheelRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!wheelRef.current || spinning) return;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setMousePosition({ x: mouseX - centerX, y: mouseY - centerY });

    // Calculate rotation values (limited range for subtle effect)
    const maxRotation = 5;
    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * maxRotation;
    const rotateX = ((centerY - mouseY) / (rect.height / 2)) * maxRotation;

    // Apply spring animations to the rotation values
    wheelRotateX.set(rotateX);
    wheelRotateY.set(rotateY);
  };

  // Reset 3D rotation when mouse leaves
  const handleMouseLeave = () => {
    wheelRotateX.set(0);
    wheelRotateY.set(0);
    setIsWheelHovered(false);
  };

  // Effects for continuous rotation with smooth transitions
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Set the target speed based on hover state
    if (isHovering !== null || isWheelHovered) {
      // Gradually slow down to a near stop when hovering
      baseSpeed.set(0);
    } else if (spinning) {
      // Keep the fast speed when spinning to a selection
      // This is handled in spinWheel
    } else {
      // No automatic spinning
      baseSpeed.set(0);
    }

    // Start the continuous animation (only applies when spinning)
    const animate = () => {
      rotation.set(rotation.get() + springSpeed.get() * spinDirection);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    isHovering,
    isWheelHovered,
    spinning,
    baseSpeed,
    spinDirection,
    rotation,
    springSpeed,
  ]);

  // Spin animation synchronized with sound
  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    playSpinSound();

    // Random target category
    const randomIndex = Math.floor(Math.random() * categories.length);
    setSelectedCategory(randomIndex);

    // Calculate how many full rotations plus the position of the selected category
    const categoryPosition = (randomIndex / categories.length) * 360;
    const targetRotation = rotation.get() + 1080 + categoryPosition; // 3 full rotations + category position

    // Fast initial speed then gradually slow down
    baseSpeed.set(30);

    // Spin animation sequence
    wheelControls.start({
      rotate: targetRotation,
      transition: {
        duration: 3,
        ease: [0.3, 0.01, 0.2, 0.99], // Custom cubic bezier for realistic inertia
        onComplete: () => {
          // Flash the indicator highlight
          setShowLandingHighlight(true);
          setTimeout(() => setShowLandingHighlight(false), 700);

          // Ensure all categories are visible after spin completes
          setTimeout(() => {
            document
              .querySelectorAll(".absolute.pointer-events-auto.z-20")
              .forEach((el) => {
                (el as HTMLElement).style.visibility = "visible";
                (el as HTMLElement).style.opacity = "1";
              });

            setSpinning(false);
            router.push(`/store/category/${categories[randomIndex].slug}`);
          }, 1200);
        },
      },
    });
  };

  // Smart rotation: Bring a category to the indicator on hover
  const bringCategoryToIndicator = (index: number) => {
    if (spinning) return;

    // Simply update the selected category without rotating the wheel
    setIsHovering(index);

    // No wheel rotation on hover - removed for more professional experience
  };

  // Navigate to category
  const navigateToCategory = (index: number) => {
    if (spinning) return;
    router.push(`/store/category/${categories[index].slug}`);
  };

  // Calculate positions for each category pill based on inner circle - Modified for better positioning
  const getItemPosition = (index: number, total: number, radius: number) => {
    // Starting angle offset to position first item at the top
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2;

    // Calculate pill position on the circle
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Enhanced 3D curved text effect - adjusted for better depth perception
    const zRotation = -Math.sin(angle) * 22; // Slightly increased front/back curve (was 20)
    const xRotation = Math.cos(angle) * 15; // Slightly increased top/bottom curve (was 12)

    return {
      x,
      y,
      zRotation,
      xRotation,
      angle: (angle * 180) / Math.PI + 90,
    };
  };

  // Generate a gradient color for each pill
  const getCategoryColor = (
    index: number,
    total: number,
    customColor?: string
  ): { primary: string; secondary: string } => {
    if (customColor)
      return {
        primary: customColor,
        secondary: customColor,
      };

    // Generate more sophisticated color palette around the hue spectrum
    const baseHue = (index / total) * 360;
    const primary = `hsl(${baseHue}, 80%, 55%)`;
    const secondary = `hsl(${(baseHue + 30) % 360}, 70%, 45%)`;

    return { primary, secondary };
  };

  // Calculate blur amount based on speed with more precision
  const blurAmount = useTransform(springSpeed, [0, 5, 15, 30], [0, 1, 4, 8]);

  // Calculate wheel dimensions - optimized for better centering and responsiveness
  const radius = responsiveWheelSize / 2 - 30; // Outer rim
  const categoryLineRadius = responsiveWheelSize * 0.35; // Circular line radius
  const innerRadius = categoryLineRadius; // Match innerRadius to categoryLineRadius for perfect alignment
  const orbRadius = categoryLineRadius * 0.8; // Position orbs inside the circular line (above markers)
  const hubSize = responsiveWheelSize * 0.22; // Center hub size

  // Fix for disappearing pills - ensure all pills are visible regardless of wheel rotation
  const fixedCategories = [...categories].map((category, index) => ({
    ...category,
    originalIndex: index,
  }));

  // Dynamic glow color based on spinning state
  const glowColor = spinning ? "120,160,255" : "80,100,180";

  // Update the markers placement to ensure perfect circular distribution
  const getMarkerPositions = () => {
    // Ensure an evenly distributed circle of markers for each category
    const markers = [];

    for (let i = 0; i < categories.length; i++) {
      const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
      const markerIndex = Math.round((angle / (Math.PI * 2)) * 24) % 24;
      markers.push(markerIndex);
    }

    return markers;
  };

  // Get the marker positions for consistent alignment
  const markerPositions = getMarkerPositions();

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      {/* Portaled floating cards for categories - positioned absolutely relative to viewport for full visibility */}
      {fixedCategories.map((category, index) => {
        const shouldShowFloatingCard =
          (isHovering === index && (isFloatingCardHovered || !isMobile)) ||
          (isMobile && selectedCategory === index);

        if (!shouldShowFloatingCard) return null;

        const { primary, secondary } = getCategoryColor(
          index,
          categories.length,
          category.color
        );

        // More vibrant colors for enhanced contrast
        const enhancedPrimary = primary.replace("55%", "62%");
        const enhancedSecondary = secondary.replace("45%", "52%");

        // Get wheel position to position card correctly
        const wheelRect = wheelRef.current?.getBoundingClientRect();
        if (!wheelRect) return null;

        // Calculate the category's position (similar to the orb calculation)
        const totalCategories = fixedCategories.length;
        const preciseAngle =
          (index / totalCategories) * Math.PI * 2 - Math.PI / 2;
        const orbRadius = categoryLineRadius * 1.2;
        const orbX = Math.cos(preciseAngle) * orbRadius;
        const orbY = Math.sin(preciseAngle) * orbRadius;

        // Calculate absolute position for the floating card
        const orbCenterX = wheelRect.left + wheelRect.width / 2 + orbX;
        const orbCenterY = wheelRect.top + wheelRect.height / 2 + orbY;

        // Adjust position to ensure card is visible within viewport
        let cardLeft = orbCenterX;
        let cardTop = orbCenterY - (isMobile ? 110 : 90); // Position above the orb

        // Edge case handling to keep card in viewport
        const viewportPadding = 20;
        const cardWidth = 150;
        const cardHeight = 120;

        if (cardLeft < viewportPadding) cardLeft = viewportPadding;
        if (cardLeft + cardWidth > window.innerWidth - viewportPadding) {
          cardLeft = window.innerWidth - cardWidth - viewportPadding;
        }

        if (cardTop < viewportPadding) cardTop = orbCenterY + 50; // Move below if too high

        return createPortal(
          <motion.div
            key={`floating-card-${category.slug}`}
            className="fixed z-[1000] pointer-events-auto"
            style={{
              left: cardLeft - cardWidth / 2,
              top: cardTop,
              width: cardWidth,
            }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
            onHoverStart={() => setIsFloatingCardHovered(true)}
            onHoverEnd={() => {
              setIsFloatingCardHovered(false);
              // Only clear hover on desktop
              if (!isMobile) {
                setTimeout(() => {
                  if (!isFloatingCardHovered) {
                    setIsHovering(null);
                  }
                }, 100);
              }
            }}
            // Make sure card is interactive on mobile
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
          >
            {/* Apple-style floating card with enhanced accessibility */}
            <div
              className="backdrop-blur-md rounded-xl overflow-hidden w-full"
              style={{
                background: "rgba(25, 25, 30, 0.85)",
                boxShadow: `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 0.5px rgba(255, 255, 255, 0.1), 0 0 15px ${enhancedPrimary}40`,
                border: "0.5px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              {/* Card header with category color */}
              <div
                className="h-[5px] w-full"
                style={{
                  background: `linear-gradient(to right, ${enhancedPrimary}, ${enhancedSecondary})`,
                }}
              />

              {/* Card content */}
              <div className="p-3">
                <h4 className="text-white font-medium text-sm mb-1">
                  {category.name}
                </h4>

                {/* Apple-style button with proper link */}
                <Link
                  href={`/store/category/${category.slug}`}
                  className="mt-2 py-1.5 px-3 text-[11px] font-medium rounded-full text-white inline-block cursor-pointer"
                  style={{
                    background: `linear-gradient(to bottom, ${enhancedPrimary}, ${enhancedSecondary})`,
                    boxShadow: `0 2px 8px ${enhancedPrimary}50`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent double navigation
                  }}
                >
                  View Category
                </Link>
              </div>
            </div>

            {/* Visual connector line */}
            <div
              className="absolute bottom-[-22px] left-1/2 transform -translate-x-1/2 h-[20px] w-[1px]"
              style={{
                background: `linear-gradient(to bottom, ${enhancedPrimary}80, transparent)`,
              }}
            />
          </motion.div>,
          document.body
        );
      })}

      {/* Atomic particle effects - positioned outside wheel for better performance */}
      <div
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{ zIndex: 5 }}
      >
        {fixedCategories.map((category, index) => {
          const totalCategories = fixedCategories.length;
          const preciseAngle =
            (index / totalCategories) * Math.PI * 2 - Math.PI / 2;

          // Calculate the inward position for the orb (above/inside the marker)
          const orbX = Math.cos(preciseAngle) * orbRadius;
          const orbY = Math.sin(preciseAngle) * orbRadius;

          const { primary } = getCategoryColor(
            index,
            categories.length,
            category.color
          );

          const enhancedPrimary = primary.replace("55%", "62%");

          return (
            <React.Fragment key={`particles-${category.slug}`}>
              {/* Electron orbit particles */}
              {[...Array(3)].map((_, i) => {
                const orbitRadius = (25 + i * 8) * (isMobile ? 0.8 : 1);
                const speed = 3 + i * 1.5;
                const delay = i * 0.5 + index * 0.2;
                const particleSize = 2 + i * 1;

                return (
                  <motion.div
                    key={`electron-${index}-${i}`}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: particleSize,
                      height: particleSize,
                      x: responsiveWheelSize / 2 + orbX - particleSize / 2,
                      y: responsiveWheelSize / 2 + orbY - particleSize / 2,
                      background: `radial-gradient(circle, white, ${enhancedPrimary})`,
                      boxShadow: `0 0 ${particleSize * 2}px ${enhancedPrimary}`,
                      zIndex: 25,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      scale: {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      },
                      opacity: {
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    {/* Particle orbit path */}
                    <motion.div
                      className="absolute"
                      style={{
                        width: particleSize,
                        height: particleSize,
                        transformOrigin: "center",
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: speed,
                        repeat: Infinity,
                        ease: "linear",
                        delay: delay,
                      }}
                    >
                      <motion.div
                        className="absolute rounded-full"
                        style={{
                          width: particleSize,
                          height: particleSize,
                          x: orbitRadius,
                          background: enhancedPrimary,
                          boxShadow: `0 0 ${
                            particleSize * 2
                          }px ${enhancedPrimary}`,
                        }}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* Energy wave effects */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 60,
                  height: 60,
                  x: responsiveWheelSize / 2 + orbX - 30,
                  y: responsiveWheelSize / 2 + orbY - 30,
                  border: `1px solid ${enhancedPrimary}50`,
                  zIndex: 24,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4 + (index % 3),
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Secondary energy wave for layered effect */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 40,
                  height: 40,
                  x: responsiveWheelSize / 2 + orbX - 20,
                  y: responsiveWheelSize / 2 + orbY - 20,
                  border: `1px solid ${enhancedPrimary}70`,
                  zIndex: 24,
                }}
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 3.5 + (index % 2),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
            </React.Fragment>
          );
        })}
      </div>

      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{
          width: responsiveWheelSize,
          height: responsiveWheelSize,
          maxWidth: "100%", // Ensure wheel doesn't overflow on small screens
          margin: "0 auto", // Center horizontally
        }}
        ref={wheelRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsWheelHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dynamic ambient background glow effect */}
        <motion.div
          className="absolute inset-[-20px] rounded-full"
          animate={{
            background: spinning
              ? [
                  `radial-gradient(circle, rgba(${glowColor},0.25) 0%, rgba(30,40,80,0.05) 50%, rgba(10,15,30,0) 70%)`,
                  `radial-gradient(circle, rgba(${glowColor},0.35) 0%, rgba(40,60,120,0.08) 50%, rgba(10,15,30,0) 70%)`,
                  `radial-gradient(circle, rgba(${glowColor},0.25) 0%, rgba(30,40,80,0.05) 50%, rgba(10,15,30,0) 70%)`,
                ]
              : `radial-gradient(circle, rgba(${glowColor},0.15) 0%, rgba(30,40,80,0.03) 50%, rgba(10,15,30,0) 70%)`,
            opacity: [0.7, 0.9, 0.7],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Environment reflection plane */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          <div
            className="absolute top-[3%] left-[5%] right-[5%] h-[30%] opacity-10 rounded-full blur-md"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
              transform: "rotateX(75deg)",
            }}
          />
        </div>

        {/* Wheel outer rim with 3D perspective - rotates with categories */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            boxShadow: spinning
              ? "0 0 80px rgba(0,20,60,0.4), inset 0 0 30px rgba(0,0,0,0.5)"
              : "0 0 60px rgba(0,0,0,0.3), inset 0 0 30px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            transformStyle: "preserve-3d",
          }}
          animate={wheelControls} // This makes the entire wheel rotate, not just the pills
          transition={{
            type: spinning ? "spring" : "tween",
            stiffness: spinning ? 50 : 300,
            damping: spinning ? 15 : 30,
          }}
        >
          {/* Supercar wheel texture - premium dark metallic finish */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at center, rgba(35,35,45,0.98) 0%, rgba(20,20,30,0.97) 50%, rgba(40,40,55,0.99) 100%)",
              boxShadow: "inset 0 0 50px rgba(0,0,0,0.6)",
              opacity: 0.95,
            }}
          />

          {/* Enhanced carbon fiber texture pattern with detailed weave */}
          <div
            className="absolute inset-0 rounded-full opacity-35"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='40' height='40' fill='%23000' filter='url(%23noise)' opacity='0.3'/%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z' fill='rgba(10,10,20,0.6)'/%3E%3C/svg%3E")`,
              backgroundSize: "8px 8px",
            }}
          />

          {/* Realistic performance tire tread pattern */}
          <div
            className="absolute rounded-full"
            style={{
              top: "2px",
              left: "2px",
              right: "2px",
              bottom: "2px",
              borderRadius: "50%",
              background:
                "repeating-conic-gradient(from 0deg, rgba(15,15,25,0.8) 0deg 3deg, rgba(35,35,45,0.8) 3deg 6deg)",
              opacity: 0.8,
            }}
          />

          {/* Inner wheel rim with premium finish */}
          <motion.div
            className="absolute rounded-full"
            style={{
              top: `${(responsiveWheelSize - radius * 2) / 2}px`,
              left: `${(responsiveWheelSize - radius * 2) / 2}px`,
              width: `${radius * 2}px`,
              height: `${radius * 2}px`,
              background:
                "radial-gradient(circle, rgba(190,190,220,0.9) 0%, rgba(90,90,120,0.95) 100%)",
              boxShadow:
                "inset 0 0 50px rgba(0,0,0,0.85), 0 0 20px rgba(255,255,255,0.1)",
            }}
          />

          {/* Circular line behind the category pills - adjusted to match new radius */}
          <div
            className="absolute rounded-full"
            style={{
              top: "50%",
              left: "50%",
              width: `${categoryLineRadius * 2}px`,
              height: `${categoryLineRadius * 2}px`,
              transform: "translate(-50%, -50%)",
              border: "2px solid rgba(100,120,180,0.3)",
              boxShadow:
                "inset 0 0 15px rgba(70,90,140,0.2), 0 0 10px rgba(70,90,140,0.2)",
              zIndex: 15,
            }}
          >
            {/* Subtle track lighting effect */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div
                className="absolute inset-[-2px] rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(100,140,255,0.15), rgba(100,140,255,0), rgba(100,140,255,0), rgba(100,140,255,0.15), rgba(100,140,255,0), rgba(100,140,255,0), rgba(100,140,255,0.15))",
                  opacity: 0.7,
                }}
              />
            </div>

            {/* Category markers around the track - Now enhanced as main markers */}
            {Array.from({ length: categories.length }).map((_, i) => {
              const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;

              // This is our main marker for each category
              const x = Math.cos(angle) * categoryLineRadius;
              const y = Math.sin(angle) * categoryLineRadius;

              // Get color for the marker
              const { primary, secondary } = getCategoryColor(
                i,
                categories.length,
                categories[i].color
              );

              const enhancedPrimary = primary.replace("55%", "65%");

              // Visual line connecting orb to marker
              const innerX = Math.cos(angle) * orbRadius;
              const innerY = Math.sin(angle) * orbRadius;
              const connectionLength = Math.sqrt(
                Math.pow(x - innerX, 2) + Math.pow(y - innerY, 2)
              );
              const connectionAngle =
                Math.atan2(y - innerY, x - innerX) * (180 / Math.PI);

              return (
                <React.Fragment key={`marker-group-${i}`}>
                  <motion.div
                    key={`marker-${i}`}
                    className="absolute rounded-full"
                    style={{
                      width: "12px",
                      height: "12px",
                      left: "50%",
                      top: "50%",
                      transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                      background: `${enhancedPrimary}`,
                      boxShadow: `0 0 10px ${enhancedPrimary}`,
                      zIndex: 16,
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      scale: 1.2,
                      boxShadow: `0 0 15px ${enhancedPrimary}`,
                    }}
                  >
                    {/* Marker glow effect */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: "18px",
                        height: "18px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background: `radial-gradient(circle, ${enhancedPrimary}60 0%, transparent 70%)`,
                        opacity: 0.7,
                        zIndex: 14,
                      }}
                      animate={{
                        opacity: [0.7, 0.9, 0.7],
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Connection line from orb to marker */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      width: `${connectionLength}px`,
                      height: "1.5px",
                      left: "50%",
                      top: "50%",
                      transformOrigin: "left center",
                      transform: `translate(calc(${innerX}px - 0%), calc(${innerY}px - 50%)) rotate(${connectionAngle}deg)`,
                      background: `linear-gradient(to right, ${enhancedPrimary}70, ${enhancedPrimary}40)`,
                      zIndex: 15,
                      opacity: 0.7,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </div>

          {/* Premium metallic rim highlights - directional light */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 40%, rgba(0,0,0,0.4) 100%)",
              filter: "blur(1px)",
              opacity: spinning ? 0.8 : 0.7,
            }}
          />

          {/* Dynamic light reflections that rotate opposite to wheel */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
            style={{
              background:
                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 70%)",
              opacity: 0.6,
            }}
            animate={{ rotate: spinning ? [0, -360] : [0, 0] }}
            transition={{
              duration: spinning ? 8 : 0,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Wheel bolts around center - premium machined finish */}
          {Array.from({ length: 5 }).map((_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const boltX = Math.cos(angle) * (hubSize * 0.85);
            const boltY = Math.sin(angle) * (hubSize * 0.85);

            return (
              <div
                key={`bolt-${i}`}
                className="absolute rounded-full z-10"
                style={{
                  top: "50%",
                  left: "50%",
                  width: "12px",
                  height: "12px",
                  transform: `translate(calc(${boltX}px - 50%), calc(${boltY}px - 50%))`,
                  background: "linear-gradient(145deg, #888, #444)",
                  boxShadow:
                    "inset 1px 1px 3px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.5)",
                  border: "1px solid #222",
                }}
              >
                {/* Bolt head detail */}
                <div
                  className="absolute inset-[3px] rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #555, #333)",
                    boxShadow: "inset 0 0 2px rgba(0,0,0,0.8)",
                  }}
                />
              </div>
            );
          })}

          {/* Wheel center cap base with luxury finish */}
          <div
            className="absolute rounded-full"
            style={{
              top: "50%",
              left: "50%",
              width: `${hubSize * 1.4}px`,
              height: `${hubSize * 1.4}px`,
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(60,60,80,0.95) 0%, rgba(25,25,35,0.98) 100%)",
              boxShadow:
                "inset 0 0 25px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              zIndex: 5,
            }}
          />

          {/* Supercar wheel spokes - Y-shaped design with premium details */}
          {Array.from({ length: 5 }).map((_, i) => {
            const baseAngle = (i / 5) * 360;
            return (
              <React.Fragment key={`spoke-group-${i}`}>
                {/* Main spoke with metallic finish and detailed lighting */}
                <div
                  className="absolute top-1/2 left-1/2 origin-center"
                  style={{
                    width: `${radius - hubSize / 2 + 10}px`,
                    height: "8px",
                    transform: `translate(-${
                      (radius - hubSize / 2) / 2 + 5
                    }px, -4px) rotate(${baseAngle}deg)`,
                    background:
                      "linear-gradient(to right, rgba(130,130,160,0.9), rgba(60,60,90,0.7))",
                    boxShadow:
                      "0 1px 5px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.3)",
                    borderRadius: "4px",
                    zIndex: 4,
                    overflow: "hidden",
                  }}
                >
                  {/* Spoke highlight effect */}
                  <div
                    className="absolute inset-y-0 left-0 right-1/2"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(255,255,255,0.1), transparent)",
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Y-fork left with enhanced detail */}
                <div
                  className="absolute top-1/2 left-1/2 origin-[100%_50%]"
                  style={{
                    width: `${radius * 0.3}px`,
                    height: "6px",
                    transform: `translate(-${
                      radius - hubSize / 2
                    }px, -3px) rotate(${baseAngle - 25}deg)`,
                    background:
                      "linear-gradient(to right, rgba(100,100,130,0.7), rgba(130,130,160,0.9))",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    borderRadius: "3px",
                    zIndex: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(255,255,255,0.1))",
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Y-fork right with enhanced detail */}
                <div
                  className="absolute top-1/2 left-1/2 origin-[100%_50%]"
                  style={{
                    width: `${radius * 0.3}px`,
                    height: "6px",
                    transform: `translate(-${
                      radius - hubSize / 2
                    }px, -3px) rotate(${baseAngle + 25}deg)`,
                    background:
                      "linear-gradient(to right, rgba(100,100,130,0.7), rgba(130,130,160,0.9))",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    borderRadius: "3px",
                    zIndex: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 w-1/2"
                    style={{
                      background:
                        "linear-gradient(to right, transparent, rgba(255,255,255,0.1))",
                      opacity: 0.7,
                    }}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {/* Category orbs - with enhanced atomic animation */}
          {fixedCategories.map((category, index) => {
            // Ensure even distribution of category markers around the wheel
            const totalCategories = fixedCategories.length;
            const preciseAngle =
              (index / totalCategories) * Math.PI * 2 - Math.PI / 2;

            const { zRotation, xRotation } = getItemPosition(
              index,
              totalCategories,
              orbRadius // Using orbRadius for positioning inside the circular track
            );

            // Calculate proper angle to match the marker positions
            const angle = (preciseAngle * 180) / Math.PI + 90;

            const { primary, secondary } = getCategoryColor(
              index,
              totalCategories,
              category.color
            );

            // Calculate distance from indicator (at top position)
            const itemAngle = (index / totalCategories) * 360;
            const currentWheelAngle = ((rotation.get() % 360) + 360) % 360; // Normalize to 0-360
            const angleDifference = Math.abs(
              (currentWheelAngle - itemAngle + 360) % 360
            );
            const isNearIndicator =
              angleDifference < 30 || angleDifference > 330;

            // More vibrant colors for enhanced contrast
            const enhancedPrimary = primary.replace("55%", "62%");
            const enhancedSecondary = secondary.replace("45%", "52%");

            // Calculate the inward position for the orb (above/inside the marker)
            const orbX = Math.cos(preciseAngle) * orbRadius;
            const orbY = Math.sin(preciseAngle) * orbRadius;

            // Determine if this category should show its floating card (mobile UX)
            const shouldShowFloatingCard =
              (isHovering === index && (isFloatingCardHovered || !isMobile)) ||
              (isMobile && selectedCategory === index);

            return (
              <motion.div
                key={`category-${category.slug}`}
                className="absolute pointer-events-auto z-20"
                style={{
                  left: "50%",
                  top: "50%",
                  x: orbX, // Position inside the circular line
                  y: orbY, // Position inside the circular line
                  rotate: angle,
                  filter: spinning ? `blur(${blurAmount.get()}px)` : "none",
                  zIndex: shouldShowFloatingCard ? 30 : 20,
                  transform: `translate(-50%, -50%) translateZ(0px)`, // Force GPU acceleration with explicit z value
                  // Ensure that category orbs are always visible with proper stacking
                  visibility: "visible",
                  opacity: 1, // Explicitly set opacity to 1
                  pointerEvents: "auto",
                }}
                onHoverStart={() => {
                  if (!spinning) {
                    setIsHovering(index);
                    // Removed bringCategoryToIndicator call to prevent wheel spinning on hover
                  }
                }}
                onHoverEnd={() => {
                  if (!isFloatingCardHovered) {
                    setIsHovering(null);
                  }
                }}
                onClick={() => {
                  if (isMobile) {
                    setSelectedCategory(index);
                  } else {
                    navigateToCategory(index);
                  }
                }}
                // Enhanced hover animation for better interactive feedback
                whileHover={{
                  scale: 1.08,
                  filter: "brightness(1.15)",
                  zIndex: 35,
                }}
                whileTap={{
                  scale: 0.95,
                  filter: "brightness(0.95)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 15,
                  opacity: { duration: 0 }, // Ensure opacity transitions are instantaneous
                }}
                // Force orbs to remain visible
                animate={{
                  opacity: 1,
                  visibility: "visible",
                }}
              >
                {/* Innovative Circular Category Orb with Dynamic Content */}
                <motion.div
                  className="relative flex items-center justify-center transform cursor-pointer"
                  style={{
                    width: isMobile ? "32px" : "38px", // Slightly smaller on mobile
                    height: isMobile ? "32px" : "38px", // Slightly smaller on mobile
                    transform: `translateX(-50%) translateY(-50%) rotate(${-angle}deg) perspective(800px) rotateX(${xRotation}deg) rotateZ(${zRotation}deg)`,
                    transformStyle: "preserve-3d",
                    willChange: "transform, opacity", // Performance hint
                    backfaceVisibility: "visible", // Ensure the back face is visible
                    opacity: 1, // Explicitly set opacity
                  }}
                  // Continuous subtle pulsing animation
                  animate={{
                    boxShadow: [
                      `0 0 10px ${enhancedPrimary}50`,
                      `0 0 15px ${enhancedPrimary}70`,
                      `0 0 10px ${enhancedPrimary}50`,
                    ],
                    scale: [1, 1.03, 1],
                    opacity: 1, // Keep opacity locked at 1
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3 + (index % 3), // Slightly different timing for each orb
                    ease: "easeInOut",
                    opacity: { duration: 0 }, // Ensure opacity transitions are instantaneous
                  }}
                  initial={{ opacity: 1 }}
                >
                  {/* Main circular orb with premium finish */}
                  <motion.div
                    className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${enhancedPrimary}, ${enhancedSecondary})`,
                      boxShadow:
                        shouldShowFloatingCard ||
                        (isNearIndicator && showLandingHighlight)
                          ? `0 0 20px ${enhancedPrimary}90, 0 10px 20px rgba(0,0,0,0.4), inset 0 0 10px ${enhancedPrimary}50`
                          : `0 10px 20px rgba(0,0,0,0.3), inset 0 0 5px ${enhancedPrimary}20`,
                      border: `1px solid ${
                        isNearIndicator
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(255,255,255,0.2)"
                      }`,
                      backdropFilter: "blur(8px)",
                      opacity: 1,
                    }}
                  >
                    {/* Animated glow effect inside the orb */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, transparent 40%, ${enhancedPrimary}30 100%)`,
                        opacity: 0.6,
                      }}
                      animate={{
                        opacity: [0.6, 0.8, 0.6],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "easeInOut",
                      }}
                    />

                    {/* Subtle moving light reflection */}
                    <motion.div
                      className="absolute w-full h-full rounded-full overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)`,
                        opacity: 0.7,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 15,
                        ease: "linear",
                      }}
                    />

                    {/* Nucleus energy pulse effect */}
                    <motion.div
                      className="absolute w-[15px] h-[15px] rounded-full"
                      style={{
                        background: `radial-gradient(circle, white, ${enhancedPrimary})`,
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        opacity: 0.7,
                        boxShadow: `0 0 10px ${enhancedPrimary}`,
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 0.9, 0.7],
                        boxShadow: [
                          `0 0 5px ${enhancedPrimary}`,
                          `0 0 10px ${enhancedPrimary}`,
                          `0 0 5px ${enhancedPrimary}`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Inner content container */}
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* First letter of category for minimal design */}
                    <motion.span
                      className="font-bold text-white relative"
                      style={{
                        fontSize:
                          category.name.length > 10
                            ? "10px"
                            : category.name.length > 6
                            ? "12px"
                            : "14px",
                        letterSpacing: "0.02em",
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                      animate={{
                        textShadow: [
                          "0 1px 3px rgba(0,0,0,0.5)",
                          "0 1px 5px rgba(0,0,0,0.7)",
                          "0 1px 3px rgba(0,0,0,0.5)",
                        ],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                      }}
                    >
                      {/* Show first letter for large orbs, abbreviate for smaller ones */}
                      {category.name.charAt(0).toUpperCase()}
                    </motion.span>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced indicator at the top - outside the rotating wheel */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
          <motion.div
            className={`w-3 h-7 rounded-full mb-1 relative`}
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(200,220,255,0.85))",
            }}
            animate={{
              boxShadow: showLandingHighlight
                ? [
                    "0 0 5px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(100,150,255,0.8)",
                    "0 0 5px rgba(255,255,255,0.5)",
                  ]
                : "0 0 8px rgba(255,255,255,0.5)",
            }}
            transition={{ duration: 0.7, repeat: showLandingHighlight ? 2 : 0 }}
          >
            {/* Inner glow for indicator */}
            <div
              className="absolute inset-x-0 top-0 h-1/2 rounded-t-full"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)",
                opacity: 0.7,
              }}
            />
          </motion.div>
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{
              filter: showLandingHighlight
                ? "drop-shadow(0 0 5px rgba(100,150,255,0.8))"
                : "drop-shadow(0 0 3px rgba(255,255,255,0.5))",
            }}
          >
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-white/80" />
          </div>
        </div>

        {/* Ultra-premium 3D spin button with advanced hover effects */}
        <div
          className="absolute z-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            width: hubSize,
            height: hubSize,
            filter: spinning
              ? "drop-shadow(0 0 15px rgba(80,130,255,0.4))"
              : "",
            transition: "filter 0.3s ease",
          }}
        >
          <motion.div
            className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden cursor-pointer"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
            whileHover={{
              scale: 1.05,
              filter: "brightness(1.2)",
            }}
            whileTap={{
              scale: 0.95,
              filter: "brightness(0.9)",
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 12,
            }}
            onClick={spinning ? undefined : spinWheel}
          >
            {/* 3D button base with improved metallic finish */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(70,90,140,0.9) 0%, rgba(30,35,60,0.95) 100%)",
                boxShadow:
                  "inset 0 -4px 8px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.2), 0 0 20px rgba(80,120,220,0.3)",
                border: "1px solid rgba(100,130,200,0.4)",
              }}
            />

            {/* Premium glow effect */}
            <div
              className="absolute inset-[2px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgba(100,140,240,0.7) 0%, rgba(50,70,120,0.8) 100%)",
                boxShadow:
                  "inset 0 -3px 10px rgba(0,0,0,0.4), inset 0 3px 10px rgba(255,255,255,0.3)",
                opacity: 0.9,
              }}
            />

            {/* Dynamic light reflections */}
            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
              style={{
                background:
                  "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 70%)",
                opacity: 0.7,
              }}
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Interactive button pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(100,150,255,0.2) 0%, transparent 70%)",
                opacity: 0.8,
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Enhanced 3D text with advanced lighting effects */}
            <motion.div
              className="relative flex items-center justify-center z-10"
              whileHover={{
                scale: 1.1,
                y: -2,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 10,
              }}
            >
              {/* Ultra-premium 3D shadowed text */}
              <motion.div
                className="relative"
                style={{
                  perspective: "500px",
                  transformStyle: "preserve-3d",
                }}
                whileHover={{
                  rotateY: [0, 5, 0, -5, 0],
                  rotateX: [0, -2, 0, 2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="text-lg font-black tracking-wider"
                  style={{
                    color: spinning ? "#80b4ff" : "white",
                    background: spinning
                      ? "linear-gradient(to bottom, #a0d8ff, #60a0ff)"
                      : "linear-gradient(to bottom, #ffffff, #e0e0ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    textShadow:
                      "0 0 10px rgba(100,150,255,0.8), 0 2px 4px rgba(0,0,0,0.3)",
                  }}
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(100,150,255,0.8), 0 2px 4px rgba(0,0,0,0.3)",
                      "0 0 15px rgba(130,180,255,0.9), 0 2px 5px rgba(0,0,0,0.4)",
                      "0 0 10px rgba(100,150,255,0.8), 0 2px 4px rgba(0,0,0,0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  SPIN
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Clickable cursor indicator */}
            <motion.div
              className="absolute bottom-[10%] right-[10%] w-6 h-6 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [0.95, 1, 0.95],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 5H9M5 1V9"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            {/* Enhanced ripple effect on click */}
            {spinning && (
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                initial={{ opacity: 0.8, scale: 0.3 }}
                animate={{
                  opacity: 0,
                  scale: 2.5,
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.2, 0.8, 0.2, 1.0],
                }}
                style={{
                  background:
                    "radial-gradient(circle, rgba(130,190,255,0.5) 0%, transparent 70%)",
                  zIndex: 40,
                }}
              />
            )}
          </motion.div>
        </div>

        {/* Style for animations */}
        <style jsx global>{`
          @keyframes liquidFlow {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 300% 300%;
            }
          }

          @keyframes bubbleMove {
            0%,
            100% {
              transform: translate(0%, 0%) scale(1);
              opacity: 0.4;
            }
            50% {
              transform: translate(20%, 20%) scale(1.4);
              opacity: 0.6;
            }
          }

          @keyframes pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.05);
              opacity: 1;
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          @keyframes floatEffect {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          /* Ensure all category orbs remain visible regardless of wheel rotation */
          .absolute.pointer-events-auto.z-20 {
            visibility: visible !important;
            opacity: 1 !important;
            backface-visibility: visible !important;
            transition: transform 0.3s, filter 0.3s, z-index 0s !important;
            will-change: transform, filter;
          }

          /* Force visibility of inner orb components */
          .absolute.pointer-events-auto.z-20 * {
            backface-visibility: visible !important;
            opacity: 1 !important;
            transform-style: preserve-3d !important;
          }

          /* Enhance perspective for better 3D appearance */
          .motion-div {
            transform-style: preserve-3d;
            backface-visibility: visible;
          }

          @media (max-width: 768px) {
            .motion-div {
              transform-style: flat !important;
            }
          }

          /* Touch device optimizations */
          @media (hover: none) {
            .absolute.pointer-events-auto.z-20 {
              transform: scale(1.05) !important;
            }
          }

          /* Ensure content is readable on smaller screens */
          @media (max-width: 480px) {
            .mt-2.py-1\.5.px-3 {
              padding: 6px 10px;
            }
          }
        `}</style>

        {/* Enhanced particle effects - only visible when spinning or on hover */}
        {(spinning || isWheelHovered) && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => {
              const size = 2 + Math.random() * 4;
              const startAngle = Math.random() * 360;
              const distance =
                (responsiveWheelSize / 2) * (0.5 + Math.random() * 0.5);
              const duration = 0.5 + Math.random() * 1.5;
              const delay = Math.random() * 0.5;

              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: "50%",
                    top: "50%",
                    background: `rgba(${
                      Math.random() > 0.5 ? "140, 180, 255" : "200, 220, 255"
                    }, ${0.3 + Math.random() * 0.5})`,
                    boxShadow: `0 0 ${size * 2}px rgba(140, 180, 255, 0.7)`,
                    zIndex: 60,
                  }}
                  initial={{
                    x:
                      Math.cos(startAngle * (Math.PI / 180)) * distance -
                      size / 2,
                    y:
                      Math.sin(startAngle * (Math.PI / 180)) * distance -
                      size / 2,
                    opacity: 0,
                  }}
                  animate={{
                    x: [
                      Math.cos(startAngle * (Math.PI / 180)) * distance -
                        size / 2,
                      Math.cos((startAngle + 30) * (Math.PI / 180)) *
                        (distance + 20) -
                        size / 2,
                      Math.cos((startAngle + 60) * (Math.PI / 180)) * distance -
                        size / 2,
                    ],
                    y: [
                      Math.sin(startAngle * (Math.PI / 180)) * distance -
                        size / 2,
                      Math.sin((startAngle + 30) * (Math.PI / 180)) *
                        (distance + 20) -
                        size / 2,
                      Math.sin((startAngle + 60) * (Math.PI / 180)) * distance -
                        size / 2,
                    ],
                    opacity: [0, spinning ? 0.8 : 0.5, 0],
                  }}
                  transition={{
                    duration: duration,
                    delay: delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Enhanced shine effect when spinning */}
        {spinning && (
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.8, 0, 0.6, 0],
            }}
            transition={{
              duration: 3,
              times: [0, 0.2, 0.5, 0.7, 1],
              ease: "easeInOut",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 80%, transparent 100%)`,
                transform: "rotate(30deg) scale(1.5)",
                animation: "shimmer 3s linear infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </motion.div>
        )}

        {/* Victory celebration effect when landing on selection */}
        {showLandingHighlight && (
          <motion.div
            className="absolute inset-[-20px] pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.7, times: [0, 0.2, 1] }}
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const size = 3 + Math.random() * 6;
              const angle = Math.random() * 360;
              const distance = responsiveWheelSize * 0.6 * Math.random();
              const duration = 0.5 + Math.random() * 0.5;

              return (
                <motion.div
                  key={`confetti-${i}`}
                  className="absolute rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    left: "50%",
                    top: "50%",
                    background: `hsl(${(i * 30) % 360}, 80%, 60%)`,
                    boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.7)`,
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0.3,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.cos(angle * (Math.PI / 180)) * distance,
                    y: Math.sin(angle * (Math.PI / 180)) * distance,
                    scale: 1,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: duration,
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </motion.div>
        )}

        {/* Floating effect for the entire wheel component */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            y: [0, -5, 0, 3, 0],
            x: [0, 3, 0, -3, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Mobile closing button - Only shows when a category card is open */}
        <AnimatePresence>
          {isMobile && selectedCategory !== null && (
            <motion.button
              className="absolute top-[-50px] right-0 z-50 bg-black/60 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center"
              style={{
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCategory(null);
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5L5 15M5 5L15 15"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
