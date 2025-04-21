"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { FloatingMessageCard } from "./FloatingMessageCard";
import { CategoryTitle } from "./CategoryTitle";
import { useNavigationStore } from "@/store/navigationStore";

// For caching
const CACHE_PREFIX = "category_data_";
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

interface CategoryItem {
  name: string;
  slug: string;
  color?: string;
}

interface OrbitalCategoryUniverseProps {
  categories: CategoryItem[];
  containerSize?: number;
  title?: string;
  description?: string;
}

interface OrbitalLayer {
  radius: number;
  speed: number;
  direction: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  orbSize: number;
}

export const OrbitalCategoryUniverse = ({
  categories,
  containerSize = 480, // Default size for desktop
  title,
  description,
}: OrbitalCategoryUniverseProps) => {
  const router = useRouter();
  const universeRef = useRef<HTMLDivElement>(null);
  const [activeOrbIndex, setActiveOrbIndex] = useState<number | null>(null);
  const [isFloatingCardHovered, setIsFloatingCardHovered] = useState(false);
  const [isUniverseHovered, setIsUniverseHovered] = useState(false);
  const [randomMessageOrbIndex, setRandomMessageOrbIndex] = useState<
    number | null
  >(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [autoShowCard, setAutoShowCard] = useState<number | null>(null);
  const [draggedOrbIndex, setDraggedOrbIndex] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResultIndex, setSpinResultIndex] = useState<number | null>(null);
  const orbControls = useAnimation();
  const globalOrbControls = useAnimation();
  // New state to track recently hovered orbs for message persistence
  const [recentlyHoveredOrbs, setRecentlyHoveredOrbs] = useState<{
    [key: number]: boolean;
  }>({});
  const recentlyHoveredTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});
  // Reference for timeouts that hide orb cards automatically
  const orbHideTimeouts = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Audio ref for spin sound
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);

  // 3D perspective values for tilt effect
  const universePerspective = useMotionValue(1000);
  const universeRotateX = useMotionValue(0);
  const universeRotateY = useMotionValue(0);

  // Reactive values for 3D effects
  const universeTransform = useTransform(
    [universeRotateX, universeRotateY, universePerspective],
    ([rx, ry, p]) => `perspective(${p}px) rotateX(${rx}deg) rotateY(${ry}deg)`
  );

  // Custom hook for orbital animation
  const [orbitalAngles, setOrbitalAngles] = useState<number[]>(
    Array(categories.length).fill(0)
  );

  // State to track if animation is paused due to hover
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  // Store the last animation timestamps to continue from where we left off
  const lastAnimationTime = useRef(0);
  const pausedElapsedTime = useRef(0);

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

      // Clear all orb hide timeouts
      Object.values(orbHideTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });

      // Clear existing hover timeouts
      Object.values(recentlyHoveredTimeouts.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Dynamically adjust container size based on viewport
  const responsiveContainerSize = useMemo(() => {
    if (viewportSize.width === 0) return containerSize; // Default on first render

    // Scale container based on screen size
    if (viewportSize.width < 480) {
      return Math.min(viewportSize.width * 0.9, 340); // Mobile (90% of screen width, max 340px)
    } else if (viewportSize.width < 768) {
      return Math.min(viewportSize.width * 0.8, 420); // Small tablet
    } else if (viewportSize.width < 1024) {
      return Math.min(viewportSize.width * 0.6, 480); // Large tablet
    } else {
      return containerSize; // Desktop (use prop value)
    }
  }, [viewportSize, containerSize]);

  // Generate orbital system - distributes categories across different orbits
  const orbitalSystem = useMemo(() => {
    // Calculate universe dimensions
    const universeRadius = responsiveContainerSize / 2;

    // Define orbital layers - each with different radius, speed, and direction
    const orbitalLayers: OrbitalLayer[] = [
      {
        radius: universeRadius * 0.3,
        speed: 35,
        direction: 1,
        orbSize: universeRadius * 0.13,
      },
      {
        radius: universeRadius * 0.48,
        speed: 60,
        direction: -1,
        orbSize: universeRadius * 0.1,
      },
      {
        radius: universeRadius * 0.68,
        speed: 90,
        direction: 1,
        orbSize: universeRadius * 0.08,
      },
    ];

    // Distribute categories across the orbital layers
    const orbitalPositions = categories.map((category, index) => {
      // Determine which orbital layer this category belongs to
      const layerIndex = index % orbitalLayers.length;
      const layer = orbitalLayers[layerIndex];

      // Calculate starting position within the layer
      // Distribute categories in the same layer evenly
      const categoryCountInLayer = Math.ceil(
        categories.length / orbitalLayers.length
      );
      const positionInLayer = Math.floor(index / orbitalLayers.length);
      const angleInLayer =
        (positionInLayer / categoryCountInLayer) * Math.PI * 2;

      // Calculate initial x and y position
      const initialX = Math.cos(angleInLayer) * layer.radius;
      const initialY = Math.sin(angleInLayer) * layer.radius;

      return {
        category,
        layer,
        initialX,
        initialY,
        angle: angleInLayer,
        orbSize: layer.orbSize,
      };
    });

    return orbitalPositions;
  }, [categories, responsiveContainerSize]);

  // Track mouse movement for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!universeRef.current) return;

    const rect = universeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    setMousePosition({ x: mouseX - centerX, y: mouseY - centerY });

    // Calculate rotation values (limited range for subtle effect)
    const maxRotation = 6;
    const rotateY = ((mouseX - centerX) / (rect.width / 2)) * maxRotation;
    const rotateX = ((centerY - mouseY) / (rect.height / 2)) * maxRotation;

    // Apply spring animations to the rotation values
    universeRotateX.set(rotateX);
    universeRotateY.set(rotateY);

    // Pause animation on hover
    if (!isAnimationPaused) {
      setIsAnimationPaused(true);
      setIsUniverseHovered(true);
      // Store the elapsed time when we paused
      pausedElapsedTime.current = Date.now() - lastAnimationTime.current;
    }
  };

  // Reset 3D rotation when mouse leaves
  const handleMouseLeave = () => {
    universeRotateX.set(0);
    universeRotateY.set(0);
    setIsUniverseHovered(false);

    // Resume animation from where we left off
    setIsAnimationPaused(false);
    // Update the animation start time reference to maintain continuity
    lastAnimationTime.current = Date.now() - pausedElapsedTime.current;
  };

  // Set a recently hovered orb with timeout to clear after 3 seconds
  const setRecentlyHovered = (index: number | null) => {
    // Clear any existing timeout for this index
    if (index !== null && recentlyHoveredTimeouts.current[index]) {
      clearTimeout(recentlyHoveredTimeouts.current[index]);
    }

    if (index !== null) {
      // Set this orb as recently hovered
      setRecentlyHoveredOrbs((prev) => ({ ...prev, [index]: true }));

      // Set a timeout to clear this orb's hover state after 3 seconds
      recentlyHoveredTimeouts.current[index] = setTimeout(() => {
        setRecentlyHoveredOrbs((prev) => ({ ...prev, [index]: false }));
      }, 3000);
    }
  };

  // Calculate floating card position relative to the orb position
  const getFloatingCardPosition = (orbIndex: number, isWinningCard = false) => {
    // If it's a winning card, position it on the middle-right side of the container
    if (isWinningCard) {
      // Position at 80% of the container from left (20% from right),
      // and vertically centered (50% of container)
      return {
        x: responsiveContainerSize * 0.3,
        y: 0,
      };
    }

    const orbData = orbitalSystem[orbIndex];
    if (!orbData) return { x: 0, y: 0 };

    // Get current orb angle
    const angle = orbitalAngles[orbIndex];
    const { layer } = orbData;

    // Calculate current orb position
    const orbX = Math.cos(angle) * layer.radius;
    const orbY = Math.sin(angle) * layer.radius;

    // Calculate optimal card placement - to the outside of the orbit
    // Push card further out in the same direction as the orb
    const cardX = orbX * 1.25;
    const cardY = orbY * 1.25;

    return { x: cardX, y: cardY };
  };

  // Navigate to category - no delay
  const navigateToCategory = (index: number) => {
    const category = categories[index];
    const url = `/store/category/${category.slug}`;

    // Start navigation animation
    const { startNavigation } = useNavigationStore.getState();
    startNavigation(url);

    // Pre-fetch category data to cache
    preFetchCategoryData(category.slug, category.name);

    // Navigate to the category page
    router.push(url);
  };

  // Pre-fetch and cache category data
  const preFetchCategoryData = async (slug: string, categoryName: string) => {
    try {
      // Check if we already have cached data
      const cacheKey = `${CACHE_PREFIX}${slug}`;
      const cachedTimestampKey = `${cacheKey}_timestamp`;

      const cachedData = localStorage.getItem(cacheKey);
      const cachedTimestamp = localStorage.getItem(cachedTimestampKey);

      // If cache is valid and not expired, don't fetch again
      if (cachedData && cachedTimestamp) {
        const isExpired =
          Date.now() - parseInt(cachedTimestamp) > CACHE_EXPIRATION;
        if (!isExpired) return;
      }

      // Fetch products for this category in the background
      const response = await fetch("/api/products");
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success) return;

      // Filter products for this category
      const allProducts = data.data;
      const categoryProducts = allProducts.filter((product: any) => {
        const productCategories = product.categories || [];
        const productTags = product.tags || [];

        const tagMatch = productTags.some(
          (tag: string) =>
            tag.toLowerCase().includes(slug.toLowerCase()) ||
            slug.toLowerCase().includes(tag.toLowerCase())
        );

        return (
          productCategories.includes(categoryName) ||
          productTags.includes(categoryName.toLowerCase()) ||
          tagMatch
        );
      });

      // Cache the filtered data
      localStorage.setItem(cacheKey, JSON.stringify(categoryProducts));
      localStorage.setItem(cachedTimestampKey, Date.now().toString());

      // Also cache metadata about the category for faster page rendering
      localStorage.setItem(
        `${cacheKey}_meta`,
        JSON.stringify({
          name: categoryName,
          slug: slug,
          productCount: categoryProducts.length,
        })
      );
    } catch (error) {
      console.error("Error pre-fetching category data:", error);
    }
  };

  // Pre-fetch all categories data on component mount for better UX
  useEffect(() => {
    if (typeof window !== "undefined" && categories.length > 0) {
      categories.forEach((category) => {
        // Use a delayed fetch to not block the main thread
        setTimeout(() => {
          preFetchCategoryData(category.slug, category.name);
        }, 2000 + Math.random() * 3000); // Random delay between 2-5 seconds
      });
    }
  }, [categories]);

  // Spin the universe and select a random category
  const spinUniverse = () => {
    if (isSpinning) return;

    // Reset any active states and pause all idle animations
    setActiveOrbIndex(null);
    setRandomMessageOrbIndex(null);
    setAutoShowCard(null);
    setIsSpinning(true);
    setIsAnimationPaused(true); // Pause all idle animations

    // Play spin sound
    playSpinSound();

    // Pick a random category
    const randomIndex = Math.floor(Math.random() * categories.length);
    const winningCategory = categories[randomIndex];

    // Animate all orbs with a spinning motion - enhanced for realistic 360° spin
    // Store start angles to use for the spinning animation
    const startAngles = [...orbitalAngles];
    const startTime = Date.now();
    const spinDuration = 3000; // 3 seconds for a more satisfying spin

    // Create spin animation
    let spinAnimationId: number;

    const animateSpin = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / spinDuration, 1);

      // Enhanced multi-phase easing for a more cinematic spin effect
      const cinematicSpin = (t: number) => {
        // Apple-style spring easing curve with improved fluid motion
        if (t < 0.2) {
          // Initial quick acceleration phase (0-20% of animation)
          // Fast acceleration with slight anticipation feel
          return t * t * 3.5; // Stronger initial acceleration for snappier start
        } else if (t < 0.5) {
          // Peak velocity phase (20-50% of animation)
          // Maintain high speed with subtle physics-based fluctuations
          const normalized = (t - 0.2) / 0.3; // Normalize to 0-1 for this phase
          const baseVelocity = 0.14 + normalized * 0.5; // Base velocity increases gradually
          // Add harmonic oscillation for natural planetary motion feel
          const naturalVariation = Math.sin(normalized * Math.PI * 2) * 0.03;
          return baseVelocity + naturalVariation;
        } else if (t < 0.85) {
          // Deceleration phase (50-85% of animation)
          // Realistic gravitational slowing with inertial resistance
          const normalized = (t - 0.5) / 0.35; // Normalize to 0-1
          // Physics-based deceleration curve
          const decelCurve = 0.64 - Math.pow(normalized, 1.7) * 0.32;
          // Add subtle dampening oscillation
          const dampening =
            Math.sin(normalized * Math.PI * 1.5) * 0.02 * (1 - normalized);
          return decelCurve + dampening;
        } else {
          // Final settling phase (85-100% of animation)
          // Gentle easing into the final position with subtle elastic feel
          const normalized = (t - 0.85) / 0.15; // Normalize to 0-1

          // Elastic settling curve
          const settlingBase = 0.32 - normalized * 0.32; // Base curve approaching 0

          // Add diminishing oscillation that fades out for a natural elastic feel
          const elasticOscillation =
            Math.sin(normalized * Math.PI * 2.5) *
            Math.pow(1 - normalized, 1.8) *
            0.04;

          return settlingBase + elasticOscillation;
        }
      };

      // Apply enhanced easing to rotation (16 full rotations for a satisfying spin)
      const rotationAmount = cinematicSpin(progress) * (Math.PI * 32);

      // Apply 3D effects during spin for added immersion
      if (universeRef.current) {
        // Calculate current rotation speed for dynamic effects
        const prevProgress = Math.max(0, progress - 0.01);
        const prevRotation = cinematicSpin(prevProgress) * (Math.PI * 32);
        const instantRotationSpeed = (rotationAmount - prevRotation) * 100; // Normalized speed

        // Remove blur effect - content should always be sharp
        // Instead, only apply scale effects which don't affect clarity
        if (universeRef.current.style) {
          // Only apply scale effects, no blur
          const baseScale = 1 + Math.min(0.05, instantRotationSpeed * 0.003);
          const pulseScale =
            baseScale * (1 + Math.sin(progress * Math.PI * 12) * 0.01);
          universeRef.current.style.transform = `scale(${pulseScale})`;
          universeRef.current.style.transition = "transform 0.05s ease-out";
        }

        // Add dynamic tilt effect during spin based on current speed
        // More pronounced during acceleration, gentler during deceleration
        if (progress < 0.4) {
          // Intense dynamic tilt during acceleration phase
          // Use current rotation speed to create authentic physics feel
          const tiltBase = Math.min(1, instantRotationSpeed * 0.03) * 14;
          const tiltPhase = progress * Math.PI * 8;

          const intenseTiltX = Math.sin(tiltPhase) * tiltBase;
          const intenseTiltY = Math.cos(tiltPhase * 0.8) * (tiltBase * 0.8);

          universeRotateX.set(intenseTiltX);
          universeRotateY.set(intenseTiltY);
        } else {
          // Gradually stabilizing tilt during deceleration
          const stabilizingFactor = Math.max(
            0,
            1 - ((progress - 0.4) / 0.6) * 1.2
          );
          const currentPhase = rotationAmount * 0.2;

          const gentleTiltX = Math.sin(currentPhase) * 8 * stabilizingFactor;
          const gentleTiltY =
            Math.cos(currentPhase * 0.85) * 6 * stabilizingFactor;

          universeRotateX.set(gentleTiltX);
          universeRotateY.set(gentleTiltY);

          // Gradually return scale to normal with subtle settling motion
          if (universeRef.current.style && progress > 0.4) {
            const returnProgress = (progress - 0.4) / 0.6;
            const baseReturn = 1 + Math.max(0, 0.05 - returnProgress * 0.05);

            // Add subtle oscillation during deceleration for a more natural feel
            const settlingFactor = Math.pow(1 - returnProgress, 1.3) * 0.015;
            const settleScale =
              baseReturn +
              Math.sin(returnProgress * Math.PI * 4) * settlingFactor;

            universeRef.current.style.transform = `scale(${settleScale})`;

            // Adjust transition timing based on phase
            universeRef.current.style.transition =
              returnProgress > 0.8
                ? "transform 0.2s ease-out" // Smoother at the end
                : "transform 0.1s ease-out";
          }
        }

        // Add subtle perspective shift during spin
        // Makes the universe appear to get "closer" during high-speed parts
        const basePerspective = 1000; // Default perspective value
        const dynamicPerspective =
          basePerspective - Math.sin(progress * Math.PI) * 150;
        universePerspective.set(dynamicPerspective);
      }

      // Update each orb's angle with the enhanced rotation and layer-specific physics
      const newAngles = startAngles.map((angle, idx) => {
        // Add variance to each layer for more realistic group physics
        const layerIndex = idx % 3;

        // Apply sophisticated layer physics based on distance from center
        // Outer layers have more resistance and lag behind inner layers
        let inertiaFactor;
        if (progress < 0.2) {
          // During initial acceleration, outer layers lag significantly
          inertiaFactor =
            layerIndex === 0
              ? 1
              : layerIndex === 1
              ? 0.85 + progress * 0.5
              : 0.75 + progress * 0.6;
        } else if (progress < 0.7) {
          // During main spin, layers catch up but maintain slight variance
          inertiaFactor =
            layerIndex === 0
              ? 1
              : layerIndex === 1
              ? 0.93 + Math.sin(progress * Math.PI * 2) * 0.03
              : 0.89 + Math.sin(progress * Math.PI * 3) * 0.04;
        } else {
          // During deceleration, outer layers have more momentum and decelerate slower
          const decelProgress = (progress - 0.7) / 0.3;
          inertiaFactor =
            layerIndex === 0
              ? 1 - decelProgress * 0.1 // Inner layer slows down faster
              : layerIndex === 1
              ? 0.93 + decelProgress * 0.12 // Middle layer continues with momentum
              : 0.89 + decelProgress * 0.18; // Outer layer has most momentum
        }

        // Create unique wobble patterns for each orb during spin
        const orbSignature = (idx * 0.17) % 1; // Creates a unique value between 0-1 for each orb

        // Wobble intensity varies by spin phase
        const wobbleIntensity =
          progress < 0.3
            ? 0.07 * (1 - progress / 0.3) // Strong at start, fading by 30%
            : progress < 0.7
            ? 0.02 // Subtle during main spin
            : 0.04 * ((progress - 0.7) / 0.3); // Increases slightly during deceleration

        const wobbleFrequency = 9 + (idx % 4) + progress * 5; // Frequency increases with speed
        const uniqueWobble =
          Math.sin(
            progress * Math.PI * wobbleFrequency + orbSignature * Math.PI * 2.5
          ) * wobbleIntensity;

        // Self-rotation effect with improved physics
        // Speed varies based on rotation phase and layer position
        const selfRotationSpeed =
          layerIndex === 0
            ? 12 // Fastest for inner layer
            : layerIndex === 1
            ? 9 // Medium for middle layer
            : 7; // Slowest for outer layer

        let selfRotation;
        if (progress < 0.25) {
          // Initial accelerating self-rotation
          selfRotation =
            Math.pow(progress / 0.25, 1.8) * Math.PI * selfRotationSpeed;
        } else if (progress < 0.7) {
          // Main spin phase with consistent rotation
          const mainProgress = (progress - 0.25) / 0.45;
          selfRotation =
            Math.PI * selfRotationSpeed +
            mainProgress * Math.PI * selfRotationSpeed * 1.5;
        } else {
          // Deceleration with natural physics
          const decelProgress = (progress - 0.7) / 0.3;
          const baseRotation =
            Math.PI * selfRotationSpeed +
            0.45 * Math.PI * selfRotationSpeed * 1.5;

          // Add oscillation that diminishes as the orb settles
          const settlingOscillation =
            Math.sin(decelProgress * Math.PI * 3) *
            Math.pow(1 - decelProgress, 1.6) *
            0.7;

          selfRotation =
            baseRotation +
            (1 - Math.pow(decelProgress, 1.7)) * Math.PI * 3 + // Decay curve
            settlingOscillation; // Add oscillation
        }

        // Add phase shift to prevent synchronization
        const phaseShift = orbSignature * Math.PI * 2;
        const finalSelfRotation = selfRotation + phaseShift;

        return (
          angle +
          rotationAmount * inertiaFactor +
          uniqueWobble +
          finalSelfRotation
        );
      });

      setOrbitalAngles(newAngles);

      if (progress < 1) {
        spinAnimationId = requestAnimationFrame(animateSpin);
      } else {
        // Spinning complete
        setIsSpinning(false);
        setSpinResultIndex(randomIndex);

        // Gentle reset of any 3D effects with smooth transition
        // Don't snap back to zero instantly
        const resetTilt = () => {
          const currentX = universeRotateX.get();
          const currentY = universeRotateY.get();

          if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1) {
            universeRotateX.set(0);
            universeRotateY.set(0);
            return;
          }

          universeRotateX.set(currentX * 0.9);
          universeRotateY.set(currentY * 0.9);

          requestAnimationFrame(resetTilt);
        };

        resetTilt();

        // Clean up any applied styles
        if (universeRef.current?.style) {
          // Apply smooth transition for final style reset
          universeRef.current.style.transition = "transform 0.5s ease-out";

          // Remove any transformation
          setTimeout(() => {
            if (universeRef.current?.style) {
              universeRef.current.style.transform = "scale(1)";
            }

            // Reset any orb-specific styles
            categories.forEach((_, idx) => {
              const orbElement = document.getElementById(`orb-${idx}`);
              if (orbElement) {
                orbElement.style.transform = "";
              }
            });
          }, 50); // Short delay to ensure smooth transition
        }

        // Automatically hide the winning card after 4 seconds
        // But only if user isn't hovering over it
        setTimeout(() => {
          if (!isFloatingCardHovered) {
            setSpinResultIndex(null);
          }
        }, 4000);
      }
    };

    spinAnimationId = requestAnimationFrame(animateSpin);

    // Clean up animation if component unmounts during spin
    const spinTimerId = setTimeout(() => {
      cancelAnimationFrame(spinAnimationId);
    }, spinDuration);

    return () => {
      clearTimeout(spinTimerId);
      cancelAnimationFrame(spinAnimationId);
    };
  };

  // Auto-display floating message randomly
  useEffect(() => {
    const messageInterval = setInterval(() => {
      // Only show random message if no orb is being actively hovered and not spinning
      if (
        activeOrbIndex === null &&
        autoShowCard === null &&
        !isSpinning &&
        spinResultIndex === null
      ) {
        // Random index for message
        const randomIndex = Math.floor(Math.random() * categories.length);
        setRandomMessageOrbIndex(randomIndex);

        // Hide after 5 seconds
        setTimeout(() => {
          setRandomMessageOrbIndex(null);
        }, 5000);
      }
    }, 5000); // Show message every 5 seconds

    return () => clearInterval(messageInterval);
  }, [
    categories.length,
    activeOrbIndex,
    autoShowCard,
    isSpinning,
    spinResultIndex,
  ]);

  // Auto-display random category cards for brief periods
  useEffect(() => {
    const autoShowInterval = setInterval(() => {
      // Only activate if no user interaction is happening and not spinning
      if (
        activeOrbIndex === null &&
        randomMessageOrbIndex === null &&
        !isFloatingCardHovered &&
        !isSpinning &&
        spinResultIndex === null
      ) {
        const randomIndex = Math.floor(Math.random() * categories.length);
        setAutoShowCard(randomIndex);

        // Hide after 2 seconds
        setTimeout(() => {
          setAutoShowCard(null);
        }, 2000);
      }
    }, 7000); // Try to show a card every 7 seconds

    return () => clearInterval(autoShowInterval);
  }, [
    categories.length,
    activeOrbIndex,
    randomMessageOrbIndex,
    isFloatingCardHovered,
    isSpinning,
    spinResultIndex,
  ]);

  // Handle hover events for orbs with auto-hiding
  const handleOrbHover = (index: number, isEntering: boolean) => {
    if (isMobile || isSpinning) return;

    if (isEntering) {
      setActiveOrbIndex(index);
      setRecentlyHovered(index);

      // Automatically hide the card after 2 seconds if not actively hovered
      if (orbHideTimeouts.current[index]) {
        clearTimeout(orbHideTimeouts.current[index]);
      }

      orbHideTimeouts.current[index] = setTimeout(() => {
        if (activeOrbIndex === index && !isFloatingCardHovered) {
          setActiveOrbIndex(null);
        }
      }, 2000);
    } else if (!isFloatingCardHovered) {
      // Only hide immediately if the floating card is not being hovered
      setActiveOrbIndex(null);
    }
  };

  // Automatic orbital rotation animation
  useEffect(() => {
    if (isSpinning || isAnimationPaused) return;

    // Create continuous rotation animation
    let animationFrameId: number;
    const startTime = Date.now();
    // Update the last animation time reference
    lastAnimationTime.current = startTime;

    const animateOrbits = () => {
      const currentTime = Date.now();
      // Calculate elapsed time since animation started or resumed
      const elapsedTime =
        currentTime - lastAnimationTime.current + pausedElapsedTime.current;

      // Update each orb's position based on its layer and direction
      const newAngles = orbitalSystem.map((orbData, index) => {
        const { layer } = orbData;
        // Significantly reduced speed for a more realistic cosmic motion
        // Add subtle variation to each orb for less mechanical movement
        const variation = 1 + Math.sin(index * 0.7) * 0.2;
        // Even slower speed factor for more gentle, sophisticated rotation
        const baseSpeed = layer.speed * 0.000005 * variation; // Reduced from 0.000012
        // Add subtle pulsing to the speed based on time with longer oscillation period
        const pulseFactor = 1 + Math.sin(elapsedTime * 0.00006) * 0.12; // Reduced from 0.0001, reduced amplitude from 0.15
        const speed = baseSpeed * pulseFactor;

        return orbData.angle + elapsedTime * speed * layer.direction;
      });

      setOrbitalAngles(newAngles);

      // Add ethereal cosmic rotation to the entire universe
      if (universeRef.current && !isUniverseHovered) {
        // Very slow base rotation speed - further reduced
        const baseRotationSpeed = 0.000004; // Reduced from 0.000008
        // Add harmonic motion using multiple sine waves for more natural movement
        // Extended periods for more graceful motion
        const primaryWave = Math.sin(elapsedTime * baseRotationSpeed);
        const secondaryWave =
          Math.sin(elapsedTime * baseRotationSpeed * 0.4) * 0.35; // Reduced from 0.6 * 0.4
        const tertiaryWave =
          Math.sin(elapsedTime * baseRotationSpeed * 0.2) * 0.15; // Reduced from 0.3 * 0.2

        // Combine waves for more complex, organic motion
        const complexWaveX = primaryWave + secondaryWave;
        const complexWaveY = primaryWave * 0.6 + tertiaryWave; // Reduced from 0.7

        // Apply gentler rotation with combined harmonic motion
        universeRotateY.set(complexWaveX * 1.8); // Reduced from 2.2 degrees maximum rotation
        universeRotateX.set(complexWaveY * 1.5); // Reduced from 1.8 degrees maximum rotation
      }

      animationFrameId = requestAnimationFrame(animateOrbits);
    };

    animationFrameId = requestAnimationFrame(animateOrbits);

    // Cleanup animation frame on unmount or when spinning
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpinning, orbitalSystem, isUniverseHovered, isAnimationPaused]);

  // Generate a beautiful gradient color for each orb
  const getOrbColors = (
    index: number,
    totalOrbs: number,
    customColor?: string
  ): { primary: string; secondary: string; glow: string } => {
    if (customColor) {
      return {
        primary: customColor,
        secondary: customColor,
        glow: customColor,
      };
    }

    // Apple-inspired colors with dynamic hue distribution
    const baseHue = (index / totalOrbs) * 360;

    // Create sophisticated color variations with higher contrast for better visibility in light mode
    const primary = `hsl(${baseHue}, 85%, 55%)`;
    const secondary = `hsl(${(baseHue + 20) % 360}, 75%, 45%)`;
    const glow = `hsl(${baseHue}, 90%, 60%)`;

    return { primary, secondary, glow };
  };

  // Handle floating card hover state changes
  const handleFloatingCardHoverChange = (isHovered: boolean) => {
    setIsFloatingCardHovered(isHovered);

    // If spin result card is shown and user just stopped hovering it,
    // hide it after 1 second
    if (!isHovered && spinResultIndex !== null) {
      setTimeout(() => {
        setSpinResultIndex(null);
      }, 1000);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-8">
      <div
        className="relative flex items-center justify-center overflow-visible"
        style={{
          width: responsiveContainerSize,
          height: responsiveContainerSize,
          maxWidth: "calc(100vw - 32px)", // Ensure it doesn't overflow on small screens
          margin: "0 auto", // Center horizontally
        }}
        ref={universeRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsUniverseHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Subtle ambient glow for depth without dark background */}
        <motion.div
          className="absolute inset-[-10%] rounded-full opacity-40 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle, rgba(180,210,255,0.2) 0%, rgba(140,180,255,0.08) 50%, transparent 80%)",
              "radial-gradient(circle, rgba(180,210,255,0.25) 0%, rgba(140,180,255,0.1) 50%, transparent 80%)",
              "radial-gradient(circle, rgba(180,210,255,0.2) 0%, rgba(140,180,255,0.08) 50%, transparent 80%)",
            ],
            opacity: [0.4, 0.5, 0.4],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle quantum field particles replacing the stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={`quantum-particle-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: 1 + Math.random(),
              height: 1 + Math.random(),
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4,
              boxShadow: `0 0 ${1 + Math.random() * 2}px rgba(180,210,255,${
                0.4 + Math.random() * 0.4
              })`,
            }}
            animate={{
              opacity: [
                0.3 + Math.random() * 0.4,
                0.5 + Math.random() * 0.3,
                0.3 + Math.random() * 0.4,
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1 + Math.random() * 3,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Light energy waves - expanding rings */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={`energy-wave-${i}`}
            className="absolute rounded-full pointer-events-none z-0"
            style={{
              top: "50%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
              border: `1px solid rgba(140,180,255,${0.25 - i * 0.05})`,
              width: 20,
              height: 20,
            }}
            animate={{
              width: [20, responsiveContainerSize * 1.2],
              height: [20, responsiveContainerSize * 1.2],
              opacity: [0.5, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5,
            }}
          />
        ))}

        {/* Interactive universe container with 3D perspective */}
        <motion.div
          className="relative w-full h-full overflow-visible z-10"
          style={{
            transform: universeTransform,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Central container - transparent with just the spin control */}
          <motion.div
            className="absolute top-1/2 left-1/2 z-10 pointer-events-none"
            style={{
              width: responsiveContainerSize * 0.36,
              height: responsiveContainerSize * 0.36,
              x: -responsiveContainerSize * 0.18,
              y: -responsiveContainerSize * 0.18,
              background: "transparent",
            }}
          >
            {/* SpinControl - Placed in the center of the universe */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-auto">
              <CenterSpinControl
                onSpin={spinUniverse}
                isSpinning={isSpinning}
                containerSize={responsiveContainerSize * 0.36}
              />
            </div>
          </motion.div>

          {/* Ultra-realistic orbital paths with dynamic particle flow */}
          {orbitalSystem
            .filter((_, index) => index < 3)
            .map((_, layerIndex) => {
              // We only need to render one path per unique orbital layer
              const totalLayers = Math.min(3, Math.ceil(categories.length / 3));
              if (layerIndex >= totalLayers) return null;

              // Get the orbital config for this layer
              const orbitConfig = orbitalSystem[layerIndex * 3]?.layer;
              if (!orbitConfig) return null;

              const orbitRadius = orbitConfig.radius;

              return (
                <motion.div
                  key={`orbit-path-${layerIndex}`}
                  className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
                  style={{
                    width: orbitRadius * 2,
                    height: orbitRadius * 2,
                    x: -orbitRadius,
                    y: -orbitRadius,
                    border: "1.5px solid rgba(140,180,255,0.45)", // Increased opacity for better visibility in light mode
                    boxShadow:
                      "0 0 25px rgba(120,160,255,0.25), inset 0 0 25px rgba(120,160,255,0.25)",
                  }}
                >
                  {/* Orbital glow effect that moves along the track */}
                  <motion.div
                    className="absolute inset-0 rounded-full opacity-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(140,200,255,0.6) 50%, transparent 100%)",
                    }}
                    animate={{
                      opacity: [0, 0.7, 0],
                      rotate: orbitConfig.direction > 0 ? [0, 360] : [360, 0],
                    }}
                    transition={{
                      opacity: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatType: "reverse",
                      },
                      rotate: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                  />

                  {/* Enhanced particle flow along orbit path */}
                  {Array.from({ length: 7 }).map((_, particleIndex) => {
                    const particleOffset = (particleIndex / 7) * Math.PI * 2;
                    const size = 1 + Math.random() * 2;

                    return (
                      <motion.div
                        key={`orbit-particle-${layerIndex}-${particleIndex}`}
                        className="absolute rounded-full bg-white"
                        style={{
                          width: size,
                          height: size,
                          top: "50%",
                          left: "50%",
                          boxShadow: "0 0 6px rgba(255,255,255,0.9)",
                          zIndex: 5,
                        }}
                        animate={{
                          x: [
                            Math.cos(particleOffset) * orbitRadius,
                            Math.cos(particleOffset + Math.PI * 2) *
                              orbitRadius,
                          ],
                          y: [
                            Math.sin(particleOffset) * orbitRadius,
                            Math.sin(particleOffset + Math.PI * 2) *
                              orbitRadius,
                          ],
                          opacity: [0.6, 0.9, 0.6],
                          boxShadow: [
                            "0 0 6px rgba(255,255,255,0.8)",
                            "0 0 8px rgba(255,255,255,1)",
                            "0 0 6px rgba(255,255,255,0.8)",
                          ],
                        }}
                        transition={{
                          duration: 20 - layerIndex * 4,
                          repeat: Infinity,
                          ease: "linear",
                          opacity: {
                            duration: 3,
                            repeat: Infinity,
                            repeatType: "reverse",
                          },
                          boxShadow: {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                          },
                        }}
                      />
                    );
                  })}
                </motion.div>
              );
            })}

          {/* Category orbs that orbit around the universe */}
          {orbitalSystem.map((orbitalData, index) => {
            const { category, layer, initialX, initialY, orbSize } =
              orbitalData;
            const { primary, secondary, glow } = getOrbColors(
              index,
              categories.length,
              category.color
            );

            // Enhanced colors with better luminosity
            const enhancedPrimary = primary.replace("55%", "60%");
            const enhancedSecondary = secondary.replace("45%", "50%");
            const enhancedGlow = glow.replace("60%", "65%");

            // Determine if this orb should show interactive elements
            const isActive = activeOrbIndex === index;
            const showRandomMessage = randomMessageOrbIndex === index;
            const showAutoCard = autoShowCard === index;
            const showSpinResult = spinResultIndex === index;
            const isRecentlyHovered = recentlyHoveredOrbs[index];
            const shouldInteract =
              isActive ||
              showRandomMessage ||
              showAutoCard ||
              showSpinResult ||
              isRecentlyHovered;

            // Calculate the orbital motion
            const duration = 100 - layer.direction * layer.speed;
            const direction = layer.direction;
            const delay = index * 0.2; // Stagger the starting position

            return (
              <motion.div
                key={`category-orb-${category.slug}`}
                className="absolute top-1/2 left-1/2 pointer-events-auto z-20"
                style={{
                  width: orbSize,
                  height: orbSize,
                  cursor: "pointer",
                  x: isSpinning
                    ? initialX - orbSize / 2
                    : Math.cos(orbitalAngles[index]) * layer.radius -
                      orbSize / 2,
                  y: isSpinning
                    ? initialY - orbSize / 2
                    : Math.sin(orbitalAngles[index]) * layer.radius -
                      orbSize / 2,
                }}
                id={`orb-${index}`} // Add ID for dynamic styling
                animate={
                  isSpinning
                    ? {
                        x: [
                          initialX - orbSize / 2,
                          Math.cos(orbitalAngles[index]) * layer.radius -
                            orbSize / 2,
                        ],
                        y: [
                          initialY - orbSize / 2,
                          Math.sin(orbitalAngles[index]) * layer.radius -
                            orbSize / 2,
                        ],
                        scale: shouldInteract ? 1.15 : 1,
                      }
                    : {
                        scale: shouldInteract ? 1.15 : 1,
                      }
                }
                transition={{
                  x: {
                    duration: isSpinning ? 0.01 : 0.1,
                    ease: "linear",
                  },
                  y: {
                    duration: isSpinning ? 0.01 : 0.1,
                    ease: "linear",
                  },
                  scale: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
                // Interaction handlers
                onHoverStart={() => {
                  if (!isMobile && !isSpinning) {
                    setActiveOrbIndex(index);
                    setRecentlyHovered(index);

                    // Automatically hide the card after 2 seconds if not actively hovered
                    if (orbHideTimeouts.current[index]) {
                      clearTimeout(orbHideTimeouts.current[index]);
                    }

                    orbHideTimeouts.current[index] = setTimeout(() => {
                      if (activeOrbIndex === index && !isFloatingCardHovered) {
                        setActiveOrbIndex(null);
                      }
                    }, 2000);
                  }
                }}
                onHoverEnd={() => {
                  if (!isMobile && !isSpinning && !isFloatingCardHovered) {
                    setActiveOrbIndex(null);
                  }
                }}
                onClick={() => {
                  if (isSpinning) return;

                  if (isMobile) {
                    setActiveOrbIndex(activeOrbIndex === index ? null : index);
                    if (activeOrbIndex !== index) {
                      setRecentlyHovered(index);
                    }
                  } else {
                    navigateToCategory(index);
                  }
                }}
              >
                {/* Main orb body with beautiful glassy effect */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${enhancedPrimary}, ${enhancedSecondary})`,
                    boxShadow: shouldInteract
                      ? `0 0 25px ${enhancedGlow}90, 0 0 10px ${enhancedGlow}70`
                      : `0 0 15px ${enhancedGlow}40`,
                    border: shouldInteract
                      ? `1.5px solid rgba(255,255,255,0.5)`
                      : `1px solid rgba(255,255,255,0.3)`,
                  }}
                  whileHover={{
                    boxShadow: `0 0 30px ${enhancedGlow}90, 0 0 15px ${enhancedGlow}70`,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                >
                  {/* Glossy highlight */}
                  <div
                    className="absolute w-[90%] h-[90%] rounded-full top-[5%] left-[5%]"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 50%, transparent 70%)`,
                      opacity: 0.7,
                    }}
                  />

                  {/* Energy core */}
                  <motion.div
                    className="absolute w-[60%] h-[60%] top-[20%] left-[20%] rounded-full"
                    style={{
                      background: `radial-gradient(circle, white 0%, ${enhancedPrimary} 60%, transparent 100%)`,
                      boxShadow: `0 0 15px ${enhancedPrimary}`,
                    }}
                    animate={{
                      opacity: [0.7, 0.9, 0.7],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Category identifier */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <span
                      className="text-white font-bold text-center"
                      style={{
                        fontSize:
                          orbSize < 30 ? "9px" : orbSize < 40 ? "12px" : "16px",
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                        transform: "translateZ(5px)",
                      }}
                    >
                      {category.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </motion.div>

                {/* Particle effects around orb */}
                {Array.from({ length: 3 }).map((_, i) => {
                  const particleSize = 2 + i;
                  const orbitDistance = orbSize * 0.7 + i * 5;
                  const speed = 2 + i * 0.5;

                  return (
                    <motion.div
                      key={`particle-${index}-${i}`}
                      className="absolute top-1/2 left-1/2 rounded-full"
                      style={{
                        width: particleSize,
                        height: particleSize,
                        x: -particleSize / 2,
                        y: -particleSize / 2,
                        background: enhancedPrimary,
                        boxShadow: `0 0 ${
                          particleSize * 2
                        }px ${enhancedPrimary}`,
                        zIndex: 5,
                        opacity: shouldInteract ? 0.9 : 0.7,
                      }}
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: isSpinning ? speed * 0.3 : speed,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <motion.div
                        className="absolute"
                        style={{
                          width: particleSize,
                          height: particleSize,
                          transformOrigin: "center",
                          opacity: shouldInteract ? 0.9 : 0.7,
                        }}
                      >
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: particleSize,
                            height: particleSize,
                            x: orbitDistance,
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

                {/* Energy wave ring animation */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: `1px solid ${enhancedPrimary}80`,
                    opacity: shouldInteract ? 0.8 : 0.5,
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: shouldInteract ? [0.8, 0.3, 0.8] : [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Message Cards */}
      <AnimatePresence>
        {orbitalSystem.map((orbData, index) => {
          const { category, layer, initialX, initialY } = orbData;
          const isActive = activeOrbIndex === index;
          const showRandomMessage = randomMessageOrbIndex === index;
          const showAutoCard = autoShowCard === index;
          const showSpinResult = spinResultIndex === index;
          const isRecentlyHovered = recentlyHoveredOrbs[index];

          // Only show the floating card if this orb is active, showing message, auto-showing, spin result, or recently hovered
          if (
            !isActive &&
            !showRandomMessage &&
            !showAutoCard &&
            !showSpinResult &&
            !isRecentlyHovered
          )
            return null;

          // Get dynamic card position based on current orb position
          const cardPosition = getFloatingCardPosition(index, showSpinResult);

          // Calculate the orb position for the connection line
          // Only provide orbPosition if it's not a winning card
          const orbPosition = showSpinResult
            ? undefined
            : {
                x: Math.cos(orbitalAngles[index]) * layer.radius,
                y: Math.sin(orbitalAngles[index]) * layer.radius,
              };

          // Determine message type and styling
          const isRandomMessage =
            (showRandomMessage && !isActive) || showSpinResult;

          // Get colors for the card
          const { primary, secondary } = getOrbColors(
            index,
            categories.length,
            category.color
          );

          // Determine if card is in top half of the screen for arrow placement
          // For winning cards, this doesn't matter as they have no connection line
          const isTopPositioned = showSpinResult
            ? false
            : orbPosition
            ? orbPosition.y < 0
            : false;

          return (
            <FloatingMessageCard
              key={`floating-card-${category.slug}`}
              title={category.name}
              description={`View all ${category.name.toLowerCase()} category products...`}
              position={cardPosition}
              orbPosition={orbPosition}
              width={
                isMobile
                  ? Math.min(120, responsiveContainerSize * 0.3)
                  : Math.min(160, responsiveContainerSize * 0.4)
              }
              isRandomMessage={isRandomMessage}
              primaryColor={primary}
              secondaryColor={secondary}
              onButtonClick={() => navigateToCategory(index)}
              onCardHoverStart={() => {
                handleFloatingCardHoverChange(true);
                // Clear hide timeout for this orb when hovering the card
                if (orbHideTimeouts.current[index]) {
                  clearTimeout(orbHideTimeouts.current[index]);
                }
              }}
              onCardHoverEnd={() => {
                handleFloatingCardHoverChange(false);

                // For non-spin result cards, set normal timeout
                if (!showSpinResult) {
                  // Set a timeout to hide card if not hovered again
                  orbHideTimeouts.current[index] = setTimeout(() => {
                    if (activeOrbIndex === index) {
                      setActiveOrbIndex(null);
                    }
                  }, 500);
                }
                // For spin result cards, the hide logic is handled in handleFloatingCardHoverChange
              }}
              isSpinResult={showSpinResult}
              isTopPositioned={isTopPositioned}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Centered SpinControl component specifically for the center of the universe
const CenterSpinControl = ({
  onSpin,
  isSpinning,
  containerSize = 140,
}: {
  onSpin: () => void;
  isSpinning: boolean;
  containerSize?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nucleusControls = useAnimation();
  const containerControls = useAnimation();

  // Calculate sizes based on container
  const nucleusSize = containerSize * 0.22;
  const electronOrbitRadius = containerSize * 0.45;
  // Maximum orbit expansion on hover - larger for more expansive effect
  const maxOrbitExpansion = containerSize * 1.4;

  // Auto display floating text prompt at intervals
  useEffect(() => {
    if (isSpinning) return;

    const showPromptInterval = setInterval(() => {
      setShowPrompt(true);

      // Hide after 2.5 seconds
      setTimeout(() => {
        setShowPrompt(false);
      }, 2500);
    }, 6000); // Show every 6 seconds (3s visible, 3s hidden)

    return () => clearInterval(showPromptInterval);
  }, [isSpinning]);

  // Animate the nucleus and container on spin
  useEffect(() => {
    if (isSpinning) {
      // Animate nucleus
      nucleusControls.start({
        boxShadow: [
          "0 0 45px 20px rgba(255,255,255,0.9)",
          "0 0 60px 25px rgba(180,220,255,1)",
          "0 0 45px 20px rgba(255,255,255,0.9)",
        ],
        scale: [1, 1.08, 1],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
        },
      });

      // Animate the entire container for realistic spin effect
      containerControls.start({
        rotate: 360,
        transition: {
          duration: 3,
          ease: [0.3, 0.1, 0.3, 1], // Custom easing for realistic physics
        },
      });
    } else if (isHovered) {
      nucleusControls.start({
        boxShadow: "0 0 40px 15px rgba(180,220,255,0.8)",
        scale: 1.05,
      });

      // Reset container rotation when not spinning
      containerControls.start({ rotate: 0 });
    } else {
      nucleusControls.start({
        boxShadow: "0 0 30px 10px rgba(180,220,255,0.6)",
        scale: 1,
      });

      // Reset container rotation when not spinning
      containerControls.start({ rotate: 0 });
    }
  }, [isSpinning, isHovered, nucleusControls, containerControls]);

  return (
    <motion.div
      ref={containerRef}
      className="relative"
      style={{
        width: containerSize,
        height: containerSize,
        perspective: 1200,
        transformStyle: "preserve-3d",
        transformOrigin: "center center",
      }}
      animate={containerControls}
      initial={{ rotate: 0 }}
    >
      {/* Expansive 3D Orbital System - 7 orbital paths with varying angles */}
      {Array.from({ length: 7 }).map((_, orbitIndex) => {
        const baseOrbitRadius =
          electronOrbitRadius + orbitIndex * containerSize * 0.05;
        const rotationDuration =
          12 + (orbitIndex % 3 === 0 ? 4 : orbitIndex % 3 === 1 ? 7 : 5);
        const rotationDirection = orbitIndex % 2 === 0 ? 1 : -1;
        const electronCount = 2 + orbitIndex;

        // 3D rotation angles for each orbit to create a more spatial distribution
        const rotateX = 15 + ((orbitIndex * 12) % 70);
        const rotateY = 20 + ((orbitIndex * 17) % 75);
        const rotateZ = (orbitIndex * 25) % 90;

        // Expansion factor based on hover state - orbits expand outward when hovered
        // More controlled expansion to prevent overflow
        const expansionFactor = isHovered
          ? orbitIndex === 0
            ? 1.1
            : orbitIndex === 1
            ? 1.2
            : orbitIndex === 2
            ? 1.3
            : orbitIndex === 3
            ? 1.4
            : orbitIndex === 4
            ? 1.5
            : orbitIndex === 5
            ? 1.6
            : 1.7
          : 1;

        // Calculate actual orbit radius with expansion
        const orbitRadius = baseOrbitRadius * expansionFactor;

        // For outer orbits when hovered, create an expanding effect
        // Limit maximum expansion to prevent overflow
        const maxRadius =
          isHovered && orbitIndex > 1
            ? Math.min(maxOrbitExpansion, orbitRadius)
            : orbitRadius;

        return (
          <motion.div
            key={`electron-orbit-${orbitIndex}`}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: maxRadius * 2,
              height: maxRadius * 2,
              x: -maxRadius,
              y: -maxRadius,
              border: `${0.5 + orbitIndex * 0.15}px solid rgba(140,180,255,${
                0.4 - orbitIndex * 0.04
              })`,
              boxShadow: `0 0 8px rgba(140,200,255,0.15)`,
              transformStyle: "preserve-3d",
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
              opacity: isHovered ? 0.85 : 0.6,
              transition:
                "width 0.6s cubic-bezier(0.22, 1, 0.36, 1), height 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            animate={{
              rotate: rotationDirection > 0 ? 360 : -360,
              opacity: isHovered ? [0.85, 0.7, 0.85] : [0.6, 0.4, 0.6],
            }}
            transition={{
              rotate: {
                duration: isSpinning
                  ? rotationDuration * 0.25
                  : rotationDuration,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          >
            {/* Electrons */}
            {Array.from({ length: electronCount }).map((_, electronIndex) => {
              const angle = (electronIndex / electronCount) * Math.PI * 2;
              const electronSize = 1.8 + orbitIndex * 0.4;
              const electronOpacity = isHovered ? 0.9 : 0.75;

              // Only show electrons on the first 4 orbits to avoid visual clutter
              if (orbitIndex > 3 && electronIndex % 2 !== 0) return null;

              return (
                <motion.div
                  key={`electron-${orbitIndex}-${electronIndex}`}
                  className="absolute rounded-full"
                  style={{
                    width: electronSize,
                    height: electronSize,
                    top: "50%",
                    left: "50%",
                    marginLeft: -electronSize / 2,
                    marginTop: -electronSize / 2,
                    background: `rgba(255,255,255,${electronOpacity})`,
                    boxShadow: `0 0 ${
                      electronSize * 3
                    }px ${electronSize}px rgba(180,220,255,0.9)`,
                    transform: `rotate(${angle}rad) translateX(${maxRadius}px)`,
                    zIndex: 5,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 ${
                        electronSize * 3
                      }px ${electronSize}px rgba(180,220,255,0.7)`,
                      `0 0 ${electronSize * 4}px ${
                        electronSize * 1.2
                      }px rgba(180,220,255,0.9)`,
                      `0 0 ${
                        electronSize * 3
                      }px ${electronSize}px rgba(180,220,255,0.7)`,
                    ],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.5 + Math.random(),
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: electronIndex * 0.2,
                  }}
                />
              );
            })}

            {/* Energy trail effect */}
            <motion.div
              className="absolute rounded-full opacity-0"
              style={{
                inset: 0,
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(140,200,255,0.5) 50%, transparent 100%)",
              }}
              animate={{
                opacity: [0, 0.6, 0],
                rotate: rotationDirection > 0 ? [0, 360] : [360, 0],
              }}
              transition={{
                opacity: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse",
                },
                rotate: {
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            />
          </motion.div>
        );
      })}

      {/* Cross-cutting orbital planes with reduced opacity */}
      {Array.from({ length: 3 }).map((_, planeIndex) => {
        const planeSize = electronOrbitRadius * 2;
        const planeOpacity = 0.12 - planeIndex * 0.02;
        const rotateX = 15 + planeIndex * 25;
        const rotateY = 75 - planeIndex * 30;

        return (
          <motion.div
            key={`orbital-plane-${planeIndex}`}
            className="absolute top-1/2 left-1/2"
            style={{
              width: isHovered ? planeSize * 1.3 : planeSize,
              height: isHovered ? planeSize * 1.3 : planeSize,
              x: isHovered ? -planeSize * 0.65 : -planeSize * 0.5,
              y: isHovered ? -planeSize * 0.65 : -planeSize * 0.5,
              background: `radial-gradient(ellipse at center, rgba(140,200,255,${planeOpacity}) 0%, rgba(140,200,255,${
                planeOpacity * 0.5
              }) 50%, transparent 80%)`,
              borderRadius: "50%",
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: "preserve-3d",
              transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              mixBlendMode: "screen",
            }}
            animate={{
              rotate: planeIndex % 2 === 0 ? [0, 360] : [360, 0],
              opacity: isHovered
                ? [planeOpacity * 1.5, planeOpacity, planeOpacity * 1.5]
                : [planeOpacity, planeOpacity * 0.7, planeOpacity],
            }}
            transition={{
              rotate: {
                duration: 60 + planeIndex * 20,
                repeat: Infinity,
                ease: "linear",
              },
              opacity: {
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          />
        );
      })}

      {/* Subtler quantum field visualization */}
      <motion.div
        className="absolute top-1/2 left-1/2 rounded-full overflow-hidden pointer-events-none"
        style={{
          width: isHovered ? containerSize * 1.3 : containerSize * 1.1,
          height: isHovered ? containerSize * 1.3 : containerSize * 1.1,
          x: isHovered ? -containerSize * 0.65 : -containerSize * 0.55,
          y: isHovered ? -containerSize * 0.65 : -containerSize * 0.55,
          opacity: 0.12,
          background:
            "radial-gradient(circle at center, rgba(180,220,255,0.12) 0%, rgba(180,220,255,0.04) 50%, transparent 80%)",
          transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          mixBlendMode: "screen",
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.12, 0.16, 0.12],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        {/* Quantum particle effect */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`quantum-particle-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: 1 + Math.random(),
              height: 1 + Math.random(),
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.3,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 20, 0],
              y: [0, (Math.random() - 0.5) * 20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>

      {/* Nucleus button - with fixed positioning */}
      <motion.button
        ref={buttonRef}
        className="absolute top-1/2 left-1/2 flex items-center justify-center rounded-full focus:outline-none z-50"
        style={{
          width: nucleusSize,
          height: nucleusSize,
          position: "absolute",
          x: -nucleusSize / 2,
          y: -nucleusSize / 2,
          perspective: 1000,
          translateX: "0px",
          translateY: "0px",
        }}
        onClick={onSpin}
        disabled={isSpinning}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Nucleus core - with better glow */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden"
          animate={nucleusControls}
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,255,255,1) 0%, rgba(230,240,255,0.95) 40%, rgba(180,210,255,0.9) 70%, rgba(140,180,240,0.85) 100%)",
            boxShadow: "0 0 30px 10px rgba(180,220,255,0.6)",
            border: "1px solid rgba(255,255,255,0.95)",
          }}
        >
          {/* Quantum texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
              opacity: 0.5,
              mixBlendMode: "overlay",
            }}
          />

          {/* Energy core */}
          <motion.div
            className="absolute inset-[15%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(160,200,255,0.8) 70%, transparent 100%)",
            }}
            animate={{
              scale: [0.9, 1.1, 0.9],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          {/* Particle fusion effect */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={`nucleus-particle-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: 3 + Math.random() * 2,
                height: 3 + Math.random() * 2,
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                opacity: 0.9,
                boxShadow: "0 0 5px rgba(255,255,255,0.9)",
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 10, 0],
                y: [0, (Math.random() - 0.5) * 10, 0],
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </motion.div>

        {/* Energy pulse rings */}
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={`pulse-ring-${i}`}
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid rgba(255,255,255,0.9)",
              opacity: 0,
            }}
            animate={{
              scale: [1, 2 + i * 0.4],
              opacity: [0.8, 0],
            }}
            transition={{
              duration: 1.5 + i * 0.4,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </motion.button>

      {/* Floating instruction prompt */}
      <AnimatePresence>
        {showPrompt && !isSpinning && !isHovered && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[120%] pointer-events-none z-50"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                damping: 12,
                stiffness: 150,
              },
            }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <div
              className="relative px-3 py-1.5 rounded-full text-xs font-medium text-white"
              style={{
                background:
                  "linear-gradient(135deg, rgba(80,150,255,0.95), rgba(50,100,220,0.95))",
                boxShadow:
                  "0 4px 15px -3px rgba(50,100,220,0.7), 0 0 0 1px rgba(255,255,255,0.2) inset",
                whiteSpace: "nowrap",
                backdropFilter: "blur(5px)",
              }}
            >
              <motion.span
                className="inline-block"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                Spin this Atom!
              </motion.span>

              {/* Connecting triangle element */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                style={{
                  background: "rgba(50,100,220,0.95)",
                  boxShadow: "2px 2px 5px -2px rgba(0,0,0,0.2)",
                }}
              />

              {/* Particle effects */}
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={`prompt-particle-${i}`}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: 2 + Math.random() * 2,
                    height: 2 + Math.random() * 2,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    boxShadow: "0 0 4px rgba(255,255,255,0.8)",
                  }}
                  animate={{
                    y: [0, -10],
                    opacity: [0.8, 0],
                    x: [0, (Math.random() - 0.5) * 10],
                  }}
                  transition={{
                    duration: 1 + Math.random(),
                    repeat: Infinity,
                    repeatDelay: Math.random(),
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
